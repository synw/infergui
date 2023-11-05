<template>
  <div class="flex flex-col">
    <template v-if="mode == 'select'">
      <div class="flex flex-col" v-for="backend in backends">
        <div class="flex flex-row space-y-5">
          <div>
            <sw-switch v-model:value="backend.enabled" class="switch-primary"
              @update:value="updateBackend(backend.name, Boolean($event))">
              <div class="ml-2">
                {{ backend.name }}
              </div>
            </sw-switch>
          </div>
        </div>
      </div>
      <!-- div>
        <button class="btn" @click="mode = 'add'">Add backend</button>
      </div -->
    </template>
    <template v-else>
      add
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { backends, loadBackend } from "@/state";
import SwSwitch from "@snowind/switch";
import { probeBackend } from "@/services/api";
import { msg } from '@/services/notify';


const emit = defineEmits(["close"]);
const mode = ref<"add" | "select">("select");

async function updateBackend(name: string, val: boolean) {
  console.log("Update", name, val);
  if (val === true) {
    for (const [k, v] of Object.entries(backends)) {
      if (name == k) {
        backends[k].enabled = true;
        const res = await probeBackend([v]);
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
</script>