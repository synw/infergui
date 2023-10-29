import { lm, mutateModel, stream, inferResults, updateModels, lmState } from "@/state";
import type { ModelTemplate, TempInferStats } from "@locallm/api";
import type { InferenceParams, InferenceResult } from "@locallm/types";
import { msg } from "./notify";

async function infer(_prompt: string, _template: string, _params: InferenceParams): Promise<InferenceResult> {
  stream.value = "";
  const paramDefaults = {
    template: _template,
    ..._params,
  };
  const completionParams: InferenceParams = { ...paramDefaults };
  if (completionParams.stop) {
    if (completionParams.stop.length == 0) {
      delete completionParams.stop;
    }
  }
  const resEl = document.getElementById("infer-block") as HTMLElement;
  let respData: InferenceResult = {
    text: "",
    stats: {
      thinkingTime: 0,
      thinkingTimeFormat: "",
      inferenceTime: 0,
      emitTime: 0,
      emitTimeFormat: "",
      totalTime: 0,
      totalTimeFormat: "",
      tokensPerSecond: 0,
      totalTokens: 0,
    }
  };

  lm.onToken = (token: string) => {
    stream.value = stream.value + token;
    resEl.scrollTop = resEl.scrollHeight;
    ++inferResults.totalTokens
  }
  lm.onStartEmit = (s: TempInferStats) => {
    lmState.isStreaming = true;
    //console.log("Start emit", s);
  };
  lm.onError = (msg: string) => {
    lmState.isStreaming = true;
    lmState.isRunning = true;
    console.error("ERROR", msg)
  };
  lmState.isRunning = true;
  respData = await lm.infer(_prompt, completionParams)
  lmState.isStreaming = false;
  lmState.isRunning = false;
  return respData
}

async function abort() {
  await lm.abort();
}

async function loadModels() {
  await lm.modelsInfo();
  const mt: Record<string, ModelTemplate> = {};
  lm.models.forEach((mc) => {
    mt[mc.name] = {
      name: mc.template ?? "unknown",
      ctx: mc.ctx ?? 2048,
    }
  });
  // update state
  updateModels(mt);
  if (lm.model.name.length > 0) {
    //console.log("LOAD", lm.model)
    mutateModel(lm.model, true);
  }
}

async function loadTasks(): Promise<Array<Record<string, any>>> {
  //return await lm.loadTasks();
  return []
}

async function loadTask(path: string): Promise<void> {
  // return await lm.loadTask(path)

  /*const payload = {
    path: path
  }
  let task: Task = {
    name: "",
    template: "",
    modelConf: {} as ModelConf,
  };
  const res = await lm.post<Record<string, any>>("/task/read", payload);
  if (res.ok) {
    //console.log("DATA", JSON.stringify(res.data, null, "  "));
    task = {
      name: res.data.model,
      template: res.data.template,
      modelConf: res.data.modelConf
    }
    if ("inferParams" in res.data) {
      task.inferParams = res.data.inferParams;
    }
  }
  return task*/
}

async function selectModel(name: string, ctx: number, gpu_layers?: number, load_template: boolean = true) {
  try {
    await lm.loadModel(name, ctx, "", gpu_layers);
  } catch (e) {
    if (e == "Error: the model is already loaded") {
      msg.warn("The model is already loaded", "The model has already been loaded");
      return
    }
  }
  mutateModel({ name: name, ctx: ctx, gpu_layers: gpu_layers }, load_template);
}

export { infer, abort, loadModels, selectModel, loadTasks, loadTask }