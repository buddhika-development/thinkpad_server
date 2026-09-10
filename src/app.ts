import express, { type Express } from 'express'
import cors from 'cors'
import ai_writer_router from './routes/ai_writer.router.js'
import think_pad_router from './routes/think_pad.router.js'
import config from './config/config.js'

const create_app: () => Express = () => {
    const app = express()

    app.use(cors({
        origin: config.FRONTEND_URL,
        credentials: true
    }))
    app.use(express.json())

    app.use('/api/v1/ai-writer', ai_writer_router)
    app.use('/api/v1/think-pad', think_pad_router)

    return app
}


export default create_app