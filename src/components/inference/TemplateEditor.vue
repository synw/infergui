<template>
  <div>
    <template v-if="tmode == 'render' || isLocked">
      <AutoTextarea :data="renderedTemplate" :maxlines="8" class="w-full mt-3" disabled />
    </template>
    <template v-else>
      <div class="flex flex-col">
        <template v-if="template.system">
          <div class="flex flex-row mb-1">
            <div class="ml-6 w-32">System blocks</div>
            <div class=""></div>
          </div>
          <div v-if="template.prefix" class="flex flex-row">
            <div class="flex w-32 flex-row items-center justify-center text-sm">Prefix:</div>
            <div class="w-full">
              <AutoTextarea class="w-full" :data="template.prefix" @update="template.prefix = $event" />
            </div>
          </div>
          <div v-if="template.system?.schema" class="flex flex-row">
            <div class="flex w-32 flex-row items-center justify-center text-sm">Schema:</div>
            <div class="w-full">
              <AutoTextarea class="w-full" :data="template.system.schema" @update="template.system.schema = $event" />
            </div>
          </div>
          <div v-if="template.system?.message" class="flex flex-row">
            <div class="flex w-32 flex-row items-center justify-center text-sm">Message:</div>
            <div class="w-full">
              <AutoTextarea class="w-full" :data="template.system.message" @update="template.system.message = $event" />
            </div>
          </div>
        </template>

        <div class="mt-2 flex flex-row">
          <div class="ml-6 w-32">Prompt blocks</div>
          <div class=""></div>
        </div>
        <div class="mt-1 flex flex-row">
          <div class="flex w-32 flex-row items-center justify-center text-sm">User:</div>
          <div class="w-full">
            <AutoTextarea class="w-full" :data="template.user" @update="template.user = $event"></AutoTextarea>
          </div>
        </div>
        <div class="flex flex-row">
          <div class="flex w-32 flex-row items-center justify-center text-sm">Assistant:</div>
          <div class="w-full">
            <AutoTextarea class="w-full" :data="template.assistant" @update="template.assistant = $event" />
          </div>
        </div>

        <div class="mt-2 ml-6 flex flex-row items-center" v-if="showShots">
          <div class="">Shots:</div>
          <div class="ml-3 flex flex-row space-x-2">
            <div v-for="(shot, i) in template.shots" class="rounded-lg px-2 cursor-pointer"
              :class="currentEditedShot.id == i ? 'light' : 'lighter'" @click="startEditShot(i, shot)">
              # {{ i + 1 }}
            </div>
          </div>
        </div>
        <template v-if="editShot">
          <shot-editor class="mt-3" v-if="currentEditedShot.id == -1" @create="saveShot($event);"
            @cancel="cancelEditShot()"></shot-editor>
          <shot-editor class="mt-3" :shotId="currentEditedShot.id" :initial="currentEditedShot.block" v-else
            @update="endEditShot(currentEditedShot.id, $event);" @cancel="cancelEditShot()"
            @delete="deleteShot(currentEditedShot.id)"></shot-editor>
        </template>

        <template v-if="showParams">
          <div class="mt-2 flex flex-row">
            <div class="ml-6 w-32">Parameters</div>
            <div class=""></div>
          </div>
          <div class="mt-1 flex flex-row">
            <div class="flex w-32 flex-row items-center justify-center text-sm">Stop words:</div>
            <div class="w-full"><Textarea v-model="stop" rows="1" class="w-full" /></div>
          </div>
          <div class="flex flex-row" v-if="afterShot.length > 0">
            <div class="flex w-32 flex-row items-center justify-center text-sm">After shot:</div>
            <div class="w-full"><Textarea v-model="afterShot" rows="1" class="w-full" /></div>
          </div>
          <template v-if="template.linebreaks">
            <div class="flex flex-row">
              <div class="mt-3 flex w-32 flex-row justify-center text-sm">Linebreaks:</div>
              <div class="flex w-full flex-col">
                <div v-if="template.linebreaks.system !== undefined" class="flex flex-row items-center">
                  <div class="w-20 text-sm">System:</div>
                  <div>
                    <InputNumber class="w-8" v-model="template.linebreaks.system" showButtons :step="1" :min="0" />
                  </div>
                </div>
                <div v-if="template.linebreaks.user !== undefined" class="flex flex-row items-center">
                  <div class="w-20 text-sm">User:</div>
                  <div>
                    <InputNumber class="w-8" v-model="template.linebreaks.user" showButtons :step="1" :min="0" />
                  </div>
                </div>
                <div v-if="template.linebreaks.assistant !== undefined" class="flex flex-row items-center">
                  <div class="w-20 text-sm">Assistant:</div>
                  <div>
                    <InputNumber class="w-8" v-model="template.linebreaks.assistant" showButtons :step="1" :min="0" />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </template>
    <div class="flex flex-row text-sm" v-if="!isLocked">
      <div class="flex flex-grow flex-row items-center justify-end">
        <div>
          <button v-if="tmode == 'edit'" class="btn text-xs txt-light" @click="toggleCloneTemplate($event)">
            Clone template</button>
          <OverlayPanel ref="cloneTemplateCollapse">
            <div class="text-lg">Clone to:</div>
            <div class="mt-2 flex flex-col space-y-1">
              <template v-for="_template in Object.values(_genericTemplates).slice(1)">
                <div v-if="template.id != _template.id" class="cursor-pointer" @click="cloneTemplate(_template.id)">
                  {{ _template.name }}
                </div>
              </template>
            </div>
          </OverlayPanel>
        </div>
        <div>
          <button v-if="tmode == 'edit' && !editShot" class="btn text-xs txt-light" @click="editShot = true">
            Add a shot</button>
        </div>
        <div v-if="tmode == 'edit'">
          <button class="btn text-xs txt-light" @click="toggleParams()">
            <span v-if="showParams">Hide</span>
            <span v-else>Show</span>
            params</button>
        </div>
        <div>
          <button v-if="tmode == 'edit'" class="btn txt-light bord-lighter" @click="toggleMode('render')">Render
            template</button>
          <button v-else class="btn txt-light bord-lighter" @click="toggleMode('edit')">Edit template</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import OverlayPanel from 'primevue/overlaypanel';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import { TurnBlock, templates as _genericTemplates } from 'modprompt';
