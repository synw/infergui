<template>
  <div id="infer-block" class="form h-main mb-12 overflow-y-auto">
    <div class="flex w-full flex-col">
      <div class="flex flex-row">
        <div class="flex flex-col">
          <div>
            <div class="flex flex-row w-full txt-light">
              <button class="w-max p-2 border border-t-0 bord-lighter"
                :class="(activeTab == 'template' && !collapseTemplate) ? ['border-b-0', 'txt-semilight'] : 'txt-lighter'"
                @click="openTab('template'); collapseTemplate = false">Template</button>
              <button class="w-max p-2 border border-t-0 bord-lighter"
                :class="activeTab == 'grammar' ? ['border-b-0', 'txt-semilight'] : 'txt-lighter'"
                @click="openTab('grammar'); collapseTemplate = false">Grammar</button>
            </div>
          </div>
        </div>
        <div class="flex flex-row flex-grow justify-end bord-lighter border-b">
          <button class="btn flex flex-row space-x-2 text-sm txt-light" @click="collapseTemplate = !collapseTemplate">
            <div v-if="collapseTemplate">Expand</div>
            <div v-else>Collapse</div>
            <div><i-ep:d-caret></i-ep:d-caret></div>
          </button>
        </div>
      </div>

      <div :class="{
        'slide-y': true,
        'slideup': collapseTemplate === true,
        'slidedown': collapseTemplate === false,
      }">
        <div v-if="activeTab == 'template'">
          <template-editor class="pr-5"></template-editor>
        </div>
        <div v-else>
          <GrammarEditor class="mx-5 mt-3"></GrammarEditor>
        </div>
      </div>

      <div v-if="history.length > 0" class="flex flex-col space-y-3 mt-5 mx-5">
        <template v-for="(turn, i) in history">
          <div v-if="turn.images">
            <img class="w-max" :src="turn.images[0].data" alt="Error" />
          </div>
          <template v-if="turn.user.length > 0">
            <template v-if="formatMode == 'Html'">
              <div class="text-justify">
                <div class="txt-light inline-block"
                  v-html="turn.user.replaceAll('\n', '<br />').replaceAll('\t', '&nbsp;&nbsp;')">
                </div>
                <span>
                  <button v-if="turn.assistant.length > 0" class="btn flex-none txt-lighter hover:txt-light"
                    @click="restartFromTurn(i, turn)">
                    <i-icon-park-twotone:replay-music class="text-lg"></i-icon-park-twotone:replay-music>&nbsp;Restart
                    from here
                  </button>
                </span>
              </div>
              <div class="text-justify mt-5"
                v-html="turn.assistant.replaceAll('\n', '<br />').replaceAll('\t', '&nbsp;&nbsp;')">
              </div>
            </template>
            <template v-else-if="formatMode == 'Text'">
              <div>
                <pre class="txt-light inline-block">{{ turn.user }}</pre>
                <span>
                  <button v-if="turn.assistant.length > 0" class="btn flex-none txt-lighter hover:txt-light"
                    @click="restartFromTurn(i, turn)">
                    <i-icon-park-twotone:replay-music class="text-lg"></i-icon-park-twotone:replay-music>&nbsp;Restart
                    from here
                  </button>
                </span>
              </div>
              <pre>{{ turn.assistant }}</pre>
            </template>
            <div v-else-if="formatMode == 'Markdown'">
              <div class="">
                <div class="txt-light inline-block" v-html="turn.user"></div>
                <span>
                  <button v-if="turn.assistant.length > 0" class="btn flex-none txt-lighter hover:txt-light"
                    @click="restartFromTurn(i, turn)">
                    <i-icon-park-twotone:replay-music class="text-lg"></i-icon-park-twotone:replay-music>&nbsp;Restart
                    from here
                  </button>
                </span>
                <div class="prosed prose">
                  <render-md :hljs="hljs" :source="turn.assistant"></render-md>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <div class="mx-5 mt-5">
        <div v-if="lmState.isRunning == true" class="flex flex-col space-y-3">
          <div v-if="currentImgData.length > 0">
            <img :src="currentImgData" alt="Error" />
          </div>
          <div class="txt-light">{{ prompt }}</div>
        </div>
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

      <div class="pt-2 px-5">
        <AutoTextarea v-if="!lmState.isRunning" :data="prompt" class="h-24 w-full" :maxlines="8"
          @update="prompt = $event" />


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


          <div>
            <button id="runinfer-btn" class="btn flex w-48 flex-row items-center txt-light bord-light block-lighter"
              @click="processInfer(); collapseTemplate = true"
              :disabled="prompt.length == 0 || lmState.isRunning == true">
              <i-iconoir:play class="mr-2 text-xl"></i-iconoir:play>
              <div>Run inference</div>
            </button>
          </div>
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
import { confirmSuccess } from '@/services/notify';
//import SaveTaskDialog from './SaveTaskDialog.vue';
import {
  template,
  prompt,
  currentImgData,
  countPromptTokens,
  countTemplateTokens,
  processInfer,
  stream,
  lmState,
  history,
  cutHistoryAfterTurn,
} from '@/state';
import { hljs } from "@/conf";
import TemplateEditor from './TemplateEditor.vue';
import { formatMode } from '@/state/settings';
import AutoTextarea from '@/widgets/AutoTextarea.vue';
import GrammarEditor from './GrammarEditor.vue';
import { HistoryTurn } from 'modprompt';

const savePromptCollapse = ref();
const saveTemplateCollapse = ref();
const saveTaskCollapse = ref();
const collapseTemplate = ref(false);

type TabType = "template" | "grammar";

const activeTab = ref<TabType>("template");

function openTab(t: TabType) {
  //console.log("Open", t)
  activeTab.value = t;
}

function toggleSavePrompt(evt) {
  savePromptCollapse.value.toggle(evt);
}

function toggleSaveTemplate(evt) {
  saveTemplateCollapse.value.toggle(evt);
}

/*function toggleSaveTask(evt) {
  saveTaskCollapse.value.toggle(evt);
}*/

function restartFromTurn(n: number, turn: HistoryTurn) {
  confirmSuccess(
    `Restart from turn ${n + 1} ?`,
    "This will delete later conversation history",
    async () => {
      cutHistoryAfterTurn(n);
      prompt.value = turn.user;
    }
  )
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