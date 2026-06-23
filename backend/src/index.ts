import express from 'express';
import path from 'path';
import { packageDirectorySync as pkgDir } from 'package-directory';
import { assert } from './util';
import { fileExists } from './fs';

const app = express();
const port = process.env.PORT || 3000;
const repoRoot = pkgDir(); assert(typeof repoRoot === 'string');
const frontendBasePath = path.join(repoRoot, 'frontend/build');

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendBasePath, 'index.html'));
});

app.get('*', async (req, res) => {
    const filePath = path.join(frontendBasePath, req.path);
    if (await fileExists(filePath)) {
        res.sendFile(filePath);
    } else {
        if (req.accepts('html')) {
            res.redirect('/');
        } else {
            res.status(404).send('Not found');
        }
    }
});

app.listen(port, () => {
    console.log('App started');
});
