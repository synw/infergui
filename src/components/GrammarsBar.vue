<template>
  <div class="flex flex-col">
    <div class="flex flex-col">
      <button class="btn flex flex-row space-x-2 border-b text-sm shadow-sm bord-lighter"
        :class="grammarSidebarShowGeneric ? 'txt-lighter' : 'txt-light'"
        @click="grammarSidebarShowGeneric = !grammarSidebarShowGeneric">
        <div class="flex-grow">Generic grammars</div>
        <div><i-ep:d-caret></i-ep:d-caret></div>
      </button>
      <div :class="{
        'slide-y': true,
        'slideup': grammarSidebarShowGeneric === true,
        'slidedown': grammarSidebarShowGeneric === false,
        'pb-3': grammarSidebarShowGeneric === false,
      }">
        <div v-for="grammar in genericGrammars">
          <div class="ml-2 mt-1 w-2/3 justify-start truncate overflow-ellipsi">
            <button class="btn py-0" @click="loadGrammar(grammar)">
              {{ grammar.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-col">
    <button class="btn flex flex-row space-x-2 border-b text-sm shadow-sm bord-lighter"
      :class="grammarSidebarShowCustom ? 'txt-lighter' : 'txt-light'"
      @click="grammarSidebarShowCustom = !grammarSidebarShowCustom">
      <div class="flex-grow">Custom grammars</div>
      <div><i-ep:d-caret></i-ep:d-caret></div>
    </button>
    <div :class="{
      'slide-y': true,
      'slideup': grammarSidebarShowCustom === true,
      'slidedown': grammarSidebarShowCustom === false
    }">
      <div v-for="grammar in grammars" class="group flex flex-row items-center">
        <div class="ml-2 w-2/3 justify-start truncate overflow-ellipsis">
          <button class="btn py-0" @click="loadGrammar(grammar)">
            {{ grammar.name }}
          </button>
        </div>
        <div
          class="mr-1 flex w-1/3 flex-row justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <confirm-delete @delete="db.deleteGrammar(grammar.name); loadGrammars()"></confirm-delete>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { genericGrammars } from '@/const/grammars';
import { db } from '@/state';
import { grammars, loadGrammars, loadGrammar } from '@/state/grammar';
import { grammarSidebarShowCustom, grammarSidebarShowGeneric } from "@/state/settings";
import ConfirmDelete from '@/widgets/ConfirmDelete.vue';
</script>