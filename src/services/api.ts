import { getLm, mutateModel, stream, inferResults, updateModels, lmState, hasModelsServer, models } from "@/state";
import { Lm } from "@locallm/api";
import type { InferenceParams, InferenceResult, ModelTemplate } from "@locallm/types";
//import { Lm } from "../packages/locallm/api";
//import type { InferenceParams, InferenceResult, ModelTemplate } from "../packages/types/interfaces";
import { LmBackend } from "@/interfaces";
import { useApi } from "restmix";

const api = useApi({
  serverUrl: "http://localhost:5183"
})

async function probeModelsServer(): Promise<boolean> {
  let isUp = false;
  const res = await api.get<{ models: Array<string> }>("/models");
  if (res.ok) {
    isUp = true;
    hasModelsServer.value = true;
    res.data.models.forEach((m) => models[m] = { name: "unknown", ctx: 2048 });
    //console.log("MODELS:", res.data);
  } else {
    console.log("No models server found")
  }
  return isUp
}


async function probeBackend(_backend: LmBackend): Promise<{ lm: Lm, backend: LmBackend } | null> {
  const _lm = new Lm({
    providerType: _backend.providerType,
    serverUrl: _backend.serverUrl,
    apiKey: _backend.apiKey,
    onToken: (t) => stream.value += t,
  });
  //console.log("LM", JSON.stringify(_lm.provider, null, "  "));

  //console.log("Probing", v)
  switch (_backend.providerType) {
    case "llamacpp":
      try {
        await _lm.info();
        console.log(`Provider ${_backend.name} up`);
        return { lm: _lm, backend: _backend }
      } catch (e) {
        console.log(`Provider ${_backend.name} down`, e)
      }
      break;
    case "koboldcpp":
      try {
        await _lm.info();
        if (_lm.model.name.length > 0) {
          console.log(`Provider ${_backend.name} up`)
          return { lm: _lm, backend: _backend }
        } else {
          console.log(`Provider ${_backend.name} down`)
        }
      } catch (e) {
        console.log(`Provider ${_backend.name} down`, e)
      }
      break;
    case "ollama":
      try {
        await _lm.modelsInfo();
        console.log(`Provider ${_backend.name} up`)
        return { lm: _lm, backend: _backend }
      } catch (e) {
        console.log(`Provider ${_backend.name} down`, e)
      }
      break;
    default:
      throw new Error("Unknown provider type")
  }
  return null
}


async function probeLocalBackends(backends: Array<LmBackend>): Promise<{ lm: Lm, backend: LmBackend } | null> {
  //console.log("Probing backends", backends);
  for (const v of Object.values(backends)) {
    // probe only local backends
    if (!v.serverUrl.includes("localhost")) {
      continue
    }
    const res = await probeBackend(v);
    if (res) {
      return res
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
    },
    data: {},
  };

  const _lm = getLm();

  _lm.onToken = (token: string) => {
    //sconsole.log(`>>>${token}<<<`);
    stream.value = stream.value + token;
    resEl.scrollTop = resEl.scrollHeight;
    ++inferResults.totalTokens
  }
  _lm.onStartEmit = (s) => {
    lmState.isStreaming = true;
    //console.log("Start emit", s);
  };
  _lm.onError = (msg: string) => {
    lmState.isStreaming = true;
    lmState.isRunning = true;
    console.error("ERROR", msg)
  };
  //console.log("APIPARAMS", JSON.stringify(completionParams, null, "  "));
  lmState.isRunning = true;
  respData = await _lm.infer(_prompt, completionParams)
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
  // update state
  updateModels(mt);
  if (lm.model.name.length > 0) {
    //console.log("LOAD", lm.model)
    mutateModel(lm.model);
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

async function selectModelModelsServer(name: string, ctx: number, threads?: number, gpu_layers?: number) {
  const res = await api.post<Record<string, any>>(
    "/loadmodel",
    { name: name, ctx: ctx, threads: threads, gpu_layers: gpu_layers }
  );
  if (res.ok) {
    console.log("Model", name, "loaded", `(ctx: ${ctx})`);
  }
  else {
    console.error("Error loading the model", res.data)
    throw new Error(`Error loading model ${res.data}`)
  }
}

export {
  infer,
  abort,
  loadModels,
  selectModelModelsServer,
  loadTasks,
  loadTask,
  probeLocalBackends,
  probeBackend,
  probeModelsServer
}