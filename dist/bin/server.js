#!/usr/bin/env node
import path from 'path';
import Koa from 'koa';
import serve from 'koa-static';
import bodyParser from "koa-bodyparser";
import cors from '@koa/cors';
import { useLmRouter } from './router.js';
import { modelsDir, execPath, dirpath, koboldCmd } from './state.js';
import { argv } from 'process';
import { killLm } from './cmds/execute.js';
let env = "production";
if (argv.length > 2) {
    for (const arg of argv.slice(2, argv.length)) {
        if (arg.startsWith("-m=")) {
            const _path = arg.split("=")[1];
            if (_path.startsWith("/")) {
                modelsDir.value = _path;
            }
            else {
                modelsDir.value = path.join(execPath, _path);
            }
        }
        else if (arg.startsWith("-k=")) {
            koboldCmd.value = arg.split("=")[1];
        }
        else if (arg == "-d") {
            env = "dev";
        }
    }
}
if (koboldCmd.value != "") {
    if (modelsDir.value == "") {
        throw new Error("Provide a models directory path as argument: -m=/my/models/dir");
    }
}
//console.log("Cmd", koboldCmd.value);
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
    await killLm();
    process.exit(1);
});
process.on('SIGTERM', async () => {
    await killLm();
    process.exit(1);
});
app.listen(process.env.PORT ?? 5183, () => {
    console.log('Please open localhost:5183 in a browser');
});
