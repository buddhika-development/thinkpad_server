import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js'
import prisma from '../prisma/client.js'
import { parse_pagination_params, build_paginated_response } from '../utils/pagination.js'

/**
 * Create a new ThinkPad
 * POST /api/v1/think-pad
 */
export const create_think_pad = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user?.id
    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    const { think_pad_name, thinkPadName, description } = req.body
    const name = think_pad_name || thinkPadName

    if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({
            success: false,
            message: 'think_pad_name is required'
        })
        return
    }

    try {
        const think_pad = await prisma.thinkPad.create({
            data: {
                thinkPadName: name.trim(),
                description: typeof description === 'string' ? description.trim() : null,
                userId: user_id
            }
        })

        res.status(201).json({
            success: true,
            message: 'ThinkPad created successfully',
            data: think_pad
        })
    } catch (error) {
        console.error('Error creating think pad:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error while creating ThinkPad'
        })
    }
}

/**
 * Get all ThinkPads for current user with pagination
 * GET /api/v1/think-pad
 */
export const get_think_pads = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user?.id
    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    try {
        const { page, limit, skip } = parse_pagination_params(req)

        const total_items = await prisma.thinkPad.count({
            where: { userId: user_id }
        })

        const think_pads = await prisma.thinkPad.findMany({
            where: { userId: user_id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        const paginated_data = build_paginated_response(think_pads, total_items, page, limit)

        res.status(200).json({
            success: true,
            ...paginated_data
        })
    } catch (error) {
        console.error('Error fetching think pads:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching ThinkPads'
        })
    }
}

/**
 * Get a specific ThinkPad by ID
 * GET /api/v1/think-pad/:id
 */
export const get_think_pad_by_id = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user?.id
    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    const id = req.params.id as string
    if (!id) {
        res.status(400).json({ success: false, message: 'ThinkPad ID is required' })
        return
    }

    try {
        const think_pad = await prisma.thinkPad.findFirst({
            where: {
                id,
                userId: user_id
            }
        })

        if (!think_pad) {
            res.status(404).json({
                success: false,
                message: 'ThinkPad not found'
            })
            return
        }

        res.status(200).json({
            success: true,
            data: think_pad
        })
    } catch (error) {
        console.error('Error fetching think pad:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching ThinkPad'
        })
    }
}

/**
 * Update ThinkPad name by ID
 * PUT /api/v1/think-pad/:id
 */
export const update_think_pad = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user?.id
    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    const id = req.params.id as string
    if (!id) {
        res.status(400).json({ success: false, message: 'ThinkPad ID is required' })
        return
    }

    const { think_pad_name, thinkPadName, description } = req.body
    const name = think_pad_name || thinkPadName

    const update_data: { thinkPadName?: string; description?: string | null } = {}
    if (name && typeof name === 'string' && name.trim()) {
        update_data.thinkPadName = name.trim()
    }
    if (description !== undefined) {
        update_data.description = typeof description === 'string' ? description.trim() : null
    }

    if (Object.keys(update_data).length === 0) {
        res.status(400).json({
            success: false,
            message: 'At least think_pad_name or description must be provided for update'
        })
        return
    }

    try {
        const think_pad = await prisma.thinkPad.findFirst({
            where: { id, userId: user_id }
        })

        if (!think_pad) {
            res.status(404).json({
                success: false,
                message: 'ThinkPad not found'
            })
            return
        }

        const updated_think_pad = await prisma.thinkPad.update({
            where: { id },
            data: update_data
        })

        res.status(200).json({
            success: true,
            message: 'ThinkPad updated successfully',
            data: updated_think_pad
        })
    } catch (error) {
        console.error('Error updating think pad:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating ThinkPad'
        })
    }
}

/**
 * Delete ThinkPad by ID
 * DELETE /api/v1/think-pad/:id
 */
export const delete_think_pad = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user?.id
    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    const id = req.params.id as string
    if (!id) {
        res.status(400).json({ success: false, message: 'ThinkPad ID is required' })
        return
    }

    try {
        const delete_result = await prisma.thinkPad.deleteMany({
            where: {
                id,
                userId: user_id
            }
        })

        if (delete_result.count === 0) {
            res.status(404).json({
                success: false,
                message: 'ThinkPad not found'
            })
            return
        }

        res.status(200).json({
            success: true,
            message: 'ThinkPad deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting think pad:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting ThinkPad'
        })
    }
}

/**
 * Get history of updates/statements for a ThinkPad ordered latest to oldest with pagination
 * GET /api/v1/think-pad/:id/history
 */
export const get_think_pad_history = async (req: AuthenticatedRequest, res: Response) => {
    const user_id = req.user?.id
    if (!user_id) {
        res.status(401).json({ message: "Unauthorized: User ID missing" })
        return
    }

    const id = req.params.id as string
    if (!id) {
        res.status(400).json({ success: false, message: 'ThinkPad ID is required' })
        return
    }

    try {
        // Ensure ThinkPad exists and belongs to the authenticated user
        const think_pad = await prisma.thinkPad.findFirst({
            where: { id, userId: user_id }
        })

        if (!think_pad) {
            res.status(404).json({
                success: false,
                message: 'ThinkPad not found'
            })
            return
        }

        const { page, limit, skip } = parse_pagination_params(req)

        const total_items = await prisma.aiWriterContent.count({
            where: { thinkPadId: id }
        })

        const history = await prisma.aiWriterContent.findMany({
            where: { thinkPadId: id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        })

        const paginated_data = build_paginated_response(history, total_items, page, limit)

        res.status(200).json({
            success: true,
            think_pad: {
                id: think_pad.id,
                think_pad_name: think_pad.thinkPadName
            },
            ...paginated_data
        })
    } catch (error) {
        console.error('Error fetching think pad history:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching ThinkPad history'
        })
    }
}
