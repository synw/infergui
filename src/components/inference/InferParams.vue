<template>
  <div id="params" class="flex w-full flex-col 3xl:max-w-[28rem]">
    <div id="pform" class="grid w-full grid-cols-2 gap-x-3 gap-y-3 3xl:grid-cols-3">
      <div class="flex flex-col">
        <label for="temp" class="txt-semilight">Temperature</label>
        <InputNumber class="w-8" v-model="inferParams.temperature" inputId="temp" :min="0" :max="2" :step="0.1"
          showButtons />          
      </div>
      <div v-if="inferParams.tfs != undefined" class="flex flex-col">
        <label for="tfs" class="txt-semilight">Tfs</label>
        <InputNumber class="w-8" v-model="inferParams.tfs" inputId="tfs" :min="0" :max="2" :step="0.1" showButtons /> 
      </div>
      <div v-if="inferParams.top_k != undefined" class="flex flex-col">
        <label for="topK" class="txt-semilight">TopK</label>
          <InputNumber class="w-8" v-model="inferParams.top_k" inputId="topK" :min="0" :max="100" showButtons />   
      </div>
      <div v-if="inferParams.top_p != undefined" class="flex flex-col">
        <label for="topP" class="txt-semilight">TopP</label> 
          <InputNumber class="w-8" v-model="inferParams.top_p" inputId="topP" :min="0" :max="1" :step="0.05"
            showButtons />   
      </div>
      <div v-if="inferParams.min_p != undefined" class="flex flex-col">
        <label for="minP" class="txt-semilight">MinP</label> 
          <InputNumber class="w-8" v-model="inferParams.min_p" inputId="minP" :min="0" :max="1" :step="0.05"
            showButtons />  
      </div>
      <div v-if="inferParams.repeat_penalty != undefined" class="flex flex-col">
        <label for="repeatPenalty" class="txt-semilight">Repeat</label>
          <InputNumber class="w-8" v-model="inferParams.repeat_penalty" inputId="repeatPenalty" :min="0" :max="2"
            :step="0.1" showButtons />
      </div>
    </div>
    <div class="mr-8 mt-3 flex flex-col">
      <label for="stop" class="txt-semilight">Stop words</label>
      <InputText inputId="stop" v-model="stop" class="w-full" @focusout="setStopParam()" />
    </div>
    <div class="mt-8" v-if="!autoMaxContext">
      <div class="p-float-label">
        <InputText inputId="tokens" class="hidden w-full" />
        <label for="tokens" class="txt-semilight">Max tokens</label>
      </div>
      <div class="mr-8 mt-3">
        <Slider v-model="inferParams.max_tokens" class="w-full" :min="-1" :max="lmState.model.ctx"
          @slideend="updateCtx($event)" />
      </div>
      <div class="flex flex-row">
        <div class="p-3 txt-semilight">-1</div>
        <div class="flex flex-grow justify-center p-3">
          {{ inferParams.max_tokens }}
        </div>
        <div class="p-3 txt-semilight">{{ lmState.model.ctx }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import InputText from 'primevue/inputtext';
import { autoMaxContext } from "@/state/settings";
import { inferParams, lmState, stop, setFreeContext } from '@/state';

function updateCtx(evt) {
  setFreeContext()
}

function setStopParam() {
  inferParams.stop = stop.value.split(",");
  //console.log("Set stop:", inferParams.stop)
}
</script>

<style lang="sass">
#params
  & > #pform > div
    @apply min-w-[8rem]  
  .p-inputtext
    &:not(.w-full)
      width: 4rem !important
  .p-inputnumber-button
    background-color: #e2e8f0 !important
    color: black !important
    border: #e2e8f0 !important
  .p-slider-range
    @apply light
  .p-slider-handle
    @apply border bord-primary
.dark
  #params
    .p-inputnumber-button
      background-color: #525252 !important
</style>