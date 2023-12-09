import { InferenceParams } from "@locallm/types"

/*const defaultInferenceParams: InferenceParams = {
  stream: true,
  threads: 3,
  gpu_layers: 0,
  max_tokens: 512,
  top_k: 40,
  top_p: 0.95,
  min_p: 0.05,
  temperature: 0.2,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  repeat_penalty: 1.0,
  tfs: 1.0,
  stop: ["</s>"],
};*/

const defaultInferenceParams: InferenceParams = {
  stream: true,
  temperature: 0.2,
  stop: ["</s>"],
};

// defaults from Llama.cpp
const availableDefaultInferenceParams: InferenceParams = {
  temperature: 0.8,
  top_k: 40,
  top_p: 0.95,
  min_p: 0.05,
  tfs: 1,
  repeat_penalty: 1.1,
  presence_penalty: 0,
  frequency_penalty: 0,
}

export { defaultInferenceParams, availableDefaultInferenceParams }