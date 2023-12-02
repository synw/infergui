<template>
  <div id="infer-block" class="form h-main mb-12 overflow-y-auto px-3">
    <div class="flex w-full flex-col">
      <div class="flex flex-row justify-end">
        <button class="btn flex flex-row space-x-2 text-sm txt-light" @click="collapseTemplate = !collapseTemplate">
          <div v-if="collapseTemplate">Expand template</div>
          <div v-else>Collapse template</div>
          <div><i-ep:d-caret></i-ep:d-caret></div>
        </button>
      </div>
      <div :class="{
        'slide-y': true,
        'slideup': collapseTemplate === true,
        'slidedown': collapseTemplate === false,
      }">
        <div>
          <template-editor></template-editor>
        </div>
      </div>

      <div v-if="history.length > 0" class="flex flex-col space-y-3 mt-5 mx-5">
        <template v-for="turn in history">
          <template v-if="turn.images">

            <img :src="turn.images[0].data" alt="Error" />
          </template>
          <template v-if="turn.user.length > 0">
            <template v-if="formatMode == 'Html'">
              <div class="text-justify txt-light"
                v-html="turn.user.replaceAll('\n', '<br />').replaceAll('\t', '&nbsp;&nbsp;')"></div>
              <div class="text-justify"
                v-html="turn.assistant.replaceAll('\n', '<br />').replaceAll('\t', '&nbsp;&nbsp;')">
              </div>
            </template>
            <template v-else-if="formatMode == 'Text'">
              <pre class="txt-light">{{ turn.user }}</pre>
              <pre>{{ turn.assistant }}</pre>
            </template>
            <div class="prosed prose" v-else-if="formatMode == 'Markdown'">
              <div class="txt-light" v-html="turn.user"></div>
              <render-md :hljs="hljs" :source="turn.assistant"></render-md>
            </div>
          </template>
        </template>
      </div>

      <div class="mx-5 mt-3">
        <div v-if="lmState.isRunning == true" class="txt-light">{{ prompt }}</div>
        <div v-if="lmState.isRunning == true && lmState.isStreaming == false" class="txt-lighter">
          <div class="mt-3">
            <i-line-md:downloading-loop class="text-lg mr-2"></i-line-md:downloading-loop>Ingesting prompt ...
          </div>
        </div>
        <div v-if="formatMode == 'Html'" class="text-justify mt-3"
          v-html="stream.replaceAll('\n', '<br />').replaceAll('\t', '&nbsp;&nbsp;')">
        </div>
        <div v-else-if="formatMode == 'Text'" class="mt-3">
          <pre>{{ stream }}</pre>
        </div>
        <div class="prosed prose mt-3" v-else-if="formatMode == 'Markdown'">
          <render-md :hljs="hljs" :source="stream"></render-md>
        </div>
      </div>

      <div v-if="lmState.isModelMultimodal && !lmState.isRunning" class="mt-2 flex flex-row items-center">
        <div class="mx-6 pt-2 txt-light text-lg">Image {{ history.length + 1 }}</div>
        <div class="">
          <ImageLoader></ImageLoader>
        </div>
      </div>

      <div class="pt-2">
        <AutoTextarea v-if="!lmState.isRunning" :data="prompt" class="h-24 w-full" :maxlines="8"
          @update="prompt = $event" />
      </div>
      <div class="flex flex-row items-center justify-end space-x-2 py-3" v-if="lmState.isModelLoaded">
        <div class="flex flex-grow flex-row items-center txt-semilight">
          <!-- button class="btn px-2" v-show="template.id != 'none'" @click="toggleSaveTask($event)">
            <i-carbon:task-star class="text-2xl"></i-carbon:task-star>
          </button>
          <OverlayPanel ref="saveTaskCollapse">
            <save-task-dialog class="p-3" @save="toggleSaveTask($event)"></save-task-dialog>
          </OverlayPanel -->
          <button class="btn px-2" v-show="template.id != 'none'" @click="toggleSaveTemplate($event)">
            <i-bi:menu-up class="text-xl"></i-bi:menu-up>
          </button>
          <OverlayPanel ref="saveTemplateCollapse" @hide="console.log($event)">
            <save-template-dialog class="p-3" @pick="toggleSaveTemplate($event)"></save-template-dialog>
          </OverlayPanel>
          <button class="btn px-2" v-show="prompt.length > 0" @click="toggleSavePrompt($event)">
            <i-tabler:prompt class="text-3xl"></i-tabler:prompt>
          </button>
          <OverlayPanel ref="savePromptCollapse">
            <save-prompt-dialog class="p-3" @pick="toggleSavePrompt($event)"></save-prompt-dialog>
          </OverlayPanel>
        </div>
        <format-bar v-if="stream.length > 0 || history.length > 0" @select="selectFormatMode($event)"></format-bar>
        <button id="clearinfer-btn" class="btn txt-semilight"
          :disabled="(lmState.isRunning || (stream.length == 0 && history.length == 0)) ? true : false"
          @click="stream = ''; clearInferResults(); clearHistory(); collapseTemplate = false">
          <i-grommet-icons:clear class="text-xl"></i-grommet-icons:clear>
        </button>
        <div>
          <button id="runinfer-btn" class="btn flex w-48 flex-row items-center txt-light bord-light block-lighter"
            @click="processInfer(); collapseTemplate = true" :disabled="prompt.length == 0 || lmState.isRunning == true">
            <i-iconoir:play class="mr-2 text-xl"></i-iconoir:play>
            <div>Run inference</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { watchDebounced } from '@vueuse/core';
import OverlayPanel from 'primevue/overlaypanel';
import { RenderMd } from '@docdundee/vue';
import SavePromptDialog from './SavePromptDialog.vue';
import SaveTemplateDialog from './SaveTemplateDialog.vue';
import ImageLoader from './ImageLoader.vue';
//import SaveTaskDialog from './SaveTaskDialog.vue';
import FormatBar from './FormatBar.vue';
import { template, prompt, countPromptTokens, countTemplateTokens, processInfer, clearInferResults, stream, lmState, clearHistory, history } from '@/state';
import { hljs } from "@/conf";
import TemplateEditor from './TemplateEditor.vue';
import { formatMode } from '@/state/settings';
import AutoTextarea from '@/widgets/AutoTextarea.vue';

const savePromptCollapse = ref();
const saveTemplateCollapse = ref();
const saveTaskCollapse = ref();
const collapseTemplate = ref(false);

/*function imgFromHistory(i: number) {
  if (inferParams.image_data) {
    if (inferParams.image_data.at(i)) {

    }
  }
}*/

function toggleSavePrompt(evt) {
  savePromptCollapse.value.toggle(evt);
}

function toggleSaveTemplate(evt) {
  saveTemplateCollapse.value.toggle(evt);
}

function toggleSaveTask(evt) {
  saveTaskCollapse.value.toggle(evt);
}

function selectFormatMode(evt) {
  //console.log("F", evt)
}

onMounted(() => {
  countPromptTokens();
  countTemplateTokens();
  watchDebounced(template, countTemplateTokens, { debounce: 1000, maxWait: 5000 });
  watchDebounced(prompt, countPromptTokens, { debounce: 1000, maxWait: 5000 });
})
</script>

<style lang="sass">
#runinfer-btn:disabled
  @apply opacity-25
#clearinfer-btn:disabled
  @apply opacity-0
</style>