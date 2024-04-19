<template>
    <div>
        <button v-if="confirmRestart != (i + 1)" class="btn flex-none txt-lighter hover:txt-light"
            @click="confirmRestartFromTurn(i + 1)">
            <i-icon-park-twotone:replay-music class="text-lg"></i-icon-park-twotone:replay-music>&nbsp;Restart
            from here
        </button>
        <div v-else class="flex flex-row">
            <button class="btn txt-success" @click="restartFromTurn(i, turn)">
                <i-icon-park-twotone:replay-music class="text-lg"></i-icon-park-twotone:replay-music>&nbsp;Confirm
                restart</button>
            <button class="btn txt-danger" @click="cancelRestart()">
                Cancel</button>
        </div>

    </div>
</template>

<script setup lang="ts">
import { cutHistoryAfterTurn } from "@/state";
import { HistoryTurn } from "modprompt";
import { ref } from "vue";

const emit = defineEmits(["restart"]);
defineProps({
    i: {
        type: Number,
        required: true
    },
    turn: {
        type: Object as () => HistoryTurn,
        required: true
    },
})

const confirmRestart = ref(0);

function confirmRestartFromTurn(n: number) {
    //console.log("CONFIRM RESTART", n);
    confirmRestart.value = n;
}

function cancelRestart() {
    confirmRestart.value = 0;
}

async function restartFromTurn(n: number, turn: HistoryTurn) {
    cutHistoryAfterTurn(n);
    confirmRestart.value = 0;
    emit("restart", turn.user)
}
</script>