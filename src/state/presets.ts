import { toRaw } from "vue";
import { db, inferParams, loadPresets, mutateInferParams } from "@/state";
import { selectedPreset } from "@/state/settings";


async function savePreset(name: string) {
  const params = toRaw(inferParams);
  await db.setPreset(name, params);
  selectedPreset.value = name;
  loadPresets();
}

async function loadPreset(preset: string) {
  //console.log("Loading preset", preset);
  const params = await db.loadPreset(preset);
  mutateInferParams(params);
  selectedPreset.value = preset;
}

async function delPreset(preset: string) {
  await db.delPreset(preset);
  if (selectedPreset.value == preset) {
    selectedPreset.value = "Default"
  }
  loadPresets();
}

export { savePreset, loadPreset, delPreset }