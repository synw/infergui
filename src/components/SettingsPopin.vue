<template>
  <div class="flex flex-col space-y-1 overflow-y-auto min-w-[22rem]">
    <div class="flex flex-row">
      <sw-switch label="Switch" v-model:value="autoLoadTemplates" class="switch-primary"
        @update:value="setAutoLoadTemplate()">
        <div class="ml-2">
          Auto load templates
        </div>
      </sw-switch>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { settings } from "@/state";
import SwSwitch from "@snowind/switch";

const autoLoadTemplates = ref(false);

function setAutoLoadTemplate() {
  settings.autoLoadTemplates = autoLoadTemplates.value
}
</script>