<template>
  <div>
    <div class="ml-3">{{ selectedModel }}</div>
    <div v-if="!selectCtx">
      <ModelsList v-if="getLm().providerType == 'ollama'" :lm="getLm()" @end="pickModel($event.name, $event)"
        @close="$emit('close')"></ModelsList>
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
          @click="preset(1024)">1k</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 2048 ? 'success' : 'lighter'"
          @click="preset(2048)">2k</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 4096 ? 'success' : 'lighter'"
          @click="preset(4096)">4k</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 8192 ? 'success' : 'lighter'"
          @click="preset(8192)">8k</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 16384 ? 'success' : 'lighter'"
          @click="preset(16384)">16k</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 32768 ? 'success' : 'lighter'"
          @click="preset(32768)">32k</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 65536 ? 'success' : 'lighter'"
          @click="preset(65536)">64k</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 131072 ? 'success' : 'lighter'"
          @click="preset(131072)">128k</chip-text>
      </div>
      <div>
        <InputNumber v-model="ctx" class="w-64" :useGrouping="false" suffix=" tokens" />
      </div>
      <div>
        <Slider v-model="ctx" class="w-full" :min="32" :max="131072" :step="256" />
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
import { onMounted, ref } from 'vue';
import SwSwitch from "@snowind/switch";
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import ChipText from "@/widgets/ChipText.vue";
import { PromptTemplate, templates as _genericTemplates } from "modprompt";
import { getLm, lmState, mutateModel, loadGenericTemplate, tfm } from '@/state';
import { ModelConf } from '@locallm/types';
import ModelsList from './ModelsList.vue';

const emit = defineEmits(["close"]);

const selectCtx = ref(false);
const selectedModel = ref("");
const ctx = ref<number>(4096);
const templateName = ref("unknown");
const loadTemplate = ref(true);
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
    let tn = "none";
    try {
      tn = await tfm.get(m);
    } catch (e) { }
    if (tn == "none") {
      tn = tfm.guess(m)
    }
    selectedTemplate.value = tn;
  } else {
    selectedModel.value = m;
    ctx.value = t.ctx;
    templateName.value = t.name;
    selectedTemplate.value = t.name;
  }
  selectCtx.value = true;
}

function genTemplates(): Array<PromptTemplate> {
  const tpls = new Array<PromptTemplate>();
  for (const name of Object.keys(_genericTemplates)) {
    const _tpl = new PromptTemplate(name);
    tpls.push(_tpl)
  }
  return tpls.sort()
}

async function post() {
  emit("close");
  selectCtx.value = false;
  lmState.isLoadingModel = true;
  if (!(getLm().providerType == "ollama")) {
    throw new Error(`The provider ${getLm().providerType} can not load models`)
  }
  mutateModel({ name: selectedModel.value, ctx: ctx.value });
  //console.log("T", selectedTemplate.value);
  if (selectedTemplate.value) {
    loadGenericTemplate(selectedTemplate.value);
  }
  lmState.isLoadingModel = false;
  lmState.isModelLoaded = true;
  //console.log("Model loaded");
}

onMounted(() => {
  if (getLm().providerType != 'ollama') {
    selectCtx.value = true
  }
})
</script>