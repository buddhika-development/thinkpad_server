import 'dotenv/config'
import { required, optional } from '../utils/required_value_check.js'

interface Config {
    readonly PORT: number
}

const config: Config = (() => {
    return {
        PORT: Number(required('PORT'))
    }
})()

export default config