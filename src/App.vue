<template>
  <div class="h-screen background">
    <the-header class="fixed top-0 left-0 h-16 border-b bord-lighter"></the-header>
    <div class="w-full h-main">
      <router-view></router-view>
    </div>
  </div>
  <Toast />
  <ConfirmDialog>
    <template #message="slotProps">
      <div class="flex flex-row items-center p-4">
        <!-- div>
          <named-icon :icon="`${slotProps.message.icon}`" class="text-3xl"></named-icon>
        </div -->
        <div class="pl-2">{{ slotProps.message.message }}</div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue';
import TheHeader from "@/components/TheHeader.vue";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import { initNotifyService } from "@/services/notify";
import { initState } from './state';
import { loadGrammars } from './state/grammar';

onBeforeMount(() => {
  initState();
  loadGrammars();
});
onMounted(() => initNotifyService())
</script>

<style lang="sass">
.p-inputtext, .p-overlaypanel-content
  @apply background bord-lighter
.p-overlaypanel-content
  @apply dark:bord-lighter border
.h-main
  height: calc( 100% -  4rem)
.prosed:not(.not-prose)
  @apply prose dark:prose-invert max-w-none prose-h1:txt-light prose-h2:txt-light prose-h3:txt-light prose-h2:mt-3
  @apply max-w-[100%] xl:min-w-[52rem]
</style>




