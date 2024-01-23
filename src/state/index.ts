import { reactive, ref } from "vue";
import { ApiResponse } from "restmix";
import { compile, serializeGrammar } from "@intrinsicai/gbnfgen";
import { User } from "@snowind/state";
import { PromptTemplate, HistoryTurn } from "modprompt";
import llamaTokenizer from 'llama-tokenizer-js';
import { defaultInferenceParams } from '@/const/params';
import { ApiState, LmBackend } from '@/interfaces';
import { Lm } from "@locallm/api";
import { InferenceParams, ModelConf, ModelTemplate } from '@locallm/types';
//import { Lm } from "../packages/locallm/api";
//import { InferenceParams, ModelConf, ModelTemplate } from '../packages/types/interfaces';
import { loadModels, loadTasks as _loadTasks, infer, abort, probeLocalBackends, probeModelsServer } from "@/services/api";
import { msg } from "../services/notify";
import { useDb } from "../services/db";
import { selectedPreset } from "./settings";
import { loadPreset } from "./presets";
import { defaultBackends } from "@/const/backends";
import { grammar, useGrammar } from "./grammar";

let timer = ref<ReturnType<typeof setInterval>>();
const user = new User();
let lm = new Lm({
  providerType: defaultBackends[0].providerType,
  serverUrl: defaultBackends[0].serverUrl,
  apiKey: defaultBackends[0].apiKey,
  onToken: (t) => {
    stream.value += t;
  },
});
const lmState = reactive<ApiState>({
  isRunning: false,
  isStreaming: false,
  isModelLoaded: false,
  isLoadingModel: false,
  isModelMultimodal: false,
  model: { name: "", ctx: 2048 },
});
const db = useDb();
const backends = reactive<Record<string, LmBackend>>({});
const activeBackend = ref<LmBackend | null>(null);
const stream = ref("");
const history = reactive<Array<HistoryTurn>>([]);
const models = reactive<Record<string, ModelTemplate>>({});
const prompts = reactive<Array<string>>([]);
const templates = reactive<Array<PromptTemplate>>([]);
const tasks = reactive<Array<Record<string, any>>>([]);
const presets = reactive<Array<string>>([]);
const hasModelsServer = ref(false);

const template = ref<PromptTemplate>(new PromptTemplate("none"));
const stop = ref("");
const prompt = ref("");
const currentImgData = ref("");
const _currentImgId = ref(0);
const inferParams = reactive<InferenceParams>(defaultInferenceParams);
const inferResults = reactive<Record<string, number>>({
  tokensPerSecond: 0,
  totalTokens: 0,
});
const secondsCount = ref(0);
const promptTokensCount = ref(0);
const templateTokensCount = ref(0);
const freeContext = ref(0);
const totalContext = ref(0);

function getLm(): Lm {
  return lm
}

function setFreeContext() {
  const baseContext = promptTokensCount.value + templateTokensCount.value;
  let useMaxTokens = false;
  if (inferParams.max_tokens) {
    if (inferParams.max_tokens > 0) {
      useMaxTokens = true;
      freeContext.value = inferParams.max_tokens;
      totalContext.value = baseContext + inferParams.max_tokens;
    }
  }
  if (!useMaxTokens) {
    freeContext.value = Math.round(lmState.model.ctx - baseContext);
    totalContext.value = lmState.model.ctx;
  }
}

function countPromptTokens() {
  let v = prompt.value;
  promptTokensCount.value = llamaTokenizer.encode(v).length;
  setFreeContext();
}

function countTemplateTokens() {
  templateTokensCount.value = llamaTokenizer.encode(template.value.render()).length;
  setFreeContext();
}

function setAutomaxContext() {
  inferParams.max_tokens = -1;
  setFreeContext();
}

function clearInferResults() {
  inferResults.totalTokens = 0;
  /*inferResults.thinkingTimeFormat = "";
  inferResults.emitTimeFormat = "";
  inferResults.totalTimeFormat = "";*/
  inferResults.tokensPerSecond = 0;
  secondsCount.value = 0;
}

function clearHistory() {
  history.splice(0, history.length);
  inferParams.image_data = undefined;
}

function _pushToHistory() {
  const turn: HistoryTurn = { user: prompt.value, assistant: stream.value.trim() };
  if (inferParams.image_data) {
    turn.images = [{
      id: _currentImgId.value,
      data: currentImgData.value
    }];
  }
  history.push(turn);
}

