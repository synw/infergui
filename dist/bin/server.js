#!/usr/bin/env node
import path from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import bodyParser from "koa-bodyparser";
import cors from '@koa/cors';
import { useLmRouter } from './router.js';
import { dirpath } from './state.js';
let env = "production";
const app = new Koa();
app.use(bodyParser());
if (env == "production") {
    app.use(serve(path.join(dirpath, '../')));
}
app.use(cors({
    credentials: true
}));
const router = useLmRouter();
app.use(router.routes()).use(router.allowedMethods());
process.on('SIGINT', async () => {
    process.exit(1);
});
process.on('SIGTERM', async () => {
    process.exit(1);
});
app.listen(process.env.PORT ?? 5183, () => {
    console.log('Please open localhost:5183 in a browser');
});
