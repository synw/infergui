import { LmProviderType, ModelConf } from "@locallm/types";
import { LlamaTokenizer } from "llama-tokenizer-js";
import { Llama3Tokenizer } from "llama3-tokenizer-js";
import mistralTokenizer from 'mistral-tokenizer-js';
//import { LmProviderType, ModelConf } from "./packages/types/interfaces";


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

type LmTokenizer = LlamaTokenizer | Llama3Tokenizer | typeof mistralTokenizer;

export {
  FormatMode,
  ApiState,
  TabType,
  LmBackend,
  GbnfGrammar,
  LmTokenizer,
}