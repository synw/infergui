import { LmBackend } from "@/interfaces";

const defaultBackends: Array<LmBackend> = [{
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
}
];

export { defaultBackends }