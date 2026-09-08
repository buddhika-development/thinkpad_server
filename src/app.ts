import express, { type Express } from 'express'
import ai_writer_router from './routes/ai_writer.router.js'

const create_app: () => Express = () => {
    const app = express()

    app.use(express.json())

    app.use('/api/v1/ai-writer', ai_writer_router)

    return app
}


export default create_app