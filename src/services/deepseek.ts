import deepseek_config from "../config/deepseek.config.js";
import { ChatDeepSeek } from "@langchain/deepseek";

export const strucutred_llm = new ChatDeepSeek({
    apiKey: deepseek_config.DEEPSEEK_API_KEY,
    model: deepseek_config.DEEPSEEK_MODEL_NAME,
    temperature: 0.2
})

export const streaming_llm = new ChatDeepSeek({
    apiKey: deepseek_config.DEEPSEEK_API_KEY,
    model: deepseek_config.DEEPSEEK_MODEL_NAME,
    temperature: 0.2,
    streaming: true
})