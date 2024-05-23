<template>
  <div class="flex flex-col">
    <div class="mb-8 text-xl">Save template</div>
    <div class="p-float-label">
      <InputText inputId="tname" v-model="tname" class="" v-focus @keyup.enter="save" />
      <label for="tname">Name</label>
    </div>
    <div class="mt-3">
      <button class="btn success" :disabled="tname.length == 0" @click="save">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { deepUnref } from '@ow3/deep-unref-vue';
import InputText from 'primevue/inputtext';
import { db, loadTemplates, template } from '@/state';

const emit = defineEmits(["pick"]);
const tname = ref("");

const slugify = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\W_]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
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
</script>