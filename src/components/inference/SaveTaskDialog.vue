<template>
  <div class="flex flex-col">
    <div class="mb-8 text-xl">Save task</div>
    <div class="p-float-label">
      <InputText inputId="tname" v-model="tname" class="" v-focus @keyup.enter="save" />
      <label for="tname">Path</label>
    </div>
    <div class="mt-3">
      <button class="btn success" :disabled="tname.length == 0" @click="save">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { api, inferParams, template } from '@/state';
import { loadTasks } from '@/services/api';
import { Task } from '@goinfer/types';

const emit = defineEmits(["save"]);
const tname = ref("");

async function save() {
  const payload: Task = {
    name: tname.value,
    modelConf: api.model,
    template: template.content,
    inferParams: inferParams,
  }
  emit("save", payload)
  const res = await api.api.post("/task/save", payload);
  if (res.ok) {
    console.log("Task saved")
  }
  loadTasks()
}
</script>