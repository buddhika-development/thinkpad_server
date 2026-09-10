import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import { structured_llm, streaming_llm } from '../services/deepseek.js'
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import prisma from '../prisma/client.js'

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

const is_persistent_request = (body: any): boolean => {
    const val = body.persistance ?? body.persistence ?? body.is_persistant ?? body.is_persistent
    if (val === undefined || val === null) {
        return true
    }
    if (typeof val === 'boolean') {
        return val
    }
    if (typeof val === 'string') {
        const lower = val.toLowerCase().trim()
        if (lower === 'false' || lower === 'temporary' || lower === 'temp' || lower === '0') {
            return false
        }
    }
    return Boolean(val)
}

/**
 * Save raw note/statement as DRAFT (without AI enhancement)
 * POST /api/v1/ai-writer/note
 */
export const save_note_controller = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user?.id
    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    const { user_statement, think_pad_id, thinkPadId, id, statement_id } = req.body
    const target_think_pad_id = think_pad_id || thinkPadId || null
    const existing_id = id || statement_id || null

    if (!user_statement || typeof user_statement !== 'string' || !user_statement.trim()) {
        res.status(400).json({
            success: false,
            message: 'user_statement is required'
        })
        return
    }

    try {
        let saved_note

        if (existing_id) {
            const existing = await prisma.aiWriterContent.findFirst({
                where: { id: existing_id, updatedBy: user_id }
            })

            if (!existing) {
                res.status(404).json({
                    success: false,
                    message: 'Note statement not found'
                })
                return
            }

            saved_note = await prisma.aiWriterContent.update({
                where: { id: existing_id },
                data: {
                    userStatement: user_statement.trim(),
                    status: 'DRAFT',
                    ...(target_think_pad_id ? { thinkPadId: target_think_pad_id } : {})
                }
            })
        } else {
            saved_note = await prisma.aiWriterContent.create({
                data: {
                    updatedBy: user_id,
                    userStatement: user_statement.trim(),
                    aiOptimizedStatement: null,
                    status: 'DRAFT',
                    ...(target_think_pad_id ? { thinkPadId: target_think_pad_id } : {})
                }
            })
        }

        res.status(200).json({
            success: true,
            message: 'Note statement saved successfully as DRAFT',
            data: saved_note
        })
    } catch (err) {
        console.error('Error saving draft note:', err)
        res.status(500).json({
            success: false,
            message: 'Internal server error while saving note'
        })
    }
}

/**
 * Standard AI writer endpoint (Enhances statement and updates status to ENHANCED)
 * POST /api/v1/ai-writer
 */
export const ai_writer_controller = async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body
    const user_id = req.user?.id

    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    try {
        const processed_statement = await ai_writer_func(body.user_statement, body.user_custom_instructions)
        const is_persistent = is_persistent_request(body)
        const think_pad_id = body.think_pad_id || body.thinkPadId || null
        const existing_id = body.id || body.statement_id || null

        let saved_content = null
        if (is_persistent) {
            if (existing_id) {
                const existing = await prisma.aiWriterContent.findFirst({
                    where: { id: existing_id, updatedBy: user_id }
                })
                if (existing) {
                    saved_content = await prisma.aiWriterContent.update({
                        where: { id: existing_id },
                        data: {
                            userStatement: body.user_statement,
                            aiOptimizedStatement: String(processed_statement.content),
                            status: 'ENHANCED',
                            ...(think_pad_id ? { thinkPadId: think_pad_id } : {})
                        }
                    })
                }
            }

            if (!saved_content) {
                saved_content = await prisma.aiWriterContent.create({
                    data: {
                        updatedBy: user_id,
                        userStatement: body.user_statement,
                        aiOptimizedStatement: String(processed_statement.content),
                        status: 'ENHANCED',
                        ...(think_pad_id ? { thinkPadId: think_pad_id } : {})
                    }
                })
            }
        }

        res.status(200).json({
            message: is_persistent
                ? "successfully processed and saved the api response"
                : "successfully processed the api response (temporary mode)",
            user_statement: processed_statement.content,
            saved_content
        })
    }
    catch (err) {
        console.error(err)
        res.status(500).json({
            message: "something went wrong"
        })
    }
}

/**
 * Streaming AI writer endpoint (Enhances statement via SSE stream and updates status to ENHANCED)
 * POST /api/v1/ai-writer/stream
 */
export const ai_writer_streming_controller = async (req: AuthenticatedRequest, res: Response) => {
    const { user_statement, user_custom_instructions, think_pad_id, thinkPadId, id, statement_id } = req.body
    const target_think_pad_id = think_pad_id || thinkPadId || null
    const existing_id = id || statement_id || null
    const user_id = req.user?.id

    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    res.header('Content-Type', 'text/event-stream')
    res.header('Cache-Control', 'no-cache')
    res.header('Connection', 'keep-alive')
    res.flushHeaders()

    let full_content = ''

    try {
        const stream = await streaming_llm.stream(build_prompt(user_statement, user_custom_instructions))

        for await (const chunk of stream) {
            if (chunk.content) {
                full_content += String(chunk.content)
                res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
            }
        }

        const is_persistent = is_persistent_request(req.body)

        if (is_persistent && full_content.trim()) {
            let updated = false
            if (existing_id) {
                const existing = await prisma.aiWriterContent.findFirst({
                    where: { id: existing_id, updatedBy: user_id }
                })
                if (existing) {
                    await prisma.aiWriterContent.update({
                        where: { id: existing_id },
                        data: {
                            userStatement: user_statement,
                            aiOptimizedStatement: full_content,
                            status: 'ENHANCED',
                            ...(target_think_pad_id ? { thinkPadId: target_think_pad_id } : {})
                        }
                    })
                    updated = true
                }
            }

            if (!updated) {
                await prisma.aiWriterContent.create({
                    data: {
                        updatedBy: user_id,
                        userStatement: user_statement,
                        aiOptimizedStatement: full_content,
                        status: 'ENHANCED',
                        ...(target_think_pad_id ? { thinkPadId: target_think_pad_id } : {})
                    }
                })
            }
        }

        res.write(`data: [DONE]\n\n`)
        res.end()
    }
    catch (err) {
        console.error(err)
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