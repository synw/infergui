import { fileURLToPath } from 'url';
import path from 'path';
import { ref } from '@vue/reactivity';


const __filename = fileURLToPath(import.meta.url);
const dirpath = path.dirname(__filename);
const execPath = process.cwd();

const modelsDir = ref("");
const koboldCmd = ref("");
const isLmRunning = ref(false);

export { dirpath, execPath, modelsDir, koboldCmd, isLmRunning }