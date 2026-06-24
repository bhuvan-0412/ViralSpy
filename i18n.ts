import { defineRouting } from 'next-intl/routing'
import { getRequestConfig } from 'next-intl/server'

export const routing = defineRouting({
  locales: ['en', 'hi', 'te'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export default getRequestConfig(async (context) => {
  // Extract locale from the context (handles both requestLocale promise and direct locale property)
  let locale = (context as any).locale || (await (context as any).requestLocale)

  // Enforce a strict fallback to default locale 'en' if undefined or invalid
  if (!locale || !['en', 'hi', 'te'].includes(locale)) {
    locale = 'en'
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
