import { ModelConf } from "@locallm/types";
import { reactive } from "vue";

const models = reactive<Record<string, ModelConf>>({});
const sortedModels = reactive<Record<string, Array<ModelConf>>>({});

function _sortModels(_models: Array<ModelConf>) {
    //console.log(m);
    const uniqueSizes = new Set(_models.map(obj => obj.info?.size));
    uniqueSizes.forEach((s) => {
        if (s) {
            sortedModels[s] = []
        }
    });
    _models.forEach((m) => {
        if (m.info) {
            sortedModels[m.info.size].push(m)
        }
    })
}

function updateModels(_models: Array<ModelConf>, sort: boolean) {
    for (const m in models) {
        delete models[m]
    }
    for (const [k, v] of Object.entries(_models)) {
        models[k] = v
    }
    if (sort) {
        _sortModels(_models)
    }
}

export { updateModels, sortedModels }