import { api, models, mutateModel, stream, lmState, inferResults } from "@/state";
import type { InferParams, InferResultContract, StreamedMessage, Task } from "@/interfaces";
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
  const headers = {
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  }
  if (import.meta.env.VITE_API_KEY) {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_API_KEY}`
  }
  const response = await fetch("http://localhost:5143/completion", {
    method: 'POST',
    body: JSON.stringify(completionParams),
    headers: headers,
    signal: lmState.abortController.signal,
  });
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
  if (response.body) {
    const resEl = document.getElementById("infer-block") as HTMLElement;
    const reader = response.body.getReader();  // @ts-ignore
    const decoder = new TextDecoder();
    while (true) {
      const result = await reader.read();
      if (result.done) {
        break
      }
      const text = decoder.decode(result.value);
      const rawText = text.replace(/data: |[\r\n]/g, '');
      const payload = JSON.parse(rawText);
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
  } else {
    throw new Error("Empty response")
  }
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
    model: "",
    template: "",
  };
  const res = await api.post<Record<string, any>>("/task/read", payload);
  if (res.ok) {
    //console.log("DATA", JSON.stringify(res.data, null, "  "));
    task = {
      name: res.data.name,
      model: res.data.model,
      template: res.data.template,
    }
    if ("modelConf" in res.data) {
      task.modelConf = res.data.modelConf;
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