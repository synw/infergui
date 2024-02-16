import path from "path";
import { readModelsDir } from "./cmds/read_models.js";
import { loadLm } from "./lm.js";
import { isLmRunning, modelsDir } from "./state.js";
import { killLm } from "./cmds/execute.js";
async function listModels(ctx, next) {
    ctx.type = 'application/json';
    const models = readModelsDir(modelsDir.value);
    ctx.body = { "models": models };
    ctx.status = 200;
}
async function loadModel(ctx, next, data) {
    //console.log("LOADM, is running:", isLmRunning.value === true)
    if (isLmRunning.value === true) {
        await killLm();
    }
    const mpath = path.join(modelsDir.value, data.name);
    console.log("Loading model", data.name);
    loadLm(data.ctx, mpath, data.threads, data.gpu_layers);
    ctx.status = 204;
}
export { listModels, loadModel };
