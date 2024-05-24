import { LmTokenizer, LmTokenizerType } from '@/interfaces';
import llamaTokenizer from 'llama-tokenizer-js';
import llama3Tokenizer from 'llama3-tokenizer-js';
import mistralTokenizer from 'mistral-tokenizer-js';

function guessTokenizerForModel(modelName: string): { name: LmTokenizerType, tok: LmTokenizer } {
    let tok: LmTokenizer = llamaTokenizer;
    let tokName: LmTokenizerType = "Llama 2";
    const name = modelName.toLowerCase();
    if (name.includes("llama3") || name.includes("llama-3")) {
        tok = llama3Tokenizer;
        tokName = "Llama 3"
    } else if (name.includes("mistral")) {
        tok = mistralTokenizer;
        tokName = "Mistral"
    }
    console.log("Setting tokenizer to", tokName);
    return { name: tokName, tok: tok }
}

export { guessTokenizerForModel }