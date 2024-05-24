import { LmTokenizer, LmTokenizerType } from "@/interfaces";
import llamaTokenizer from 'llama-tokenizer-js';
import llama3Tokenizer from 'llama3-tokenizer-js';
import mistralTokenizer from 'mistral-tokenizer-js';

const tokenizers: Record<LmTokenizerType, LmTokenizer> = {
    "Llama 3": llama3Tokenizer,
    "Llama 2": llamaTokenizer,
    "Mistral": mistralTokenizer,
};

export { tokenizers }