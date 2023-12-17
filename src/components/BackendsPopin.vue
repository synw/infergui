<template>
  <div class="flex flex-col min-w-[14rem]">
    <template v-if="mode == 'select'">
      <div class="flex flex-col" v-for="backend in backends">
        <div class="flex flex-row space-y-8">
          <div>
            <sw-switch v-model:value="backend.enabled" class="switch-primary"
              @update:value="enableBackend(backend.name, Boolean($event))">
              <div class="ml-2">
                {{ backend.name }}
              </div>
            </sw-switch>
          </div>
        </div>
      </div>
      <div class="text-sm mt-2">
        <button class="btn border txt-light bord-lighter" @click="mode = 'edit'">Edit backends</button>
      </div>
    </template>
    <template v-else-if="mode == 'edit'">
      <div class="flex flex-col" v-for="backend in backends">
        <div class="flex flex-row items-center">
          <div class="ml-2 flex-grow cursor-pointer" @click="updateBackend(backend)">
            {{ backend.name }}
          </div>
          <div>
            <confirm-delete @delete="deleteBackend(backend.name)"></confirm-delete>
          </div>
        </div>
      </div>
      <div class="flex flex-row mt-3 text-sm space-x-2">
        <button class="btn border txt-light bord-lighter" @click="mode = 'select'">Back</button>
        <button class="btn border txt-light bord-lighter" @click="mode = 'add';">New backend</button>
      </div>
    </template>
    <template v-else-if="mode == 'add' || mode == 'updateb'">
      <div class="flex flex-col space-y-6">
        <div class="text-lg" v-if="mode == 'add'">Add a backend</div>
        <div class="text-lg" v-else>Edit backend</div>
        <div>
          <div class="p-float-label">
            <Dropdown v-if="mode == 'add'" v-model="backend" inputId="backend" :options="backendsTypes" optionLabel="name"
              option-value="provider" class="w-full" />
            <Dropdown v-else :model-value="backend.provider" inputId="backend" :options="backendsTypes" optionLabel="name"
              option-value="provider" class="w-full" :disabled="true" :placeholder="backend.provider" />
            <label for="backend">Type</label>
          </div>
        </div>
        <div>
          <div class="p-float-label">
            <InputText inputId="name" v-model="name" class="" />
            <label for="name">Name</label>
          </div>
        </div>
        <div>
          <div class="p-float-label">
            <InputText inputId="url" v-model="url" class="" />
            <label for="url">Server url</label>
          </div>
        </div>
        <div>
          <div class="p-float-label">
            <InputText inputId="apiKey" v-model="apiKey" class="" />
            <label for="apiKey">Api key</label>
          </div>
        </div>
        <div class="flex flex-row text-sm space-x-2 pt-3">
          <button class="btn border txt-light bord-lighter" @click="mode = 'edit'; clearForm()">Back</button>
          <button class="btn success flex-grow" :disabled="!canSaveForm" @click="saveBackend()">Save</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import { backends, loadBackend, loadBackends, db } from "@/state";
import SwSwitch from "@snowind/switch";
import { probeBackend } from "@/services/api";
import { msg } from '@/services/notify';
import ConfirmDelete from '@/widgets/ConfirmDelete.vue';
import { LmBackend } from '@/interfaces';

const emit = defineEmits(["close"]);
const mode = ref<"edit" | "select" | "add" | "updateb">("select");
const name = ref();
const url = ref();
const apiKey = ref();
const backendsTypes = ref([
  { name: "Llamacpp.cpp", provider: "llamacpp" },
  { name: "Koboldcpp", provider: "koboldcpp" },
  //{ name: "Ollama", provider: "ollama" },
]);
const backend = ref();

function updateBackend(_backend: LmBackend) {
  mode.value = "updateb";
  name.value = _backend.name;
  url.value = _backend.serverUrl;
  apiKey.value = _backend.apiKey;
  backend.value = { name: _backend.name, provider: _backend.providerType }
}

async function enableBackend(name: string, val: boolean) {
  console.log("Enable", name, val);
  if (val === true) {
    for (const [k, v] of Object.entries(backends)) {
      if (name == k) {
        backends[k].enabled = true;
        const res = await probeBackend(v);
        if (res !== null) {
          await loadBackend(res.lm, res.backend)
        } else {
          msg.warn("The backend is down", `The ${name} backend does not respond, can not activate it`, 12000);
          backends[k].enabled = false;
        }
      } else {
        backends[k].enabled = false;
      }
    }
  } else {
    // unload backend
  }
  emit('close')
}

function clearForm() {
  backend.value = null;
  name.value = null;
  url.value = null;
  apiKey.value = null;
}

async function deleteBackend(name: string) {
  console.log("Deleting backend", name);
  await db.deleteBackend(name);
  await loadBackends();
}

async function saveBackend() {
  const b: LmBackend = {
    name: name.value,
    providerType: backend.value.provider,
    serverUrl: url.value,
    apiKey: apiKey.value,
    enabled: false,
  }
  //console.log("Adding new backend", JSON.stringify(b, null, "  "));
  await db.setBackend(b.name, b);
  await loadBackends();
  mode.value = "edit";
  clearForm();
}

const canSaveForm = computed(() => {
  return backend.value && url.value && name.value
})
</script>