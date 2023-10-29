<template>
  <div>
    <template v-if="tmode == 'render'">
      <AutoTextarea :data="renderedTemplate" :maxlines="8" class="w-full" disabled />
    </template>
    <template v-else>
      <div class="flex flex-col">
        <template v-if="template.system">
          <div class="flex flex-row mb-1">
            <div class="ml-6 w-32">System blocks</div>
            <div class=""></div>
          </div>
          <div v-if="template.prefix" class="flex flex-row">
            <div class="flex w-32 flex-row items-center justify-center text-sm">Prefix:</div>
            <div class="w-full">
              <AutoTextarea class="w-full" :data="template.prefix" @update="template.prefix = $event" />
            </div>
          </div>
          <div v-if="template.system?.schema" class="flex flex-row">
            <div class="flex w-32 flex-row items-center justify-center text-sm">Schema:</div>
            <div class="w-full">
              <AutoTextarea class="w-full" :data="template.system.schema" @update="template.system.schema = $event" />
            </div>
          </div>
          <div v-if="template.system?.message" class="flex flex-row">
            <div class="flex w-32 flex-row items-center justify-center text-sm">Message:</div>
            <div class="w-full">
              <AutoTextarea class="w-full" :data="template.system.message" @update="template.system.message = $event" />
            </div>
          </div>
        </template>

        <div class="mt-2 flex flex-row">
          <div class="ml-6 w-32">Prompt blocks</div>
          <div class=""></div>
        </div>
        <div class="mt-1 flex flex-row">
          <div class="flex w-32 flex-row items-center justify-center text-sm">User:</div>
          <div class="w-full">
            <AutoTextarea class="w-full" :data="template.user" @update="template.user = $event"></AutoTextarea>
          </div>
        </div>
        <div class="flex flex-row">
          <div class="flex w-32 flex-row items-center justify-center text-sm">Assistant:</div>
          <div class="w-full">
            <AutoTextarea class="w-full" :data="template.assistant" @update="template.assistant = $event" />
          </div>
        </div>

        <div class="mt-2 flex flex-row">
          <div class="ml-6 w-32">Shots</div>
          <div class=""></div>
        </div>
        <div class="mt-1 flex flex-row">
          <div class="flex w-32 flex-row items-center justify-center text-sm">User:</div>
          <div class="w-full">
            <AutoTextarea class="w-full" :data="template.user" @update="template.user = $event"></AutoTextarea>
          </div>
        </div>
        <div class="flex flex-row">
          <div class="flex w-32 flex-row items-center justify-center text-sm">Assistant:</div>
          <div class="w-full">
            <AutoTextarea class="w-full" :data="template.assistant" @update="template.assistant = $event" />
          </div>
        </div>

        <template v-if="showParams">
          <div class="mt-2 flex flex-row">
            <div class="ml-6 w-32">Parameters</div>
            <div class=""></div>
          </div>
          <div class="mt-1 flex flex-row">
            <div class="flex w-32 flex-row items-center justify-center text-sm">Stop words:</div>
            <div class="w-full"><Textarea v-model="stop" rows="1" class="w-full" /></div>
          </div>
          <div class="flex flex-row" v-if="afterShot.length > 0">
            <div class="flex w-32 flex-row items-center justify-center text-sm">After shot:</div>
            <div class="w-full"><Textarea v-model="afterShot" rows="1" class="w-full" /></div>
          </div>
          <template v-if="template.linebreaks">
            <div class="flex flex-row">
              <div class="mt-3 flex w-32 flex-row justify-center text-sm">Linebreaks:</div>
              <div class="flex w-full flex-col">
                <div v-if="template.linebreaks.system !== undefined" class="flex flex-row items-center">
                  <div class="w-20 text-sm">System:</div>
                  <div>
                    <InputNumber class="w-8" v-model="template.linebreaks.system" showButtons :step="1" :min="0" />
                  </div>
                </div>
                <div v-if="template.linebreaks.user !== undefined" class="flex flex-row items-center">
                  <div class="w-20 text-sm">User:</div>
                  <div>
                    <InputNumber class="w-8" v-model="template.linebreaks.user" showButtons :step="1" :min="0" />
                  </div>
                </div>
                <div v-if="template.linebreaks.assistant !== undefined" class="flex flex-row items-center">
                  <div class="w-20 text-sm">Assistant:</div>
                  <div>
                    <InputNumber class="w-8" v-model="template.linebreaks.assistant" showButtons :step="1" :min="0" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </template>
    <div class="flex flex-row text-sm">
      <div class="ml-6 mt-2 text-base txt-light">Prompt:</div>
      <div class="flex flex-grow flex-row items-center justify-end">
        <!-- div>
          <button class="btn text-xs txt-light">
            Add a shot</button>
        </div -->
        <div v-if="tmode == 'edit'">
          <button class="btn text-xs txt-light" @click="toggleParams()">
            <span v-if="showParams">Hide</span>
            <span v-else>Show</span>
            params</button>
        </div>
        <div>
          <button v-if="tmode == 'edit'" class="btn txt-light bord-lighter" @click="toggleMode('render')">Render
            template</button>
          <button v-else class="btn txt-light bord-lighter" @click="toggleMode('edit')">Edit template</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import { PromptTemplate } from 'modprompt';
import AutoTextarea from '@/widgets/AutoTextarea.vue';
import { template } from '@/state';

const props = defineProps({
  template: {
    type: Object as () => PromptTemplate,
    required: true,
  }
});

const renderedTemplate = ref("{prompt}");
const tmode = ref<"edit" | "render">("edit");
const stop = ref("");
const afterShot = ref("");
const showParams = ref(false);

function toggleMode(m: "render" | "edit") {
  tmode.value = m
}

function toggleParams() {
  showParams.value = !showParams.value
}

const showSystemMsg = computed(() => {
  if (template.value.system?.message) {
    return true
  } else {
    if (template.value.system?.schema) {
      return true
    }
  }
  return false
})

watchEffect(() => {
  renderedTemplate.value = props.template.render();
  let hasStop = false;
  if (props.template?.stop) {
    if (props.template.stop.length > 0) {
      hasStop = true;
      stop.value = props.template.stop?.join(",")
    }
  }
  if (props.template.afterShot) {
    afterShot.value = props.template.afterShot.replaceAll("\n", "\\n")
  }
})
</script>

<style lang="sass" scoped>
.p-inputnumber-button
  background-color: #e2e8f0 !important
  color: black !important
  border: #e2e8f0 !important
.dark
  .p-inputnumber-button
    background-color: #525252 !important
</style>