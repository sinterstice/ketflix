export enum IPTSortOption {
    DATE = 'date',
    NAME = 'name',
    COMMENTS = 'comments',
    SIZE = 'size',
    COMPLETED = 'completed',
    SEEDERS = 'seeders',
    LEECHERS = 'leechers'
}

export interface IPTResult {
    name: string;
    url: string;
    category: string;
    categoryImg: string;
    meta: string;
    downloadLink: string;
    comments: number;
    size: string;
    completed: number;
    seeders: number;
    leechers: number;
}

