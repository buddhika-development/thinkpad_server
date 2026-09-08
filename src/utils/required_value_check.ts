import 'dotenv/config'

export const required = (key: string): string => {
    const value = process.env[key]

    if (!value) {
        throw new Error(`Required environment variable ${key} is not defined`)
    }
    return value
}


export const optional = (key: string, falleback: string): string => {
    return process.env[key] || falleback
}