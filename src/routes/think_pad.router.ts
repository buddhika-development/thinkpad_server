import { Router } from 'express'
import {
    create_think_pad,
    get_think_pads,
    get_think_pad_by_id,
    update_think_pad,
    delete_think_pad,
    get_think_pad_history
} from '../controllers/think_pad.controller.js'
import { authenticate_user } from '../middlewares/auth.middleware.js'

const think_pad_router: Router = Router()

think_pad_router.post('/', authenticate_user, create_think_pad)
think_pad_router.get('/', authenticate_user, get_think_pads)
think_pad_router.get('/:id', authenticate_user, get_think_pad_by_id)
think_pad_router.get('/:id/history', authenticate_user, get_think_pad_history)
think_pad_router.put('/:id', authenticate_user, update_think_pad)
think_pad_router.delete('/:id', authenticate_user, delete_think_pad)

export default think_pad_router
