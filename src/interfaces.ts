interface ModelStateContract {
  models: Array<string>;
  isModelLoaded: boolean;
  loadedModel: string;
  ctx: number;
}

interface InferResultContract {
  text: string;
  thinkingTime: number;
  thinkingTimeFormat: string;
  inferenceTime: number;
  emitTime: number;
  emitTimeFormat: string;
  totalTime: number;
  totalTimeFormat: string;
  tokensPerSecond: number;
  totalTokens: number;
}

interface TemporaryInferResult {
  thinkingTimeFormat?: string;
  emitTimeFormat?: string;
  totalTimeFormat?: string;
  tokensPerSecond: number;
  totalTokens: number;
}

interface InferParams {
  stream: boolean;
  threads: number;
  n_predict: number;
  top_k: number;
  top_p: number;
  temperature: number;
  frequency_penalty: number;
  presence_penalty: number;
  repeat_penalty: number;
  tfs_z: number;
  stop: Array<string>;
}

interface Task {
  name: string;
  model: string;
  template: string;
  modelConf?: { ctx: number }
  inferParams?: {
    threads?: number;
    n_predict?: number;
    top_k?: number;
    top_p?: number;
    temperature?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    repeat_penalty?: number;
    tfs_z?: number;
    stop?: Array<string>;
  }
}

interface LmTemplate {
  name: string;
  content: string;
  vars?: Array<string>;
}

interface LmPrompt {
  name: string;
  content: string;
}

type FormatMode = "Html" | "Text" | "Markdown" | "Json";

enum MsgType {
  TokenMsgType = "token",
  SystemMsgType = "system",
  ErrorMsgType = "error",
}

interface StreamedMessage {
  content: string;
  num: number;
  type: MsgType;
  data?: { [key: string]: any };
}

export {
  ModelStateContract,
  InferResultContract,
  InferParams,
  TemporaryInferResult,
  LmTemplate,
  LmPrompt,
  Task,
  FormatMode,
  StreamedMessage,
}