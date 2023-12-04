<template>
  <div class="flex flex-col">
    <div>
      <div class="container mx-auto">
        <div class="p-2 mt-2 border">
          <code-editor :hljs="hljs" :code="grammar.code" lang="typescript" @edit="codeChange($event)">
          </code-editor>
        </div>
      </div>
      <div class="pt-2 flex flex-row justify-end text-sm">
        <div v-if="!useGrammar">
          <button class="btn txt-light bord-lighter" @click="loadGrammar()">Load grammar</button>
        </div>
        <div v-else class="flex flex-row space-x-2">
          <button class="btn txt-light bord-lighter" @click="toggleSaveGrammar($event)">Save
            grammar</button>
          <OverlayPanel ref="saveGrammarDialog">
            <save-grammar-dialog @pick="toggleSaveGrammar($event)"></save-grammar-dialog>
          </OverlayPanel>
          <button class="btn txt-light bord-lighter" @click="unloadGrammar()">Unload grammar</button>
          <button class="btn txt-light bord-lighter" @click="loadGrammar()" :disabled="hasGrammarChanged === false">Update
            grammar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { CodeEditor } from "vuecodit";
import "vuecodit/style.css";
import "highlight.js/styles/stackoverflow-light.css";
import { hljs } from "@/conf";
import { grammar, useGrammar } from "@/state/grammar";
import OverlayPanel from 'primevue/overlaypanel';
import SaveGrammarDialog from "./SaveGrammarDialog.vue";

const hasGrammarChanged = ref(false);
const nChange = ref(0);
const saveGrammarDialog = ref();

function toggleSaveGrammar(evt) {
  console.log("Toggle save grammar", evt);
  saveGrammarDialog.value.toggle(evt);
}

function codeChange(c: string) {
  //console.log("Code", c);
  grammar.code = c;
  if (nChange.value > 0) {
    hasGrammarChanged.value = true;
  }
  ++nChange.value;
}

function loadGrammar() {
  useGrammar.value = true;
  hasGrammarChanged.value = false;
  //console.log("Load grammar", grammar.value);
}

function unloadGrammar() {
  useGrammar.value = false;
  //console.log("Unload grammar", grammar.value);
}
</script>