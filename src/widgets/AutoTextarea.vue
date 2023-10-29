<template>
  <Textarea v-model="_data" :rows="rows" :auto-resize="auto" :class="rows ? 'overflow-y-visible' : ''" @focusout="ch()" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Textarea from 'primevue/textarea';

const props = defineProps({
  data: {
    type: String,
    required: true,
  },
  maxlines: {
    type: Number,
    default: 3,
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

watch(
  () => props.data,
  (_d) => {
    _data.value = _d
  }
)
</script>