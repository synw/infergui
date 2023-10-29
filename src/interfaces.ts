interface TemporaryInferResult {
  thinkingTimeFormat?: string;
  emitTimeFormat?: string;
  totalTimeFormat?: string;
  tokensPerSecond: number;
  totalTokens: number;
}

interface ApiState {
  isRunning: boolean;
  isStreaming: boolean;
  isModelLoaded: boolean;
  isLoadingModel: boolean;
  model: SafeModelConf;
}

interface SafeModelConf {
  name: string;
  ctx: number;
  template: string;
  gpu_layers?: number;
}

/*interface Task {
  name: string;
  template: string;
  modelConf: ModelConf;
  inferParams?: OptionalInferParams
}*/

/*interface LmPrompt {
  name: string;
  content: string;
}*/

type FormatMode = "Html" | "Text" | "Markdown" | "Json";

enum MsgType {
  TokenMsgType = "token",
  SystemMsgType = "system",
  ErrorMsgType = "error",
}

type TabType = "prompts" | "templates";

/*interface StreamedMessage {
  content: string;
  num: number;
  type: MsgType;
  data?: { [key: string]: any };
}*/

export {
  FormatMode,
  TemporaryInferResult,
  ApiState,
  TabType,
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