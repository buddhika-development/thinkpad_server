import express, { type Express } from 'express'

const create_app: () => Express = () => {
    const app = express()
    return app
}


export default create_app