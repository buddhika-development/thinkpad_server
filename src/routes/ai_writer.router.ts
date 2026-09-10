import { Router } from "express";
import { ai_writer_controller, ai_writer_streming_controller, save_note_controller } from '../controllers/ai_writer.controller.js'
import { authenticate_user } from '../middlewares/auth.middleware.js'

const ai_writer_router: Router = Router()

ai_writer_router.post('/', authenticate_user, ai_writer_controller)
ai_writer_router.post('/stream', authenticate_user, ai_writer_streming_controller)
ai_writer_router.post('/note', authenticate_user, save_note_controller)
ai_writer_router.post('/save-note', authenticate_user, save_note_controller)

export default ai_writer_router