import { useStorage } from '@vueuse/core';
import { FormatMode, TabType } from "@/interfaces";


const autoMaxContext = useStorage<boolean>("autoMaxContext", true);
const sidebarLeftActiveTab = useStorage<TabType>("sidebarLeftActiveTab", "prompts");
const selectedPreset = useStorage<string>("selectedPreset", "Default");
const formatMode = useStorage<FormatMode>("formatMode", "Text");
const cloneTemplateMode = useStorage<boolean>("cloneTemplateMode", false);

export {
  autoMaxContext,
  sidebarLeftActiveTab,
  selectedPreset,
  formatMode,
  cloneTemplateMode,
}