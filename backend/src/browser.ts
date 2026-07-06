import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';
import { IPTSortOption, IPTResult } from '../../types/shared';

let browser: Browser;

export class BrowserError extends Error {
    public url: string;
    public html: string;
    public consoleLog: string;

    constructor(message: string, url: string, html: string, consoleLog: string) {
        super(message);
        this.url = url;
        this.html = html;
        this.consoleLog = consoleLog;
    }
}

export const searchTracker = async (
    search: string, 
    sort: IPTSortOption = IPTSortOption.DATE,
    offset: number = 1
): Promise<{ pageCount: number, results: IPTResult[] }> => {
    let browserLog = '';

    if (!browser) {
        browser = await puppeteer.launch();
    }

    const page = await browser.newPage();

    page.on('console', msg => browserLog += `${msg.text()}\n`);

    const currentUrl = (await page.goto('https://iptorrents.com'))?.url();
    
    if (currentUrl?.endsWith('login.php')) {
        await page.locator('#username').fill(process.env.IPTORRENTS_USER);
        await page.locator('#password').fill(process.env.IPTORRENTS_PASS);
        await page.locator('form button[type="submit"]').click();
        await page.waitForNavigation({ timeout: 10000 });

        if (!page.url().endsWith('/t')) {
            throw new BrowserError('Error logging in', page.url(), await page.content(), browserLog);
        }
    }

    const url = `https://iptorrents.com?q=${search};o=${sort};p=${offset}`;
    console.log(`Searching with ${url}`);

    await page.goto(url);
    const noTorrentsFound = await page.$('#torrents td h1');

    if (noTorrentsFound) {
        return { pageCount: 0, results: [] };
    }

    const paginationText = await page.$eval('.pagination .page_nav .single:last-child', (el) => el.textContent);
    const [ , pageCountStr ] = paginationText.split(' of ');

    if (!paginationText || !pageCountStr) {
        throw new BrowserError('Error getting pagination count', page.url(), await page.content(), browserLog);
    }

    const pageCount = parseInt(pageCountStr);

    const results = await page.$$eval('#torrents tbody tr', (rows: HTMLElement[]) => {
        const result = [];

        let i = 0;
        for (const row of rows) {
            const els = Array.from(row.querySelectorAll('td'));

            const [ categoryEl, nameAndMetaEl, , downloadLinkEl, commentsEl, sizeEl, completedEl, seedersEl, leechersEl ] = els;

            const name = nameAndMetaEl?.querySelector('a')?.textContent;
            const url = nameAndMetaEl?.querySelector('a')?.getAttribute('href');
            const category = categoryEl?.querySelector('img')?.getAttribute('alt');
            const categoryImg = categoryEl?.querySelector('img')?.getAttribute('src');
            const meta = nameAndMetaEl?.querySelector('.sub')?.textContent;
            const downloadLink = downloadLinkEl?.querySelector('a')?.getAttribute('href');
            const comments = parseInt(commentsEl?.querySelector('a')?.innerText || '');
            const size = sizeEl?.textContent;
            const completed = parseInt(completedEl?.textContent || '');
            const seeders = parseInt(seedersEl?.textContent || '');
            const leechers = parseInt(leechersEl?.textContent || '');

            if (!name || 
                !url || 
                !category || 
                !categoryImg || 
                !meta || 
                !downloadLink || 
                !size ||
                comments === undefined || 
                Number.isNaN(comments) || 
                completed === undefined ||
                Number.isNaN(completed) || 
                seeders === undefined ||
                Number.isNaN(seeders) || 
                leechers === undefined ||
                Number.isNaN(leechers)) {

                throw new Error(`Error parsing table HTML at row ${i}`);
            }

            i++;
            result.push({
                name,
                url,
                category,
                categoryImg,
                meta,
                downloadLink,
                comments,
                size,
                completed,
                seeders,
                leechers
            });
        }

        return result;
    });

    return { pageCount, results };
};
