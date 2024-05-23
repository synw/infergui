<template>
    <div class="flex flex-col space-y-3 w-full">
        <div class="flex flex-row w-full items-center">
            <div class="text-2xl txt-light">
                <span class="capitalize"> {{ lm.providerType }}</span> server
            </div>
            <div class="flex-grow justify-end flex flex-row items-center txt-light cursor-pointer" @click="close()">
                <div class="mr-2"><i-gg:close-r></i-gg:close-r></div>
                <div>Close</div>
            </div>
        </div>
        <div class="p-3 flex flex-wrap gap-3">
            <div v-for="size in Object.keys(sortedModels).sort()" class="w-[24rem]">
                {{ size }}
                <div v-for="mod in sortedModels[size]">
                    <button class="btn" @click="pickModel(mod);">
                        {{ mod.name }} - <span class="txt-light">{{ mod.info?.quant }}</span>
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Lm } from "@locallm/api";
import { sortedModels } from "@/state/models";
import { ModelConf } from "@locallm/types";

defineProps({
    lm: {
        type: Object as () => Lm,
        required: true
    }
});

const emit = defineEmits(["end", "close"]);

function close() {
    emit('close')
}

async function pickModel(m: ModelConf) {
    emit('end', m);
}
</script>