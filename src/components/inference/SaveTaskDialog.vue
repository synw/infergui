<template>
  <div class="flex flex-col">
    <div class="p-float-label">
      <InputText inputId="tname" v-model="tname" class="" v-focus @keyup.enter="save" />
      <label for="tname">Path</label>
    </div>
    <div class="mt-3">
      <button class="btn success" :disabled="tname.length == 0" @click="save">Save task</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { api, inferParams, lmState, template } from '@/state';
import { loadTasks } from '@/services/api';

const emit = defineEmits(["save"]);
const tname = ref("");

async function save() {
  const payload = {
    name: tname.value,
    model: lmState.model,
    ctx: lmState.ctx,
    template: template.content,
    inferParams: inferParams,
  }
  emit("save", payload)
  const res = await api.post("/task/save", payload);
  if (res.ok) {
    console.log("Task saved")
  }
  loadTasks()
}
</script>