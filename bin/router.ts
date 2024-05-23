import path from 'path';
import fs from 'fs';
import Router from 'koa-router';
import { dirpath } from './state.js';

const useLmRouter = (
  routes: Array<(r: Router) => void> = [],
) => {
  const router = new Router();

  const _routes = routes;
  _routes.forEach((f) => f(router));

  router.all('(.*)', async (ctx) => {
    ctx.status = 200;
    ctx.body = await fs.promises.readFile(path.join(dirpath, '../index.html'), 'utf8');
  });

  return router
}

export { useLmRouter }