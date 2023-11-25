import localForage from "localforage";
import type { InferenceParams } from "@locallm/types";
import { defaultInferenceParams } from "@/const/params";
import { LmTemplate, PromptTemplate } from "modprompt";
import { LmBackend } from "@/interfaces";

const useDb = () => {
  const prompts = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    storeName: 'prompts',
  });
  const templates = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    storeName: 'templates',
  });
  const presets = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    storeName: 'presets',
  });
  const backends = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    storeName: 'backends',
  });

  const init = async () => {
    await prompts.ready();
    if (await prompts.length() == 0) {
      console.log("The prompts db is empty")
    }
    await templates.ready();
    await presets.ready();
    await backends.ready();
    if ((await presets.length()) <= 1) {
      console.log("The presets db is empty, loading default");
      setPreset("Default", defaultInferenceParams)
    }
  }

  const setPrompt = async (k: string, v: string) => {
    await prompts.ready();
    await prompts.setItem(k, v);
  };

  const delPrompt = async (k: string) => {
    await prompts.ready();
    await prompts.removeItem(k);
  };

  const loadPrompt = async (k: string): Promise<string> => {
    await prompts.ready();
    const v = await prompts.getItem<string>(k);
    if (!v) {
      throw new Error(`Key ${v} not found`)
    }
    return v
  };

  const listPromptsNames = async (): Promise<Array<string>> => {
    await prompts.ready();
    const _p = new Array<string>();
    await prompts.iterate((v, k, i) => {
      _p.push(k)
    });
    return _p
  };

  const setTemplate = async (k: string, v: LmTemplate) => {
    await templates.ready();
    await templates.setItem(k, v);
  };

  const delTemplate = async (k: string) => {
    await templates.ready();
    console.log("DELETE template", k)
    await templates.removeItem(k);
  };

  const loadTemplate = async (k: string): Promise<PromptTemplate> => {
    await templates.ready();
    const v = await templates.getItem<LmTemplate>(k);
    if (!v) {
      throw new Error(`Key ${v} not found`)
    }
    return new PromptTemplate(v)
  };

  const listTemplates = async (): Promise<Array<LmTemplate>> => {
    await templates.ready();
    const _t = new Array<LmTemplate>();
    await templates.iterate((v, k, i) => {
      _t.push(v as LmTemplate)
    });
    return _t
  }

  const setPreset = async (k: string, v: InferenceParams) => {
    await presets.ready();
    await presets.setItem(k, v);
  };

  const delPreset = async (k: string) => {
    await presets.ready();
    await presets.removeItem(k);
  };

  const listPresetsNames = async (): Promise<Array<string>> => {
    await presets.ready();
    const _t = new Array<string>();
    await presets.iterate((v, k, i) => {
      _t.push(k)
    });
    return _t
  }

  const loadPreset = async (k: string): Promise<InferenceParams> => {
    await presets.ready();
    const v = await presets.getItem<InferenceParams>(k);
    if (!v) {
      console.warn(`Preset ${v} not found`)
    }
    return v ?? {}
  };

  const setBackend = async (k: string, v: LmBackend) => {
    await backends.ready();
    await backends.setItem(k, v);
  };

  const listBackends = async (): Promise<Array<LmBackend>> => {
    await backends.ready();
    const _t = new Array<LmBackend>();
    await backends.iterate((v, k, i) => {
      _t.push(v as LmBackend)
    });
    return _t
  }

  return {
    init,
    setPrompt,
    delPrompt,
    loadPrompt,
    setTemplate,
    delTemplate,
    loadTemplate,
    setPreset,
    delPreset,
    loadPreset,
    listTemplates,
    listPromptsNames,
    listPresetsNames,
    setBackend,
    listBackends,
  }
}

export { useDb }