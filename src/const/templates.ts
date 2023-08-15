import { LmTemplate } from "@/interfaces";

const alpaca = `### Instruction: {prompt}

### Response:`;

const vicuna1 = `### User: {prompt}

### Assistant:`;

const vicuna2 = `USER: {prompt}

ASSISTANT:`;

const orca2 = `### System:
You are an AI assistant that follows instruction extremely well. Help as much as you can.

### User:
{prompt}

### Response:`;

const llama2 = `<s>[INST] <<SYS>>
You are a helpful, respectful and honest assistant. Always answer as helpfully as possible

If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.
<</SYS>>

{prompt} [/INST]`;

const templates: Record<string, LmTemplate> = {
  alpaca: {
    name: "Alpaca",
    content: alpaca,
  },
  vicuna1: {
    name: "Vicuna1",
    content: vicuna1,
  },
  vicuna2: {
    name: "Vicuna2",
    content: vicuna2,
  },
  orca2: {
    name: "Orca2",
    content: orca2,
  },
  llama2: {
    name: "llama2",
    content: llama2,
  }
}

export {
  templates,
}