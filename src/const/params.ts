import { InferenceParams } from "@locallm/types"
//import { InferenceParams } from "../packages/types/interfaces"


const defaultInferenceParams: InferenceParams = {
  stream: true,
  temperature: 0.2,
  stop: ["</s>"],
};

// defaults from Llama.cpp
const availableDefaultInferenceParams: InferenceParams = {
  temperature: 0.2,
  top_k: 0,
  top_p: 1,
  min_p: 0.05,
  repeat_penalty: 1.1,
}

export { defaultInferenceParams, availableDefaultInferenceParams }