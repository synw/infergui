<template>
  <Textarea v-if="auto" v-model="_data" :rows="rows" :auto-resize="auto"
    class="overflow-y-visible focus:ring-0 focus:bord-lighter" @focusout="ch()" />
  <Textarea v-else v-model="_data" :rows="rows" class="overflow-y-visible focus:ring-0 focus:bord-lighter"
    @focusout="ch()" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Textarea from 'primevue/textarea';
import { watchDebounced } from '@vueuse/core';

const props = defineProps({
  data: {
    type: String,
    required: true,
  },
  maxlines: {
    type: Number,
    default: 6,
  }
});

const emit = defineEmits(["update"]);

const _data = ref(props.data);

const auto = computed(() => {
  const nlines = _data.value.split("\n").length;
  return (nlines <= props.maxlines) ? true : false
});
const rows = computed(() => {
  const nlines = _data.value.split("\n").length;
  if (nlines > props.maxlines) {
    return props.maxlines
  }
  return 1
});

function ch() {
  emit("update", _data.value);
}

watchDebounced(
  _data,
  () => { ch() },
  { debounce: 500, maxWait: 1000 },
)

watch(
  () => props.data,
  (_d) => {
    _data.value = _d
  }
)
</script>