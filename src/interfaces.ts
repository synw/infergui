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

interface OptionalInferParams {
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

interface ModelConf {
  name: string,
  ctx: number,
  rope_freq_scale?: number,
  rope_freq_base?: number,
}

interface Task {
  name: string;
  template: string;
  modelConf: ModelConf;
  inferParams?: OptionalInferParams
}

interface BaseTemplate {
  name: string;
  content: string;
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
  FormatMode,
  BaseTemplate,
  TemporaryInferResult,
  /*InferResultContract,
  InferParams,
  TemporaryInferResult,
  BaseTemplate,
  LmPrompt,
  Task,
  FormatMode,
  StreamedMessage,
  ModelConf,*/
}