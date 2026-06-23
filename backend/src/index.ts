import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { fileExists } from './fs';
import { port, repoRoot, frontendBasePath } from './variables';
import { sessionMiddleware } from './session';
import { api } from './routes/api';

const app = express();

app.use(morgan('tiny'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(sessionMiddleware());

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendBasePath, 'index.html'));
});

app.use('/api', api);

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
