<template>
  <div class="w-full">
    <div class="flex flex-row">
      <div class="flex w-32 flex-row items-center justify-center text-sm">User:</div>
      <div class="w-full">
        <AutoTextarea class="w-full" :data="block.user" @update="block.user = $event"></AutoTextarea>
      </div>
    </div>
    <div class="flex flex-row">
      <div class="flex w-32 flex-row items-center justify-center text-sm">Assistant:</div>
      <div class="w-full">
        <AutoTextarea class="w-full" :data="block.assistant" @update="block.assistant = $event" />
      </div>
    </div>
    <div class="flex flex-row ml-32 mt-2">
      <button class="btn text-sm primary" v-if="!isEditMode" @click="$emit('create', block)">Save</button>
      <button class="btn text-sm primary" v-else @click="$emit('update', block)">Save</button>
      <button class="btn text-sm" @click="$emit('cancel')">Cancel</button>
      <button v-if="isEditMode" class="btn text-sm" @click="confirmDelete($event)">Delete</button>
      <ConfirmPopup group="headless">
        <template #container="{ message, onAccept, onReject }">
          <div class="bg-lighter p-3 border">
            <div class="font-bold">{{ message.message }}</div>
            <div class="flex flex-row items-center mt-3">
              <button @click="onAccept" class="btn danger">Delete</button>
              <button outlined @click="onReject" class="btn">Cancel</button>
            </div>
          </div>
        </template>
      </ConfirmPopup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, reactive, ref } from 'vue';
import AutoTextarea from '@/widgets/AutoTextarea.vue';
import ConfirmPopup from 'primevue/confirmpopup';
import { TurnBlock } from 'modprompt';
import { useConfirm } from "primevue/useconfirm";

const props = defineProps({
  shotId: {
    type: Number,
  },
  initial: {
    type: Object as () => TurnBlock,
    default: { user: "", assistant: "" },
  }
});
const emit = defineEmits(["create", "update", "cancel", "delete"]);
const block = reactive<TurnBlock>({ user: "", assistant: "" });
const isEditMode = ref(false);
const confirm = useConfirm();
const confirmDelete = (event) => {
  confirm.require({
    group: 'headless',
    target: event.currentTarget,
    message: 'Delete this shot?',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      console.log("Delete")
      emit("delete")
    },
    reject: () => {
      console.log("Reject")
    }
  });
};

onBeforeMount(() => {
  if (props.shotId !== undefined) {
    isEditMode.value = true;
    block.user = props.initial.user;
    block.assistant = props.initial.assistant;
  }
})
</script>