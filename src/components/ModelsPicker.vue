<template>
  <div>
    <div class="ml-3">{{ selectedModel }}</div>
    <div class="flex flex-col" v-if="!selectCtx">
      <div v-for="(model, i) in Object.keys(models)" class="cursor-pointer px-8 py-4 bord-lighter"
        :class="i == Object.keys(models).length - 1 ? '' : 'border-b'" @click="pickModel(model, models[model])">
        {{ model }}
      </div>
    </div>
    <div v-else class="flex flex-col space-y-3 p-3">
      <div class="text-xl">Context window size</div>
      <div class="flex flex-row items-center space-x-2 text-xs">
        <div>Presets:</div>
        <chip-text class="cursor-pointer" :class="ctx == 256 ? 'success' : 'lighter'"
          @click="preset(256)">256</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 512 ? 'success' : 'lighter'"
          @click="preset(512)">512</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 1024 ? 'success' : 'lighter'"
          @click="preset(1024)">1024</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 2048 ? 'success' : 'lighter'"
          @click="preset(2048)">2048</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 4096 ? 'success' : 'lighter'"
          @click="preset(4096)">4096</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 8192 ? 'success' : 'lighter'"
          @click="preset(8192)">8192</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 16384 ? 'success' : 'lighter'"
          @click="preset(16384)">16384</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 32768 ? 'success' : 'lighter'"
          @click="preset(32768)">32768</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 65536 ? 'success' : 'lighter'"
          @click="preset(65536)">65536</chip-text>
      </div>
      <div>
        <InputNumber v-model="ctx" class="w-64" :useGrouping="false" suffix=" tokens" />
      </div>
      <div>
        <Slider v-model="ctx" class="w-full" :min="32" :max="65536" :step="256" />
      </div>
      <div class="text-xl">GPU layers</div>
      <div class="flex flex-row items-center">
        <InputNumber v-model="gpuLayers" class="w-64" :useGrouping="false" suffix=" layers" />
      </div>
      <div class="text-xl">Threads</div>
      <div class="flex flex-row items-center">
        <InputNumber v-model="threads" class="w-64" :useGrouping="false" suffix=" threads" />
      </div>
      <div class="text-xl">Template</div>
      <div class="flex flex-row items-center" v-if="templateName != 'unknown'">
        <sw-switch v-model:value="loadTemplate" class="switch-success">
          <div class="ml-2" :class="loadTemplate ? '' : 'txt-light'">
            Load the {{ templateName }} template
          </div>
        </sw-switch>
      </div>
      <div v-else class="pt-3">
        <div class="p-float-label">
          <Dropdown v-model="selectedTemplate" inputId="template" :options="templates" optionLabel="name"
            option-value="id" class="w-full" />
          <label for="template">Select template</label>
        </div>
      </div>
      <div>
        <button class="btn mt-3 w-full success" @click="post()">Load model</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SwSwitch from "@snowind/switch";
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import ChipText from "@/widgets/ChipText.vue";
import { selectModelModelsServer } from '@/services/api';
import { PromptTemplate, templates as _genericTemplates } from "modprompt";
import { activeBackend, getLm, hasModelsServer, lmState, loadBackend, models, mutateModel, stream, loadGenericTemplate, tfm } from '@/state';
import { ModelConf } from '@locallm/types';
import { defaultGpuLayers, defaultThreads } from "@/state/settings";
import { defaultBackends } from '@/const/backends';
import { Lm } from '@locallm/api';

const emit = defineEmits(["close"]);

const selectCtx = ref(false);
const selectedModel = ref("");
const ctx = ref<number>(2048);
const templateName = ref("unknown");
const loadTemplate = ref(true);
const gpuLayers = ref(defaultGpuLayers);
const threads = ref(defaultThreads);
const selectedTemplate = ref();
const templates = ref(genTemplates());

function preset(n: number) {
  ctx.value = n;
}

async function pickModel(m: string, t: ModelConf) {
  //console.log("Pick", m, t);
  const lm = getLm();
  if (lm.providerType == "ollama") {
    await lm.loadModel(m);
    //console.log(lm.model);
    selectedModel.value = lm.model.name;
    ctx.value = lm.model.ctx;
    if (lm.model?.gpu_layers) {
      gpuLayers.value = lm.model.gpu_layers;
    }
    if (lm.model?.threads) {
      threads.value = lm.model.threads;
    }
    let tn = "none";
    try {
      tn = await tfm.get(m);
    } catch (e) { }
    if (tn == "none") {
      tn = tfm.guess(m)
    }
    console.log("TN", tn);
    selectedTemplate.value = tn;
  } else {
    selectedModel.value = m;
    ctx.value = t.ctx;
    templateName.value = t.name;
    selectedTemplate.value = t.name;
  }

  // the model has a generic template
  /*if (settings.autoLoadTemplates) {
    //const tpl = new PromptTemplate(t.name)
    //loadGenericTemplate(tpl);
    ctx.value = t.ctx;
    await post();
  }*/
  selectCtx.value = true;
}

function genTemplates(): Array<PromptTemplate> {
  const tpls = new Array<PromptTemplate>();
  for (const name of Object.keys(_genericTemplates)) {
    const _tpl = new PromptTemplate(name);
    tpls.push(_tpl)
  }
  return tpls
}

async function post() {
  emit("close");
  selectCtx.value = false;
  lmState.isLoadingModel = true;
  const lm = lmState.model;
  if (hasModelsServer.value) {
    await selectModelModelsServer(selectedModel.value, ctx.value, threads.value, gpuLayers.value);
    //console.log("Load", selectedModel.value, ctx.value);
    if (!activeBackend.value) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const _lm = new Lm({
        providerType: defaultBackends[1].providerType,
        serverUrl: defaultBackends[1].serverUrl,
        apiKey: defaultBackends[1].apiKey,
        onToken: (t) => stream.value += t,
      });
      _lm.model = { name: selectedModel.value, ctx: ctx.value };
      await loadBackend(_lm, defaultBackends[1]);
    }
  } else if (getLm().providerType == "ollama") {
    //await lm.loadModel(selectedModel.value, ctx.value, threads.value, gpuLayers.value)
  } else {
    throw new Error(`The provider ${getLm().providerType} can not load models`)
  }
  mutateModel({ name: selectedModel.value, ctx: ctx.value, threads: threads.value, gpu_layers: gpuLayers.value });
  //console.log("T", selectedTemplate.value);
  if (selectedTemplate.value) {
    loadGenericTemplate(selectedTemplate.value);
  }
  lmState.isLoadingModel = false;
  lmState.isModelLoaded = true;
  //console.log("Model loaded");
}
</script>