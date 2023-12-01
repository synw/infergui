<template>
  <div class="flex flex-col">
    <div class="flex flex-col">
      <button class="btn flex flex-row space-x-2 border-b text-sm shadow-sm bord-lighter"
        :class="templateSidebarShowGeneric ? 'txt-lighter' : 'txt-light'"
        @click="templateSidebarShowGeneric = !templateSidebarShowGeneric">
        <div class="flex-grow">Generic templates</div>
        <div><i-ep:d-caret></i-ep:d-caret></div>
      </button>
      <div :class="{
        'slide-y': true,
        'slideup': templateSidebarShowGeneric === true,
        'slidedown': templateSidebarShowGeneric === false,
        'pb-3': templateSidebarShowGeneric === false,
      }">
        <div v-for="t in _genTemplates()" class="group flex flex-row items-center">
          <div class="ml-2 mt-1 w-2/3 justify-start truncate overflow-ellipsi">
            <button class="btn py-0" @click="_loadGenericTemplate(t.id)">
              {{ t.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-col">
      <button class="btn flex flex-row space-x-2 border-b text-sm shadow-sm bord-lighter"
        :class="templateSidebarShowCustom ? 'txt-lighter' : 'txt-light'"
        @click="templateSidebarShowCustom = !templateSidebarShowCustom">
        <div class="flex-grow">Custom templates</div>
        <div><i-ep:d-caret></i-ep:d-caret></div>
      </button>
      <div :class="{
        'slide-y': true,
        'slideup': templateSidebarShowCustom === true,
        'slidedown': templateSidebarShowCustom === false
      }">
        <div v-for="t in templates" class="group flex flex-row items-center">
          <div class="ml-2 w-2/3 justify-start truncate overflow-ellipsis">
            <button class="btn" @click="_loadCustomTemplate(t.id)">
              {{ t.name }}
            </button>
          </div>
          <div
            class="mr-1 flex w-1/3 flex-row justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <confirm-delete @delete="db.delTemplate(t.id); loadTemplates()"></confirm-delete>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { templates as _genericTemplates, PromptTemplate } from "modprompt";
import ConfirmDelete from '@/widgets/ConfirmDelete.vue';
import { db, loadTemplates, templates, loadCustomTemplate, loadGenericTemplate, cloneToGenericTemplate } from '@/state';
import { cloneTemplateMode, templateSidebarShowCustom, templateSidebarShowGeneric } from "@/state/settings";


function _loadCustomTemplate(name: string) {
  loadCustomTemplate(name);
}

function _loadGenericTemplate(name: string) {
  if (cloneTemplateMode.value === true) {
    cloneToGenericTemplate(name)
  } else {
    loadGenericTemplate(name)
  }
}

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