import AutoTextarea from '@/widgets/AutoTextarea.vue';
import { template, inferParams } from '@/state';
import ShotEditor from './ShotEditor.vue';
import { nextTick } from 'process';


defineProps({
  isLocked: {
    type: Boolean,
    default: false,
  }
})

const renderedTemplate = ref("{prompt}");
const cloneTemplateCollapse = ref();
const tmode = ref<"edit" | "render">("edit");
const stop = ref("");
const afterShot = ref("");
const showParams = ref(false);
//const shots = new Array<TurnBlock>();
const editShot = ref(false);
const currentEditedShot = reactive({
  id: -1,
  block: { user: "", assistant: "" } as TurnBlock,
});

function toggleCloneTemplate(evt) {
  cloneTemplateCollapse.value.toggle(evt);
}

function _resetShotsState() {
  currentEditedShot.id = -1;
  currentEditedShot.block = { user: "", assistant: "" };
}

function toggleMode(m: "render" | "edit") {
  tmode.value = m
}

function toggleParams() {
  showParams.value = !showParams.value
}

function cloneTemplate(id: string) {
  template.value = template.value.cloneTo(id);
  toggleCloneTemplate(false);
  editShot.value = false;
}

function saveShot(shot: TurnBlock) {
  template.value.addShot(shot.user, shot.assistant);
  _resetShotsState();
  editShot.value = false;
}

function cancelEditShot() {
  _resetShotsState();
  editShot.value = false;
}

function startEditShot(id: number, shot: TurnBlock) {
  if (id == currentEditedShot.id) {
    _resetShotsState();
    editShot.value = false;
    return
  }
  editShot.value = false;
  nextTick(() => {
    currentEditedShot.id = id;
    currentEditedShot.block = shot;
    editShot.value = true;
  })

}

function endEditShot(id: number, shot: TurnBlock) {
  if (!template.value.shots) {
    throw new Error("No shots in template")
  }
  template.value.shots[id] = shot
  _resetShotsState();
  editShot.value = false;
}

function deleteShot(id: number) {
  template.value.shots?.splice(id, 1);
  _resetShotsState();
  editShot.value = false;
}

const showShots = computed(() => {
  if (template.value.shots) {
    if (template.value.shots.length > 0) {
      return true
    }
  }
  if (editShot.value === true) {
    return true
  }
  return false
})

/*const showSystemMsg = computed(() => {
  if (template.value.system?.message) {
    return true
  } else {
    if (template.value.system?.schema) {
      return true
    }
  }
  return false
})*/

watchEffect(() => {
  renderedTemplate.value = template.value.render();
  let hasStop = false;
  if (template.value?.stop) {
    if (template.value.stop.length > 0) {
      hasStop = true;
      stop.value = template.value.stop?.join(",")
    }
  }
  if (template.value.afterShot) {
    afterShot.value = template.value.afterShot.replaceAll("\n", "\\n")
  }
})
</script>

<style lang="sass" scoped>
.p-inputnumber-button
  background-color: #e2e8f0 !important
  color: black !important
  border: #e2e8f0 !important
.dark
  .p-inputnumber-button
    background-color: #525252 !important
</style>