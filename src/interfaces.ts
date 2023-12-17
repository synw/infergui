//import { LmProviderType } from "@locallm/types";
import { LmProviderType, ModelConf } from "./packages/types/interfaces";


interface ApiState {
  isRunning: boolean;
  isStreaming: boolean;
  isModelLoaded: boolean;
  isLoadingModel: boolean;
  isModelMultimodal: boolean;
  model: ModelConf;
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

interface GbnfGrammar {
  name: string;
  code: string;
}

type FormatMode = "Html" | "Text" | "Markdown" | "Json";

type TabType = "prompts" | "templates" | "grammars";


export {
  FormatMode,
  ApiState,
  TabType,
  LmBackend,
  GbnfGrammar,
}