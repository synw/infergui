<template>
  <div class="flex flex-col overflow-y-auto">
    <div v-for="grammar in grammars" class="flex flex-row group">
      <div class="justify-start w-2/3 ml-2 truncate">
        <button class="btn" @click="loadGrammar(grammar)">
          {{ grammar.name }}
        </button>
      </div>
      <div class="flex flex-row justify-end w-1/3 mr-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
        <confirm-delete @delete="db.deleteGrammar(grammar.name); loadGrammars()"></confirm-delete>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { db } from '@/state';
import { grammars, loadGrammars, loadGrammar } from '@/state/grammar';
import ConfirmDelete from '@/widgets/ConfirmDelete.vue';
</script>