import { getLm, mutateModel, stream, inferResults, updateModels, lmState } from "@/state";
import { Lm, type TempInferStats } from "@locallm/api";
import type { InferenceParams, InferenceResult, ModelTemplate } from "@locallm/types";
import { msg } from "./notify";
import { LmBackend } from "@/interfaces";

async function probeBackend(backends: Array<LmBackend>): Promise<{ lm: Lm, backend: LmBackend } | null> {
  //console.log("Probing backends", backends);
  for (const [k, v] of Object.entries(backends)) {
    const _lm = new Lm({
      providerType: v.providerType,
      serverUrl: v.serverUrl,
      apiKey: v.apiKey,
      onToken: (t) => stream.value += t,
    });
    //console.log("Probing", v)
    switch (v.providerType) {
      case "llamacpp":
        try {
          await _lm.loadModel("");
          console.log(`Provider ${v.name} up`);
          return { lm: _lm, backend: v }
        } catch (e) {
          console.log(`Provider ${v.name} down`, e)
        }
        break;
      case "goinfer":
        try {
          await _lm.modelsInfo();
          console.log(`Provider ${v.name} up`);
          return { lm: _lm, backend: v }
        } catch (e) {
          console.log(`Provider ${v.name} down`, e)
        }
        break;
      case "koboldcpp":
        try {
          await _lm.loadModel("");
          if (_lm.model.name.length > 0) {
            console.log(`Provider ${v.name} up`)
            return { lm: _lm, backend: v }
          } else {
            console.log(`Provider ${v.name} down`)
          }
        } catch (e) {
          console.log(`Provider ${v.name} down`, e)
        }
        break;
      default:
        throw new Error("Unknown provider type")
    }
  }
  return null
}

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

  const lm = getLm();

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
  //console.log("PARAMS", JSON.stringify(completionParams, null, "  "));
  lmState.isRunning = true;
  respData = await lm.infer(_prompt, completionParams)
  lmState.isStreaming = false;
  lmState.isRunning = false;
  return respData
}

async function abort() {
  const lm = getLm();
  await lm.abort();
}

async function loadModels() {
  const lm = getLm();
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
    const lm = getLm();
    await lm.loadModel(name, ctx, "", gpu_layers);
  } catch (e) {
    if (e == "Error: the model is already loaded") {
      msg.warn("The model is already loaded", "The model has already been loaded");
      return
    }
  }
  mutateModel({ name: name, ctx: ctx, gpu_layers: gpu_layers }, load_template);
}

export { infer, abort, loadModels, selectModel, loadTasks, loadTask, probeBackend }