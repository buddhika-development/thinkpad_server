import type { Request, Response } from 'express'
import { structured_llm } from '../services/deepseek.js'
import { PromptTemplate } from '@langchain/core/prompts'
import { SystemMessage, HumanMessage } from "@langchain/core/messages";


const BASE_SYSTEM_PROMPT: string = "clear the grammer mistakas and the arrange properly. Dont make huge changes or convert the idea into something else. Your goal is only convert the statement into grammer free and arranged"

const build_prompt = (user_statement: string, user_custom_instructions?: string) => {
    const system_Parts = [BASE_SYSTEM_PROMPT]

    if (user_custom_instructions) {
        system_Parts.push(`User's custom instruction : ${user_custom_instructions}`)
    }

    return [
        new SystemMessage(system_Parts.join("\n")),
        new HumanMessage(user_statement)
    ]
}


export const ai_writer_controller = async (req: Request, res: Response) => {
    const body = req.body
    try {
        const processed_statement = await ai_writer_func(body.user_statement, body.user_custom_instructions)
        res.status(200).json({
            "message": "successfulyy process the api response",
            "user_statement": processed_statement.content
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            "message": "something went wrong"
        })
    }
}

export const ai_writer_func = async (user_statement: string, custom_instructions?: string) => {
    const response = await structured_llm.invoke(build_prompt(user_statement, custom_instructions))

    return response
}