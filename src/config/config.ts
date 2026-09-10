import 'dotenv/config'
import { required, optional } from '../utils/required_value_check.js'

interface Config {
    readonly PORT: number
    readonly SUPABASE_URL: string
    readonly SUPABASE_ANON_KEY: string
}

const config: Config = (() => {
    return {
        PORT: Number(required('PORT')),
        SUPABASE_URL: required('SUPABASE_URL'),
        SUPABASE_ANON_KEY: required('SUPABASE_ANON_KEY')
    }
})()

export default config