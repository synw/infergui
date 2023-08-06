import { reactive, ref, computed } from "vue";
import { useStorage } from '@vueuse/core';
import { ApiResponse, useApi } from "restmix";
import { User } from "@snowind/state";
import llamaTokenizer from 'llama-tokenizer-js';
import { defaultInferenceParams } from '@/const/params';
import { templates as _templates } from '@/const/templates';
import { FormatMode, InferParams, LmTemplate, Task, TemporaryInferResult } from '@/interfaces';
import { useWs } from "@/services/ws";
import { loadModels, loadTasks as _loadTasks, selectModel } from "@/services/api";
import { msg } from "./services/notify";
import { useDb } from "./services/db";
import { getServerUrl } from "./conf";

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
});
const stream = ref("");
const models = reactive<Array<string>>([]);
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
  inferParams.tokens = freeCtx.value;
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
  if (t.model != lmState.model) {
    await selectModel(t.model, ctx);
  }
  template.content = t.template;
  countTemplateTokens();
  const ip = t.inferParams ?? {};
  Object.keys(ip).forEach((p) => {
    inferParams[p] = ip[p]
  });
}

function checkMaxTokens(ctx: number) {
  if (inferParams.tokens > ctx) {
    inferParams.tokens = ctx - 64;
  }
}

async function initState() {
  //console.log("SERVER URL", import.meta.env.VITE_SERVER_URL);
  //console.log("API KEY", import.meta.env.VITE_API_KEY);
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
  useWs(
    (data) => {
      stream.value = stream.value + data;
      ++inferResults.totalTokens
    },
    () => lmState.isStreaming = true,
  );
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
  inferParams.freqPenalty = _params.freqPenalty;
  inferParams.presPenalty = _params.presPenalty;
  inferParams.stop = _params.stop;
  inferParams.temp = _params.temp;
  inferParams.tfs = _params.tfs;
  inferParams.threads = _params.threads;
  inferParams.tokens = _params.tokens;
  inferParams.topK = _params.topK;
  inferParams.topP = _params.topP;
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
}