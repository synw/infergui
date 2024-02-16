import { LmBackend } from "@/interfaces";

const defaultBackends: Array<LmBackend> = [
  {
    name: "Llama.cpp local",
    providerType: "llamacpp",
    serverUrl: "http://localhost:8080",
    apiKey: "",
    enabled: false,
  },
  {
    name: "Koboldcpp local",
    providerType: "koboldcpp",
    serverUrl: "http://localhost:5001",
    apiKey: "",
    enabled: false,
  },
  {
    name: "Ollama local",
    providerType: "ollama",
    serverUrl: "http://localhost:11434",
    apiKey: "",
    enabled: false,
  },
];

export { defaultBackends }