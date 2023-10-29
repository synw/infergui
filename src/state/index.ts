import { reactive, ref } from "vue";
import { useStorage } from '@vueuse/core';
import { ApiResponse } from "restmix";
import { User } from "@snowind/state";
import { Lm, ModelTemplate } from "@locallm/api";
import { PromptTemplate } from "modprompt";
import llamaTokenizer from 'llama-tokenizer-js';
import { defaultInferenceParams } from '@/const/params';
import { FormatMode, TemporaryInferResult, ApiState } from '@/interfaces';
import { InferenceParams, ModelConf } from '@locallm/types';
import { loadModels, loadTasks as _loadTasks, selectModel, infer, abort } from "@/services/api";
import { msg } from "../services/notify";
import { useDb } from "../services/db";
import { getServerUrl } from "../conf";
import { autoMaxContext, selectedPreset } from "./settings";
import { loadPreset } from "./presets";

let timer: ReturnType<typeof setInterval>;
const user = new User();
const lm = new Lm({
  providerType: "goinfer",
  serverUrl: getServerUrl(),
  apiKey: import.meta.env.VITE_API_KEY,
  onToken: (t) => stream.value += t,
});
const lmState = reactive<ApiState>({
  isRunning: false,
  isStreaming: false,
  isModelLoaded: false,
  isLoadingModel: false,
  model: { name: "", ctx: 2048, template: "unknown", gpu_layers: 0 },
});
const db = useDb();
//const currentModel = useStorage<string>("model", {} as LMContract);
//const currentTask = useStorage("task", {} as TaskContract);
const stream = ref("");
const models = reactive<Record<string, ModelTemplate>>({});
const prompts = reactive<Array<string>>([]);
const templates = reactive<Array<PromptTemplate>>([]);
const tasks = reactive<Array<Record<string, any>>>([]);
const presets = reactive<Array<string>>([]);

const template = ref<PromptTemplate>(new PromptTemplate("none"));
const stop = ref("");
const prompt = ref("");
const inferParams = reactive<InferenceParams>(defaultInferenceParams);
const inferResults = reactive<TemporaryInferResult>({
  tokensPerSecond: 0,
  totalTokens: 0,
});
const secondsCount = ref(0);
const promptTokensCount = ref(0);
const templateTokensCount = ref(0);
const freeContext = ref(0);
const totalContext = ref(0);

function setFreeContext(forceAuto = false) {
  const baseContext = promptTokensCount.value + templateTokensCount.value;
  if (autoMaxContext.value || forceAuto) {
    freeContext.value = Math.round(lmState.model.ctx - baseContext);
    totalContext.value = lmState.model.ctx;
  } else {
    if (inferParams.n_predict) {
      freeContext.value = inferParams.n_predict;
      totalContext.value = baseContext + inferParams.n_predict;
    } else {
      throw new Error("Missing n_predict inference param to set context")
    }
  }
}

function setMaxTokens() {
  inferParams.n_predict = freeContext.value;
}

function countPromptTokens() {
  promptTokensCount.value = llamaTokenizer.encode(prompt.value).length;
  setMaxTokens();
}

function countTemplateTokens() {
  templateTokensCount.value = llamaTokenizer.encode(template.value.render()).length;
  setMaxTokens();
}

function clearInferResults() {
  inferResults.totalTokens = 0;
  inferResults.thinkingTimeFormat = "";
  inferResults.emitTimeFormat = "";
  inferResults.totalTimeFormat = "";
  inferResults.tokensPerSecond = 0;
  secondsCount.value = 0;
}

async function processInfer() {
  clearInferResults();
  const id = setInterval(() => {
    secondsCount.value++;
    const tps = parseFloat((inferResults.totalTokens / secondsCount.value).toFixed(1));
    inferResults.tokensPerSecond = tps;
  }, 1000);
  timer = id;
  const res = await infer(prompt.value, template.value.render(), inferParams);
  clearInterval(id);
  inferResults.thinkingTimeFormat = res?.stats?.thinkingTimeFormat;
  inferResults.emitTimeFormat = res?.stats?.emitTimeFormat;
  inferResults.totalTimeFormat = res?.stats?.totalTimeFormat;
}

async function stopInfer() {
  await abort();
  clearInterval(timer);
  lmState.isRunning = false;
  lmState.isStreaming = false;
}

function setStop() {
  if (inferParams.stop) {
    stop.value = inferParams.stop.join(",")
  }
}

async function loadCustomTemplate(name: string) {
  const t = await db.loadTemplate(name);
  setStop();
  /*template.value.name = t.name;
  template.value.content = t.content;
  countTemplateTokens();*/
}

async function loadGenericTemplate(name: string) {
  template.value = new PromptTemplate(name);
  if (template.value.stop) {
    inferParams.stop = template.value.stop
  } else {
    inferParams.stop = []
  }
  setStop();
  countTemplateTokens();
}


