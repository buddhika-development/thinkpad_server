import type { Request, Response } from 'express'
import { structured_llm, streaming_llm } from '../services/deepseek.js'
import { PromptTemplate } from '@langchain/core/prompts'
import { SystemMessage, HumanMessage } from "@langchain/core/messages";


const BASE_SYSTEM_PROMPT: string = "clear the grammer mistakas and the arrange properly. Dont make huge changes or convert the idea into something else. Your goal is only convert the statement into grammer free and arranged. Strickly follow these rules, If your haven't include any of additional instruction you only can improve what he said in the much more minimum level. If user have mention about how its needs to be change with the custom instrcution you needs to change the user statement fit into the user custom requirement. But only you can return the content you can't return the content like : Here is your poetic version, arranged with care and a touch more artistic soul"

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

export const ai_writer_streming_controller = async (req: Request, res: Response) => {
    const { user_statement, user_custom_instructions } = req.body

    res.header('Content-Type', 'text/event-stream')
    res.header('Cache-Control', 'no-cache')
    res.header('Connection', 'keep-alive')
    res.flushHeaders()

    try {
        const stream = await streaming_llm.stream(build_prompt(user_statement, user_custom_instructions))

        for await (const chunk of stream) {
            if (chunk.content) {
                res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
            }
        }

        res.write(`data: [DONE]\n\n`)
        res.end()
    }
    catch (err) {
        console.log(err)
        res.write(`data: ${JSON.stringify({
            error: 'Something went wrong, Try again later.'
        })}\n\n`)
        res.end()
    }
}

export const ai_writer_func = async (user_statement: string, custom_instructions?: string) => {
    const response = await structured_llm.invoke(build_prompt(user_statement, custom_instructions))

    return response
}