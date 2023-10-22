<template>
  <div class="flex flex-col">
    <div class="flex flex-col">
      <button class="flex flex-row space-x-2 text-sm border-b shadow-sm btn bord-lighter"
        :class="collapseGen ? 'txt-lighter' : 'txt-light'" @click="collapseGen = !collapseGen">
        <div class="flex-grow">Generic templates</div>
        <div><i-ep:d-caret></i-ep:d-caret></div>
      </button>
      <div :class="{
        'slide-y': true,
        'slideup': collapseGen === true,
        'slidedown': collapseGen === false,
        'pb-3': collapseGen === false,
      }">
        <div v-for="t in _genTemplates()" class="flex flex-row items-center group">
          <div class="justify-start w-2/3 ml-2 truncate overflow-ellipsis">
            <button class="btn" @click="loadGenericTemplate(t)">
              {{ t.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col">
      <button class="flex flex-row space-x-2 text-sm border-b shadow-sm btn bord-lighter"
        :class="collapseCustom ? 'txt-lighter' : 'txt-light'" @click="collapseCustom = !collapseCustom">
        <div class="flex-grow">Custom templates</div>
        <div><i-ep:d-caret></i-ep:d-caret></div>
      </button>
      <div :class="{
        'slide-y': true,
        'slideup': collapseCustom === true,
        'slidedown': collapseCustom === false
      }">
        <div v-for="t in templates" class="flex flex-row items-center group">
          <div class="justify-start w-2/3 ml-2 truncate overflow-ellipsis">
            <button class="btn" @click="loadCustomTemplate(t)">
              {{ t }}
            </button>
          </div>
          <div
            class="flex flex-row justify-end w-1/3 mr-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            <confirm-delete @delete="db.delTemplate(t); loadTemplates()"></confirm-delete>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { templates as _genericTemplates, PromptTemplate } from "modprompt";
import ConfirmDelete from '@/widgets/ConfirmDelete.vue';
import { db, loadTemplates, templates, loadCustomTemplate, loadGenericTemplate } from '@/state';

const collapseGen = ref(false);
const collapseCustom = ref(false);

function _genTemplates(): Array<PromptTemplate> {
  const tpls = new Array<PromptTemplate>();
  for (const name of Object.keys(_genericTemplates)) {
    const _tpl = new PromptTemplate(name);
    tpls.push(_tpl)
  }
  return tpls
}

onBeforeMount(() => loadTemplates())
</script>