async function loadPrompt(name: string) {
  prompt.value = await db.loadPrompt(name);
  countPromptTokens();
}

async function loadTask(t: Record<string, any>) {
  let ctx = t?.modelConf?.ctx ?? lmState.model.ctx;
  //let gpu_layers = t?.modelConf.gpu_layers ?? lmState.model.gpu_layers;
  if (t?.modelConf?.name != lmState.model.name) {
    await selectModel(t?.modelConf?.name ?? "", ctx, 0, true);
  }
  template.value = new PromptTemplate(t.template);
  countTemplateTokens();
  const ip = t.inferParams ?? {};
  Object.keys(ip).forEach((p) => {
    inferParams[p] = ip[p]
  });
}

function updateModels(_models: Record<string, ModelTemplate>) {
  for (const m in models) {
    delete models[m]
  }
  for (const [k, v] of Object.entries(_models)) {
    models[k] = v
  }
}

function checkMaxTokens(ctx: number) {
  if ((inferParams.n_predict ?? 0) > ctx) {
    inferParams.n_predict = ctx - 64;
  }
}

async function initState() {
  //console.log("KEY", import.meta.env.VITE_API_KEY);
  lm.api.onResponse(async <T>(res: ApiResponse<T>): Promise<ApiResponse<T>> => {
    if (!res.ok) {
      if ([401, 403].includes(res.status)) {
        const err = `${res.status} from ${res.url}`;
        msg.error("Unauthorized request", err);
        console.error(err)
      } else if (res.status == 500) {
        const err = `${res.status} from ${res.url}`;
        msg.error("Server error", err);
        console.error(err)
      } else {
        const err = `${res.status} from ${res.url}`;
        msg.error("Error", err);
        console.error(err)
      }
    }
    return res
  });
  db.init().then(async () => {
    loadPrompts();
    loadTemplates();
    loadPresets();
    loadPreset(selectedPreset.value);
  });
  //loadTasks();
  await loadModels();
}

function mutateModel(model: ModelConf, loadTemplate: boolean) {
  lmState.isLoadingModel = true;
  //console.log("Mutate model", model);
  if (model.name in models) {
    const modelTemplate = models[model.name];
    if (modelTemplate.name != "unknown") {
      // the model has a generic template
      if (loadTemplate) {
        loadGenericTemplate(modelTemplate.name);
      }
    }
  }
  lmState.model = {
    name: model.name,
    ctx: model.ctx ?? 2048,
    template: model.template ?? "unknown",
    gpu_layers: model.gpu_layers,
  }
  lmState.isModelLoaded = true;
  lmState.isLoadingModel = false;
  checkMaxTokens(lmState.model.ctx);
  if (autoMaxContext.value == true) {
    setMaxTokens();
  }
  setFreeContext(true);
  clearInferResults();
}

function mutateInferParams(_params: InferenceParams) {
  inferParams.frequency_penalty = _params.frequency_penalty;
  inferParams.presence_penalty = _params.presence_penalty;
  inferParams.repeat_penalty = _params.repeat_penalty;
  inferParams.stop = _params.stop;
  inferParams.temperature = _params.temperature;
  inferParams.tfs_z = _params.tfs_z;
  inferParams.threads = _params.threads;
  inferParams.n_predict = _params.n_predict;
  inferParams.top_k = _params.top_k;
  inferParams.top_p = _params.top_p;
}

async function loadPrompts() {
  const p = await db.listPromptsNames();
  prompts.splice(0, prompts.length, ...p);
}

async function loadTemplates() {
  console.log("LOAD TEMPLATES")
  //const t = await db.listTemplatesNames();
  //templates.splice(0, templates.length, ...t);
}

async function loadTasks() {
  const t = await _loadTasks();
  tasks.splice(0, tasks.length, ...t);
}

async function loadPresets() {
  const p = await db.listPresetsNames();
  presets.splice(0, presets.length, ...p);
}

export {
  user,
  lm,
  lmState,
  stream,
  models,
  db,
  prompts,
  templates,
  tasks,
  presets,
  template,
  stop,
  prompt,
  inferParams,
  inferResults,
  secondsCount,
  promptTokensCount,
  templateTokensCount,
  freeContext,
  totalContext,
  setFreeContext,
  loadCustomTemplate,
  loadGenericTemplate,
  loadPrompt,
  checkMaxTokens,
  countPromptTokens,
  countTemplateTokens,
  initState,
  mutateModel,
  mutateInferParams,
  loadPrompts,
  loadTemplates,
  clearInferResults,
  loadTasks,
  loadTask,
  loadPresets,
  processInfer,
  stopInfer,
  updateModels,
}