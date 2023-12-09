<template>
  <div class="flex flex-col space-y-2">
    <div>
      <sw-switch v-model:value="useParams.temperature" class="switch-primary" @update:value="setParam('temperature')">
        <div class="ml-2">
          Temperature
        </div>
      </sw-switch>
    </div>
    <div>
      <sw-switch v-model:value="useParams.tfs" class="switch-primary" @update:value="setParam('tfs')">
        <div class="ml-2">
          Tfs
        </div>
      </sw-switch>
    </div>
    <div>
      <sw-switch v-model:value="useParams.top_k" class="switch-primary" @update:value="setParam('top_k')">
        <div class="ml-2">
          Top K
        </div>
      </sw-switch>
    </div>
    <div>
      <sw-switch v-model:value="useParams.top_p" class="switch-primary" @update:value="setParam('top_p')">
        <div class="ml-2">
          Top P
        </div>
      </sw-switch>
    </div>
    <div>
      <sw-switch v-model:value="useParams.min_p" class="switch-primary" @update:value="setParam('min_p')">
        <div class="ml-2">
          Min P
        </div>
      </sw-switch>
    </div>
    <div>
      <sw-switch v-model:value="useParams.frequency_penalty" class="switch-primary"
        @update:value="setParam('frequency_penalty')">
        <div class="ml-2">
          Frequency penalty
        </div>
      </sw-switch>
    </div>
    <div>
      <sw-switch v-model:value="useParams.presence_penalty" class="switch-primary"
        @update:value="setParam('presence_penalty')">
        <div class="ml-2">
          Presence penalty
        </div>
      </sw-switch>
    </div>
    <div>
      <sw-switch v-model:value="useParams.repeat_penalty" class="switch-primary"
        @update:value="setParam('repeat_penalty')">
        <div class="ml-2">
          Repeat penalty
        </div>
      </sw-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import SwSwitch from "@snowind/switch";
import { availableDefaultInferenceParams, defaultInferenceParams } from '@/const/params';
import { inferParams } from "@/state";
import { reactive } from "vue";

const useParams = reactive<Record<string, boolean>>({
  temperature: inferParams?.temperature ? true : false,
  tfs: inferParams?.tfs ? true : false,
  top_k: inferParams?.top_k ? true : false,
  top_p: inferParams?.top_p ? true : false,
  min_p: inferParams?.min_p ? true : false,
  repeat_penalty: inferParams?.repeat_penalty ? true : false,
  presence_penalty: inferParams?.presence_penalty ? true : false,
  frequency_penalty: inferParams?.frequency_penalty ? true : false,

});

function setParam(param: string) {
  //console.log("P", param, useParams[param], availableDefaultInferenceParams[param])
  if (useParams[param]) {
    inferParams[param] = availableDefaultInferenceParams[param];
  } else {
    inferParams[param] = undefined
  }
}
</script>