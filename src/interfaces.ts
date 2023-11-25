import { LmProviderType } from "@locallm/types";

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
  isModelMultimodal: boolean;
  model: SafeModelConf;
}

interface SafeModelConf {
  name: string;
  ctx: number;
  template: string;
  gpu_layers?: number;
}

interface LmBackend {
  name: string;
  providerType: LmProviderType;
  serverUrl: string;
  apiKey: string;
  enabled: boolean;
}

/*interface Task {
  name: string;
  template: string;
  modelConf: ModelConf;
  inferParams?: OptionalInferParams
}*/

type FormatMode = "Html" | "Text" | "Markdown" | "Json";

enum MsgType {
  TokenMsgType = "token",
  SystemMsgType = "system",
  ErrorMsgType = "error",
}

type TabType = "prompts" | "templates";


export {
  FormatMode,
  TemporaryInferResult,
  ApiState,
  TabType,
  LmBackend,
}