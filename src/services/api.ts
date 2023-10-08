import { api, mutateModel, stream, inferResults, updateModels, lmState } from "@/state";
import type { Task, InferParams, InferResult, TempInferStats } from "@goinfer/types";

async function infer(_prompt: string, _template: string, _params: InferParams): Promise<InferResult> {
  stream.value = "";
  lmState.isRunning = true;
  const paramDefaults = {
    prompt: _prompt,
    template: _template,
    ..._params,
  };
  const completionParams = { ...paramDefaults, _prompt };
  const resEl = document.getElementById("infer-block") as HTMLElement;
  let respData: InferResult = {
    text: "",
    thinkingTime: 0,
    thinkingTimeFormat: "",
    inferenceTime: 0,
    emitTime: 0,
    emitTimeFormat: "",
    totalTime: 0,
    totalTimeFormat: "",
    tokensPerSecond: 0,
    totalTokens: 0,
  };

  api.onToken = (token: string) => {
    //console.log("T", token);
    stream.value = stream.value + token;
    resEl.scrollTop = resEl.scrollHeight;
    ++inferResults.totalTokens
  }
  api.onStartEmit = (s: TempInferStats) => {
    //console.log("Start emit", s);
    lmState.isStreaming = true;
  };
  api.onError = (msg: string) => {
    console.error("ERROR", msg)
  };

  console.log

  respData = await api.infer(_prompt, _template, completionParams)

  /*const onChunk = (payload: Record<string, any>) => {
    const msg: StreamedMessage = {
      num: payload["num"],
      type: payload["msg_type"],
      content: payload["content"],
      data: payload["data"] ?? {},
    }
    if (msg.type == "token") {
      stream.value = stream.value + msg.content;
      resEl.scrollTop = resEl.scrollHeight;
      ++inferResults.totalTokens
    } else {
      if (msg.type == "system") {
        //console.log("SYSTEM", msg)
        if (msg.content == "start_emitting") {
          lmState.isStreaming = true;
        } else if (msg.content == "result") {
          respData = msg.data as InferResultContract;
        }
      } else if (msg.type == "error") {
        console.error("ERROR", msg)
      }
    }
  }

  await api.postSse<Record<string, any>>(
    "/completion",
    completionParams,
    onChunk,
    lmState.abortController,
  )*/
  lmState.isRunning = false;
  lmState.isStreaming = false;
  return respData
}

async function abort() {
  await api.abort();
}

async function loadModels() {
  const res = await api.modelsState();
  //console.log(JSON.stringify(res.data, null, "  "))
  // update state
  updateModels(res.models);
  if (res.isModelLoaded) {
    if (lmState.model.name != res.loadedModel) {
      mutateModel({ name: res.loadedModel, ctx: res.ctx });
    }
  }
}

async function loadTasks(): Promise<Array<Record<string, any>>> {
  return await api.loadTasks();
}

async function loadTask(path: string): Promise<Task> {
  return await api.loadTask(path)
  /*const payload = {
    path: path
  }
  let task: Task = {
    name: "",
    template: "",
    modelConf: {} as ModelConf,
  };
  const res = await api.post<Record<string, any>>("/task/read", payload);
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

async function selectModel(name: string, ctx: number) {
  lmState.isLoadingModel = true;
  await api.loadModel({ name: name, ctx: ctx });
  mutateModel({ name: name, ctx: ctx });
  lmState.isLoadingModel = false;
}

export { infer, abort, loadModels, selectModel, loadTasks, loadTask }