function cutHistoryAfterTurn(turn: number) {
  const newHistory = history.slice(0, turn);
  const l = newHistory.length;
  history.splice(l, history.length - newHistory.length);
}

async function processInfer() {
  clearInferResults();
  const id = setInterval(() => {
    secondsCount.value++;
    const tps = parseFloat((inferResults.totalTokens / secondsCount.value).toFixed(1));
    inferResults.tokensPerSecond = tps;
  }, 1000);
  timer.value = id;
  // process history
  if (history.length > 0) {
    history.forEach((turn) => {
      template.value.pushToHistory(turn);
    });
  }
  //let imgOri: ImgData = { id: 0, data: "" };
  if (inferParams.image_data) {
    const nImg = inferParams.image_data.length - 1;
    //imgOri = Object.assign({}, inferParams.image_data[nImg]);
    inferParams.image_data[nImg].data = inferParams.image_data[nImg].data.replace(/^data:image\/[a-z]+;base64,/, "");
  }
  const _inferParams: InferenceParams = {
    stream: true
  };
  Object.keys(inferParams).forEach((k) => {
    if (inferParams[k]) {
      _inferParams[k] = inferParams[k];
    }
  });
  if (_inferParams.max_tokens) {
    if (_inferParams.max_tokens <= 0) {
      if (lm.providerType == "llamacpp") {
        _inferParams.max_tokens = undefined;
      } else if (lm.providerType == "koboldcpp") {
        _inferParams.max_tokens = freeContext.value;
      }
    }
  } else {
    if (lm.providerType == "koboldcpp") {
      _inferParams.max_tokens = freeContext.value;
    }
  }
  // grammar
  if (useGrammar.value === true) {
    const gr = serializeGrammar(await compile(grammar.code, "Grammar"));
    _inferParams.grammar = gr;
    //console.log("Using grammar:");
    //console.log(gr);
  }
  console.log(template.value.prompt(prompt.value));
  //console.log("PK", Object.keys(_inferParams));
  console.log("PARAMS", JSON.stringify(_inferParams, null, "  "));
  const res = await infer(prompt.value, template.value.render(), _inferParams);
  //console.log("RES", res)
  _finishInfer();
  //console.log("Stats:", res.stats);
}

function _finishInfer() {
  clearInterval(timer.value);
  lmState.isRunning = false;
  lmState.isStreaming = false;
  _pushToHistory();
  currentImgData.value = "";
  _currentImgId.value = 0;
  stream.value = "";
  prompt.value = "";
}

async function stopInfer() {
  await abort();
  _finishInfer();
}

function setStop() {
  if (inferParams.stop) {
    stop.value = inferParams.stop.join(",")
  }
}

function setImageData(imgData: string, id: number) {
  //console.log("SET IMG ID", id);
  if (!inferParams.image_data) {
    inferParams.image_data = [];
  }
  inferParams.image_data.push(
    {
      id: id,
      data: imgData,
    }
  );
  currentImgData.value = imgData;
  _currentImgId.value = id;
  //console.log("IMG DATA", inferParams.image_data)
}

async function loadCustomTemplate(name: string) {
  const t = await db.loadTemplate(name);
  setStop();
  template.value = t;
  countTemplateTokens();
}

