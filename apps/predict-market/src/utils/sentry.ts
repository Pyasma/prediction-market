import * as Sentry from '@sentry/nextjs'

type logLevel = 'info' | 'warning' | 'error' | 'debug' | 'fatal' 

export async function LogEvent(
    message:string,
    category: string = 'general',
    data?: Record<string, unknown>,
    level: logLevel = 'info',
    error?: unknown
) {
    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level
    })

    if (error) {
        Sentry.captureException(error,{extra:data})
    } else {
        Sentry.captureMessage(message, level)
    }
}