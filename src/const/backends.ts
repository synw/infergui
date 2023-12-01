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
    name: "Goinfer local",
    providerType: "goinfer",
    serverUrl: "http://localhost:5143",
    apiKey: import.meta.env.VITE_API_KEY,
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
    name: "Llama.cpp phone",
    providerType: "llamacpp",
    serverUrl: "http://192.168.1.3:8080",
    apiKey: "",
    enabled: false,
  }
];

export { defaultBackends }