async function cloneToGenericTemplate(name: string) {
  template.value = template.value.cloneTo(name);
  if (template.value.stop) {
    inferParams.stop = template.value.stop
  } else {
    inferParams.stop = []
  }
  setStop();
  countTemplateTokens();
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

/*async function loadTask(t: Record<string, any>) {
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
}*/

async function loadBackends() {
  const _backends = await db.listBackends();
  if (_backends.length == 0) {
    console.log("Setting default local backends");
    defaultBackends.forEach(async (b) => {
      await db.setBackend(b.name, b);
      _backends.push(b)
    });
    window.location.reload();
  }
  Object.keys(backends).forEach((b) => {
    delete backends[b]
  });
  _backends.forEach((b) => {
    backends[b.name] = b;
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

/*function checkMaxTokens(ctx: number) {
  if ((inferParams.max_tokens ?? 0) > ctx) {
    inferParams.max_tokens = ctx - 64;
  }
}*/

async function loadBackend(_lm: Lm, _b: LmBackend) {
  lm = new Lm({
    providerType: _lm.providerType,
    serverUrl: _lm.serverUrl,
    apiKey: _lm.apiKey,
    onToken: (t) => {
      stream.value += t
    },
  });
  //lm.api._mode = 
  if (lm.providerType == "ollama") {
    await loadModels();
  } else if (["koboldcpp", "llamacpp"].includes(lm.providerType)) {
    //console.log("API", JSON.stringify(lm.apiKey, null, "  "));
    const model: ModelConf = {
      name: _lm.model.name,
      ctx: _lm.model.ctx,
    }
    console.log("Loading model", model.name, "for", lm.providerType);
    mutateModel(model);
    lm.model = model;
    // check if the model is multimodal
    if (lm.providerType == "llamacpp") {
      if (model.name.toLowerCase().includes("llava")) {
        lmState.isModelMultimodal = true;
      };
    }
    //lmState.isModelMultimodal = true;

  }
  backends[_b.name].enabled = true;
  activeBackend.value = _b;
}

async function probeAndLoadLocalBackends() {
  const res = await probeLocalBackends(Object.values(backends));
  if (res !== null) {
    loadBackend(res.lm, res.backend)
  } else if (!hasModelsServer.value) {
    msg.warn("No backend found", "Please run a local backend and retry or connect to a remote backend", 10000)
  }
}

async function initState() {
  probeModelsServer().then((isUp) => { hasModelsServer.value = isUp });
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
  db.init().then(() => {
    loadBackends().then(() => {
      probeAndLoadLocalBackends()
    });
    loadPrompts();
    loadTemplates();
    loadPresets();
    loadPreset(selectedPreset.value);
  });
  //loadTasks();
}

function mutateModel(model: ModelConf) {
  lmState.isLoadingModel = true;
  //console.log("Mutate model", model);
  /*if (model.name in models) {
    const modelTemplate = models[model.name];
    if (modelTemplate.name != "unknown") {
      // the model has a generic template
      if (loadTemplate) {
        loadGenericTemplate(modelTemplate.name);
      }
    }
  }*/
  lmState.model = {
    name: model.name,
    ctx: model.ctx,
  }
  //console.log("State model", lmState.model);
  lmState.isModelLoaded = true;
  lmState.isLoadingModel = false;
  //checkMaxTokens(lmState.model.ctx);
  setFreeContext();
  clearInferResults();
}

function mutateInferParams(_params: InferenceParams) {
  inferParams.repeat_penalty = _params.repeat_penalty;
  inferParams.stop = _params.stop;
  inferParams.temperature = _params.temperature;
  inferParams.tfs = _params.tfs;
  inferParams.min_p = _params.min_p;
  inferParams.threads = _params.threads;
  inferParams.max_tokens = _params.max_tokens;
  inferParams.top_k = _params.top_k;
  inferParams.top_p = _params.top_p;
}

async function loadPrompts() {
  const p = await db.listPromptsNames();
  prompts.splice(0, prompts.length, ...p);
}

async function loadTemplates() {
  const t = await db.listTemplates();
  const tpls = new Array<PromptTemplate>();
  t.forEach((item) => {
    tpls.push(new PromptTemplate(item))
  })
  templates.splice(0, templates.length, ...tpls);
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
  backends,
  lmState,
  stream,
  history,
  models,
  db,
  prompts,
  templates,
  tasks,
  presets,
  template,
  stop,
  prompt,
  currentImgData,
  inferParams,
  inferResults,
  secondsCount,
  promptTokensCount,
  templateTokensCount,
  freeContext,
  totalContext,
  activeBackend,
  hasModelsServer,
  setAutomaxContext,
  setFreeContext,
  loadCustomTemplate,
  loadGenericTemplate,
  cloneToGenericTemplate,
  loadPrompt,
  //checkMaxTokens,
  countPromptTokens,
  countTemplateTokens,
  initState,
  mutateModel,
  mutateInferParams,
  loadPrompts,
  loadTemplates,
  clearInferResults,
  clearHistory,
  //loadTasks,
  //loadTask,
  loadPresets,
  processInfer,
  stopInfer,
  updateModels,
  loadBackend,
  loadBackends,
  getLm,
  setImageData,
  probeAndLoadLocalBackends,
  cutHistoryAfterTurn,
}