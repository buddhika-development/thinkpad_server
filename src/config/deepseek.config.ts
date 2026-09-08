import { required, optional } from '../utils/required_value_check.js'

interface DeepseekConfig {
    readonly DEEPSEEK_API_KEY: string
    readonly DEEPSEEK_MODEL_NAME: string
}

const deepseek_config: DeepseekConfig = (() => {
    return {
        DEEPSEEK_API_KEY: required('DEEPSEEK_API_KEY'),
        DEEPSEEK_MODEL_NAME: optional('DEEPSEEK_MODEL_NAME', 'deepseek-v4-flash')
    }
})()

export default deepseek_config