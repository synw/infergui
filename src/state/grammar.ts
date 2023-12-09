import { reactive, ref } from "vue";
import { db } from ".";
import { GbnfGrammar } from "@/interfaces";

const grammars = reactive<Array<GbnfGrammar>>([]);
const grammar = reactive<GbnfGrammar>({
  name: "none",
  code: `interface Grammar {
  
}`
});
const useGrammar = ref(false);

async function saveGrammar(name: string) {
  await db.setGrammar(name, grammar.code);
  grammars.push({
    name: name,
    code: grammar.code,
  })
}

function loadGrammar(gr: GbnfGrammar) {
  grammar.name = gr.name;
  grammar.code = gr.code;
  useGrammar.value = true;
}

async function loadGrammars() {
  const g = await db.listGrammars();
  //console.log("DB g", g);
  grammars.splice(0, grammars.length, ...g);
  //console.log("G", grammars)
}

export { grammar, useGrammar, grammars, saveGrammar, loadGrammars, loadGrammar }