import { runLm } from "./cmds/execute.js";
import { koboldCmd } from "./state.js";


function loadLm(ctx: number, model: string, threads?: number, gpu_layers?: number) {
  const args = ["--contextsize", ctx.toString(), "--model", model];
  if (threads) {
    args.push("--threads", threads.toString());
  }
  if (gpu_layers) {
    args.push("--gpulayers", gpu_layers.toString())
  }
  args.push("--skiplauncher");
  //args.push("--debugmode", "1");
  runLm(koboldCmd.value, args, {});
}

export { loadLm }