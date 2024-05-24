<template>
    <div class="pb-2">
        <div class="text-lg">Pick a tokenizer</div>
        <div class="flex flex-col mt-3 justify-start space-y-2">
            <button v-for="tokenizer in Object.keys(tokenizers)" class="btn text-sm py-1"
                :class="tokenizer == tokenizerType ? ['lighter', 'cursor-default'] : 'success'"
                @click="pick(tokenizer)">
                {{ tokenizer }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { tokenizerType, setTokenizer } from "@/state";
import { tokenizers } from "@/const/tokenizers";
import { LmTokenizerType } from "@/interfaces";

const emit = defineEmits(["pick"]);

function pick(name: string) {
    setTokenizer(name as LmTokenizerType);
    emit("pick")
}
</script>