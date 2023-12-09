<template>
  <div class="min-w-[14em]">
    <template v-if="viewMode == 'list'">
      <div class="flex flex-col space-y-1 overflow-y-auto">
        <div v-for="preset in presets" class="flex flex-row group">
          <div class="justify-start w-2/3 ml-2 truncate">
            <button class="btn" :class="selectedPreset == preset ? '' : 'txt-light'"
              @click="loadPreset(preset); $emit('close')">
              {{ preset }}
            </button>
          </div>
          <div
            class="flex flex-row justify-end w-1/3 mr-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            <confirm-delete @delete="delPreset(preset); $emit('close')"></confirm-delete>
          </div>
        </div>
      </div>

      <div class="border-t bord-lighter">
        <button class="flex flex-row items-center mt-3 btn" @click="toggleSaveMode()">
          <div class="mr-2 txt-light">
            <i-cil:save></i-cil:save>
          </div>
          <div>Save preset</div>
        </button>
      </div>
      <div class="mt-3">
        <button class="flex flex-row items-center btn" @click="viewMode = 'params'">
          <div class="mr-2 txt-light">
            <i-fluent-mdl2:column-options></i-fluent-mdl2:column-options>
          </div>
          <div>
            Edit params</div>
        </button>
      </div>
    </template>
    <template v-else-if="viewMode == 'save'">
      <div class="flex flex-col pt-5">
        <div class="p-float-label">
          <InputText inputId="promptname" v-model="presetname" class="" v-focus
            @keyup.enter="savePreset(presetname); $emit('close')" />
          <label for="promptname">Name</label>
        </div>
        <div class="mt-3">
          <button class="btn success" @click="savePreset(presetname); $emit('close')">Save preset</button>
        </div>
      </div>
    </template>
    <template v-else>
      <params-editor></params-editor>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw } from "vue";
import InputText from 'primevue/inputtext';
import ConfirmDelete from '@/widgets/ConfirmDelete.vue';
import { db, inferParams, presets, loadPresets, mutateInferParams } from "@/state";
import { selectedPreset } from "@/state/settings";
import { loadPreset, savePreset, delPreset } from "@/state/presets";
import ParamsEditor from "./ParamsEditor.vue";

const emit = defineEmits(["close"]);

type ViewMode = "list" | "save" | "params";

const viewMode = ref<ViewMode>("list");
const presetname = ref();

function toggleSaveMode() {
  viewMode.value = "save";
}


</script>