<template>
  <div>
    <!-- overlay-list v-if="!selectCtx" :elems="models" @pick="pickModel($event)"></overlay-list -->
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
        <chip-text class="cursor-pointer" :class="ctx == 256 ? 'success' : 'lighter'" @click="preset(256)">256</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 512 ? 'success' : 'lighter'" @click="preset(512)">512</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 1024 ? 'success' : 'lighter'"
          @click="preset(1024)">1024</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 2048 ? 'success' : 'lighter'"
          @click="preset(2048)">2048</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 4096 ? 'success' : 'lighter'"
          @click="preset(4096)">4096</chip-text>
        <chip-text class="cursor-pointer" :class="ctx == 8192 ? 'success' : 'lighter'"
          @click="preset(8192)">8192</chip-text>
      </div>
      <div>
        <InputNumber v-model="ctx" class="w-64" :useGrouping="false" suffix=" tokens" />
      </div>
      <div>
        <Slider v-model="ctx" class="w-full" :min="32" :max="8192" :step="64" />
      </div>
      <div class="text-xl">GPU layers</div>
      <div class="flex flex-row items-center">
        <InputNumber v-model="gpuLayers" class="w-64" :useGrouping="false" suffix=" layers" />
      </div>
      <div class="text-xl">Template</div>
      <div class="flex flex-row items-center">
        <sw-switch v-model:value="loadTemplate" class="switch-success">
          <div class="ml-2" :class="loadTemplate ? '' : 'txt-light'">
            Load the {{ templateName }} template
          </div>
        </sw-switch>
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
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import ChipText from "@/widgets/ChipText.vue";
import { selectModel } from '@/services/api';
import { templates as _genericTemplates } from "modprompt";
import { lmState, models } from '@/state';
import { ModelTemplate } from '@locallm/api';

const emit = defineEmits(["close"]);

const selectCtx = ref(false);
const selectedModel = ref("");
const ctx = ref<number>(2048);
const templateName = ref("");
const loadTemplate = ref(true);
const gpuLayers = ref(0);

function preset(n: number) {
  ctx.value = n;
}

async function pickModel(m: string, t: ModelTemplate) {
  //console.log("Pick", m, t);
  selectedModel.value = m;
  if (t.name != "unknown") {
    ctx.value = t.ctx;
    templateName.value = t.name;
    // the model has a generic template
    /*if (settings.autoLoadTemplates) {
      //const tpl = new PromptTemplate(t.name)
      //loadGenericTemplate(tpl);
      ctx.value = t.ctx;
      await post();
    }*/
  }
  selectCtx.value = true;
}

async function post() {
  emit("close");
  selectCtx.value = false;
  lmState.isLoadingModel = true;
  //console.log("Load", selectedModel.value, ctx.value);
  await selectModel(selectedModel.value, ctx.value, gpuLayers.value, loadTemplate.value);
  //console.log("Model loaded");
  lmState.isLoadingModel = false;
}
</script>