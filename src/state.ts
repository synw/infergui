import { reactive, ref, computed } from "vue";
import { useStorage } from '@vueuse/core';
import { ApiResponse, useApi } from "restmix";
import { User } from "@snowind/state";
import llamaTokenizer from 'llama-tokenizer-js';
import { defaultInferenceParams } from '@/const/params';
import { templates as _templates } from '@/const/templates';
import { FormatMode, InferParams, LmTemplate, Task, TemplateInfo, TemporaryInferResult } from '@/interfaces';
import { loadModels, loadTasks as _loadTasks, selectModel, infer, abort } from "@/services/api";
import { msg } from "./services/notify";
import { useDb } from "./services/db";
import { getServerUrl } from "./conf";

let timer: ReturnType<typeof setInterval>;
const user = new User();
const api = useApi({ "serverUrl": getServerUrl() });
const db = useDb();
//const currentModel = useStorage<string>("model", {} as LMContract);
//const currentTask = useStorage("task", {} as TaskContract);
const lmState = reactive({
  isRunning: false,
  isStreaming: false,
  isLoadingModel: false,
  isModelLoaded: false,
  model: "",
  ctx: 1024,
  abortController: new AbortController(),
});
const stream = ref("");
const models = reactive<Record<string, TemplateInfo>>({});
const prompts = reactive<Array<string>>([]);
const templates = reactive<Array<string>>([]);
const tasks = reactive<Array<Record<string, any>>>([]);
const presets = reactive<Array<string>>([]);
const formatMode = useStorage<FormatMode>("formatMode", "Text");

const template = reactive<LmTemplate>(_templates.alpaca);
const prompt = ref("");
const inferParams = reactive(defaultInferenceParams);
const inferResults = reactive<TemporaryInferResult>({
  tokensPerSecond: 0,
  totalTokens: 0,
});
const secondsCount = ref(0);
const promptTokensCount = ref(0);
const templateTokensCount = ref(0);

const freeCtx = computed(() => {
  return Math.round(lmState.ctx - (promptTokensCount.value + templateTokensCount.value))
});

function setMaxTokens() {
  inferParams.n_predict = freeCtx.value;
}

function countPromptTokens() {
  promptTokensCount.value = llamaTokenizer.encode(prompt.value).length;
  setMaxTokens();
}

function countTemplateTokens() {
  templateTokensCount.value = llamaTokenizer.encode(template.content).length;
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
  const res = await infer(prompt.value, template.content, inferParams);
  clearInterval(id);
  inferResults.thinkingTimeFormat = res.thinkingTimeFormat;
  inferResults.emitTimeFormat = res.emitTimeFormat;
  inferResults.totalTimeFormat = res.totalTimeFormat;
}

async function stopInfer() {
  lmState.abortController.abort();
  await abort();
  clearInterval(timer);
}

async function loadTemplate(name: string) {
  const t = await db.loadTemplate(name);
  template.name = t.name;
  template.content = t.content;
  template.vars = t.vars;
  countTemplateTokens();
}

async function loadPrompt(name: string) {
  prompt.value = await db.loadPrompt(name);
  countPromptTokens();
}

async function loadTask(t: Task) {
  let ctx = t?.modelConf?.ctx ?? lmState.ctx;
  if (t?.modelConf?.name != lmState.model) {
    await selectModel(t?.modelConf?.name ?? "", ctx);
  }
  template.content = t.template;
  countTemplateTokens();
  const ip = t.inferParams ?? {};
  Object.keys(ip).forEach((p) => {
    inferParams[p] = ip[p]
  });
}

function updateModels(_models: Record<string, TemplateInfo>) {
  for (const m in models) {
    delete models[m]
  }
  for (const [k, v] of Object.entries(_models)) {
    models[k] = v
  }
}

function checkMaxTokens(ctx: number) {
  if (inferParams.n_predict > ctx) {
    inferParams.n_predict = ctx - 64;
  }
}

async function initState() {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    api.addHeader("Authorization", `Bearer ${apiKey}`);
  }
  api.onResponse(async <T>(res: ApiResponse<T>): Promise<ApiResponse<T>> => {
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
  });
  loadTasks();
  await loadModels();
}

function mutateModel(_model: string, _ctx: number) {
  lmState.model = _model;
  lmState.ctx = _ctx;
  lmState.isModelLoaded = true;
  checkMaxTokens(lmState.ctx);
  setMaxTokens();
  clearInferResults();
}

function mutateInferParams(_params: InferParams) {
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
  const t = await db.listTemplatesNames();
  templates.splice(0, templates.length, ...t);
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
  api,
  lmState,
  stream,
  models,
  db,
  prompts,
  templates,
  tasks,
  presets,
  template,
  prompt,
  inferParams,
  inferResults,
  secondsCount,
  promptTokensCount,
  templateTokensCount,
  freeCtx,
  formatMode,
  loadTemplate,
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