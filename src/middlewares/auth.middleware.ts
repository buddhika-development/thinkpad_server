import type { Request, Response, NextFunction } from 'express'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../config/supabase.config.js'

export interface AuthenticatedRequest extends Request {
    user?: User
}

export const authenticate_user = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const auth_header = req.headers.authorization

        if (!auth_header || !auth_header.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Authorization header is missing or malformed. Expected Bearer token.'
            })
            return
        }

        const token = auth_header.split(' ')[1]

        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid or expired access token',
                error: error?.message
            })
            return
        }

        req.user = user
        next()
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server authentication error'
        })
        return
    }
}
