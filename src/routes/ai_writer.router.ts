import { Router } from "express";
import { ai_writer_controller } from '../controllers/ai_writer.controller.js'

const ai_writer_router: Router = Router()

ai_writer_router.post('/', ai_writer_controller)

export default ai_writer_router