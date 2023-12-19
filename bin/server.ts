#!/usr/bin/env node
import path from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import cors from '@koa/cors';
import { useLmRouter } from './router.js';
import { dirpath } from './state.js';

const app = new Koa();
const router = useLmRouter();

app.use(cors({
  credentials: true
}));

app.use(serve(path.join(dirpath, '../')));

app.use(router.routes()).use(router.allowedMethods());

app.listen(5183, () => {
  console.log('Server running on port 5183');
});