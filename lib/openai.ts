import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY || ''

export const openai =
  !apiKey || apiKey.includes('placeholder') || apiKey.includes('your_openai_api_key')
    ? null
    : new OpenAI({ apiKey })

export const isOpenAiConfigured = (): boolean => {
  return !!apiKey && !apiKey.includes('placeholder') && !apiKey.includes('your_openai_api_key')
}
