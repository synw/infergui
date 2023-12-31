<template>
  <sw-topbar :topbar="topBar" class="z-10 flex h-16 w-full items-center" breakpoint="lg">
    <template #mobile-back>
      <i-ion-arrow-back-outline class="ml-2 inline-flex text-3xl" v-if="!isHome"></i-ion-arrow-back-outline>
    </template>
    <template #mobile-branding>
      <div class="ml-2 inline-flex h-full flex-row items-center truncate pt-1 text-2xl">
        <div class="text-lg">
          <button class="btn mr-5 border-none" @click="toggleModelCollapse">
            <template v-if="lmState.isLoadingModel">
              Loading model ..
            </template>
            <template v-else-if="lmState.isModelLoaded">
            </template>
            <template v-else>
              Pick a model&nbsp;<i-carbon:network-4></i-carbon:network-4>
            </template>
          </button>
          <OverlayPanel ref="modelCollapse">
            <models-picker @close="toggleModelCollapse"></models-picker>
          </OverlayPanel>
        </div>
      </div>
    </template>
    <template #branding>
      <div class="ml-3 flex h-full flex-row items-center">
        <template v-if="activeBackend !== null">
          <div class="flex flex-row items-center space-x-2 text-lg"
            v-if="['koboldcpp', 'llamacpp'].includes(activeBackend?.providerType)">
            <div><i-iconoir:network-alt class="text-xl"></i-iconoir:network-alt></div>
            <div>{{ lmState.model.name }} <span class="txt-light"> ctx: {{ lmState.model.ctx }}</span></div>
            <div v-if="template.id != 'none'" class="pl-2">
              <div class="txt-semilight text-sm bord-lighter border px-2 py-1 rounded-lg">
                {{ template.name }}
              </div>
            </div>
            <div v-if="useGrammar" class="pl-2">
              <div class="txt-semilight text-sm bord-lighter border px-2 py-1 rounded-lg">
                Grammar
              </div>
            </div>
          </div>
        </template>
        <div class="flex flex-row items-center" v-else>
          <div class="text-lg">No backend</div>
          <div class="ml-3">
            <button class="btn bord-semilight txt-light py-0 text-sm rounded-md"
              @click="probeAndLoadLocalBackends()">Retry</button>
          </div>
        </div>
      </div>
    </template>
    <template #menu>
      <div class="flex h-full w-full flex-row items-center justify-end space-x-2">

        <button v-if="lmState.isRunning == true || lmState.isStreaming == true"
          class="btn flex w-48 flex-row items-center justify-center txt-light bord-light block-lighter"
          @click="stopInfer()">
          <i-icomoon-free:stop class="mr-2"></i-icomoon-free:stop>
          <div>Stop</div>
        </button>
        <button id="clearinfer-btn" class="btn txt-semilight"
          v-if="!(lmState.isRunning || (stream.length == 0 && history.length == 0))"
          @click="stream = ''; clearInferResults(); clearHistory();">
          <i-ion:trash-sharp class="text-2xl"></i-ion:trash-sharp>
        </button>
        <div>
          <format-bar v-if="stream.length > 0 || history.length > 0"></format-bar>
        </div>
        <button class="btn flex flex-row items-center justify-center border-0 bord-light txt-semilight"
          @click="togglePresetsCollapse($event)">
          <i-eva:options-2-outline class="text-2xl"></i-eva:options-2-outline>
        </button>
        <OverlayPanel ref="presetsCollapse">
          <presets-picker @close="togglePresetsCollapse"></presets-picker>
        </OverlayPanel>
        <button class="btn flex flex-row items-center justify-center border-0 bord-light txt-semilight"
          @click="toggleSettingsCollapse($event)">
          <i-fluent:settings-32-regular class="text-2xl"></i-fluent:settings-32-regular>
        </button>
        <OverlayPanel ref="settingsCollapse" @close="toggleSettingsCollapse($event)">
          <SettingsPopin></SettingsPopin>
        </OverlayPanel>

        <button class="btn flex flex-row items-center justify-center border-0 bord-light txt-semilight"
          @click="toggleBackendCollapse($event)">
          <i-uil:server class="text-2xl"></i-uil:server>
        </button>
        <OverlayPanel ref="backendCollapse" @close="toggleBackendCollapse($event)">
          <BackendsPopin></BackendsPopin>
        </OverlayPanel>

        <div class="cursor-pointer pr-5 pl-3 text-lg txt-lighter dark:txt-light" @click="user.toggleDarkMode()">
          <i-fa-solid:moon v-if="!user.isDarkMode.value"></i-fa-solid:moon>
          <i-fa-solid:sun v-else></i-fa-solid:sun>
        </div>
      </div>
    </template>
    <template #mobile-menu>
      <div class="flex flex-col space-y-3 border-y-2 p-3 pb-5 bord-primary lighter">
        <div>
          <button class="btn border-none" @click="$router.push('/page'); topBar.closeMenu()">Page 1</button>
        </div>
        <div class="cursor-pointer text-lg" @click=" user.toggleDarkMode(); topBar.closeMenu()">
          <template v-if="!user.isDarkMode.value">
            <i-fa-solid:moon></i-fa-solid:moon>&nbsp;Dark mode
          </template>
          <template v-else>
            <i-fa-solid:sun></i-fa-solid:sun>&nbsp;Light mode
          </template>
        </div>
      </div>
    </template>
  </sw-topbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SwTopbar, useTopbar } from "@snowind/header";
import { user, stopInfer, lmState, activeBackend, template, stream, history, clearInferResults, clearHistory, probeAndLoadLocalBackends } from "@/state";
import { useGrammar } from '@/state/grammar';
import { useRouter } from 'vue-router';
import OverlayPanel from 'primevue/overlaypanel';
import ModelsPicker from '@/components/ModelsPicker.vue';
import PresetsPicker from "@/components/PresetsPicker.vue";
import SettingsPopin from './SettingsPopin.vue';
import BackendsPopin from './BackendsPopin.vue';
import FormatBar from '@/components/inference/FormatBar.vue';

const router = useRouter()
const topBar = useTopbar(router);
const modelCollapse = ref();
const taskCollapse = ref();
const presetsCollapse = ref();
const settingsCollapse = ref();
const backendCollapse = ref();

const toggleModelCollapse = (event) => {
  modelCollapse.value.toggle(event);
}
const toggleTaskCollapse = (event) => {
  taskCollapse.value.toggle(event);
}
const togglePresetsCollapse = (event) => {
  presetsCollapse.value.toggle(event);
}
const toggleSettingsCollapse = (event) => {
  settingsCollapse.value.toggle(event);
}
const toggleBackendCollapse = (event) => {
  backendCollapse.value.toggle(event);
}

const isHome = computed<boolean>(() => router.currentRoute.value.path == "/");
</script>

<style lang="sass">
#mobile-menu
  @apply absolute left-0 z-40 flex flex-col w-full space-y-3 text-xl top-16 lighter
*
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0)
</style>