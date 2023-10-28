import { InferenceParams } from "@locallm/types"

const defaultInferenceParams: InferenceParams = {
  stream: true,
  threads: 3,
  gpu_layers: 0,
  n_predict: 512,
  top_k: 40,
  top_p: 0.95,
  temperature: 0.2,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  repeat_penalty: 1.0,
  tfs_z: 1.0,
  stop: ["</s>"],
};

export { defaultInferenceParams }