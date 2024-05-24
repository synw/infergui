<template>
  <div class="flex flex-col">
    <div class="mb-8 text-xl">Save template</div>
    <div class="p-float-label">
      <InputText inputId="tname" v-model="tname" class="" v-focus @keyup.enter="save" />
      <label for="tname">Name</label>
    </div>
    <template v-if="suggestions.length > 0">
      <div class="flex flex-wrap gap-2 mt-2 txt-light">
        <div v-for="sug in suggestions" class="cursor-pointer" @click="selectSuggestion(sug)">
          {{ sug }}
        </div>
      </div>
    </template>
    <div class="mt-3">
      <button class="btn success" :disabled="tname.length == 0" @click="save">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { deepUnref } from '@ow3/deep-unref-vue';
import { watchDebounced } from '@vueuse/core';
import InputText from 'primevue/inputtext';
import { db, loadTemplates, template, templates } from '@/state';

const emit = defineEmits(["pick"]);
const tname = ref("");
const suggestions = ref<Array<string>>([]);

const slugify = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\W_]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

function selectSuggestion(name: string) {
  tname.value = name;
  suggestions.value = []
}

async function save() {
  template.value.name = tname.value;
  template.value.id = slugify(tname.value);
  const data = deepUnref(template.value.toJson());
  if (data.shots) {
    data.shots = toRaw(data.shots)
  }
  if (data.stop) {
    data.stop = toRaw(data.stop)
  }
  console.log("SAVING DATA", data);
  await db.setTemplate(template.value.id, data);
  await loadTemplates();
  emit("pick")
}

watchDebounced(
  tname,
  () => {
    console.log("T", tname.value);
    const tl = new Array<string>();
    const tn = tname.value.toLowerCase();
    for (const t of templates) {
      const tlow = t.name.toLowerCase();
      if (tlow.startsWith(tn)) {
        if (tlow != tn) {
          tl.push(t.name)
        }
      }
    }
    suggestions.value = tl;
  },
  { debounce: 500, maxWait: 1000 },
)
</script>