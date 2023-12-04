<template>
  <div class="flex flex-col">
    <div class="mb-8 text-xl">Save grammar</div>
    <div class="p-float-label">
      <InputText inputId="name" v-model="name" class="" v-focus @keyup.enter="save" />
      <label for="name">Name</label>
    </div>
    <div class="mt-3">
      <button class="btn success" :disabled="name.length == 0" @click="save">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import { saveGrammar } from '@/state/grammar';
import { msg } from '@/services/notify';

const emit = defineEmits(["pick"]);
const name = ref("");

async function save() {
  await saveGrammar(name.value);
  emit("pick");
  msg.info("Grammar saved", `The ${name.value} grammar has been saved`);
}
</script>