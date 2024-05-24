<template>
  <div class="flex flex-col">
    <div class="mb-8 text-xl">Save prompt</div>
    <div class="p-float-label">
      <InputText inputId="promptname" v-model="promptname" class="" v-focus @keyup.enter="save" />
      <label for="promptname">Name</label>
    </div>
    <template v-if="suggestions.length > 0">
      <div class="flex flex-wrap gap-2 mt-2 txt-light">
        <div v-for="sug in suggestions" class="cursor-pointer" @click="selectSuggestion(sug)">
          {{ sug }}
        </div>
      </div>
    </template>
    <div class="mt-3">
      <button class="btn success" :disabled="promptname.length == 0" @click="save">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { db, loadPrompts, prompt, prompts } from '@/state';
import { watchDebounced } from '@vueuse/core';

const emit = defineEmits(["pick"]);
const promptname = ref("");
const suggestions = ref<Array<string>>([]);

function selectSuggestion(name: string) {
  promptname.value = name;
  suggestions.value = []
}

async function save() {
  console.log("save");
  await db.setPrompt(promptname.value, prompt.value);
  await loadPrompts();
  emit("pick")
}

watchDebounced(
  promptname,
  () => {
    const tl = new Array<string>();
    for (const p of prompts) {
      if (p.toLowerCase().startsWith(promptname.value)) {
        tl.push(p)
      }
    }
    suggestions.value = tl;
  },
  { debounce: 500, maxWait: 1000 },
)
</script>