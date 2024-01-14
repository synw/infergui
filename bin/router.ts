import path from 'path';
import fs from 'fs';
import Router from 'koa-router';
import { dirpath, koboldCmd } from './state.js';
import { listModels, loadModel } from './handlers.js';

const useLmRouter = (
  routes: Array<(r: Router) => void> = [],
) => {
  const router = new Router();

  const _routes = routes;
  _routes.forEach((f) => f(router));

  if (koboldCmd.value != "") {
    router.get('/models', listModels);
    router.post('/loadmodel', async (ctx, next) => {
      const data = ctx.request["body"];
      await loadModel(ctx, next, data);
    });
  } else {
    router.get('/models', (ctx, next) => {
      ctx.status = 404
    });
  }

  router.all('(.*)', async (ctx) => {
    ctx.status = 200;
    ctx.body = await fs.promises.readFile(path.join(dirpath, '../index.html'), 'utf8');
  });

  return router
}

export { useLmRouter }