import { api, models, mutateModel, stream, lmState, inferResults } from "@/state";
import type { InferParams, InferResultContract, ModelConf, StreamedMessage, Task } from "@/interfaces";
import { ModelStateContract } from "@/interfaces";

async function infer(_prompt: string, _template: string, _params: InferParams): Promise<InferResultContract> {
  stream.value = "";
  lmState.isRunning = true;
  lmState.abortController = new AbortController();
  const paramDefaults = {
    prompt: _prompt,
    template: _template,
    ..._params,
  };
  const completionParams = { ...paramDefaults, _prompt };
  const resEl = document.getElementById("infer-block") as HTMLElement;
  let respData: InferResultContract = {
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

  const onChunk = (payload: Record<string, any>) => {
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
  )

  lmState.isStreaming = false;
  lmState.isRunning = false;
  return respData
}

async function abort() {
  const res = await api.get("/completion/abort");
  if (res.ok) {
    lmState.isRunning = false;
    lmState.isStreaming = false;
  }
}

async function loadModels() {
  const res = await api.get<ModelStateContract>("/model/state");
  //console.log(JSON.stringify(res.data, null, "  "))
  if (res.ok) {
    models.splice(0, models.length, ...res.data.models);
    if (res.data.isModelLoaded) {
      mutateModel(res.data.loadedModel, res.data.ctx);
    }
  }
}

async function loadTasks(): Promise<Array<Record<string, any>>> {
  const res = await api.get<Array<Record<string, any>>>("/task/tree");
  //console.log(JSON.stringify(res.data, null, "  "));
  if (res.ok) {
    return res.data
  }
  throw new Error("Error loading tasks")
}

async function loadTask(path: string) {
  const payload = {
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
  return task
}

async function selectModel(name: string, ctx: number) {
  lmState.isLoadingModel = true;
  const res = await api.post("/model/load", { model: name, ctx: ctx });
  if (res.ok) {
    mutateModel(name, ctx);
  }
  lmState.isLoadingModel = false;
}

export { infer, abort, loadModels, selectModel, loadTasks, loadTask }