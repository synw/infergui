<template>
  <div class="flex flex-col">
    <div class="mb-8 text-xl">Save prompt</div>
    <div class="p-float-label">
      <InputText inputId="promptname" v-model="promptname" class="" v-focus @keyup.enter="save" />
      <label for="promptname">Name</label>
    </div>
    <div class="mt-3">
      <button class="btn success" :disabled="promptname.length == 0" @click="save">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { db, loadPrompts, prompt, prompts } from '@/state';

const emit = defineEmits(["pick"]);
const promptname = ref("");

async function save() {
  console.log("save");
  await db.setPrompt(promptname.value, prompt.value);
  await loadPrompts();
  emit("pick")
}
</script>