
/**
 * Helper to handle Prisma database errors gracefully, especially network/DNS issues.
 */
export function handleDbError(error: any, context: string) {
    // Convert error to string to catch nested messages/causes
    const errorString = String(error)
    const message = error?.message || ''

    // List of keywords that indicate a temporary network/connection issue
    const networkKeywords = [
        'DNS resolution',
        'request timed out',
        'Error in connector',
        'PrismaClientInitializationError',
        'Connection closed',
        'Server selection timed out'
    ]

    const isNetworkError = networkKeywords.some(keyword =>
        errorString.includes(keyword) || message.includes(keyword)
    )

    if (isNetworkError) {
        // Log a single line warning instead of a massive stack trace
        console.warn(`⚠️  DB Error (${context}): Connection failed. (Likely DNS/Network timeout)`)
        return { success: false, error: 'Database connection failed' }
    }

    // specific suppression for "Invalid invocation" which often wraps the connector error
    if (errorString.includes('Invalid') && errorString.includes('invocation')) {
        console.warn(`⚠️  DB Error (${context}): Invalid Client Invocation (likely checking connection).`)
        return { success: false, error: 'Database error' }
    }

    // For other errors, log the full error
    console.error(`❌ Error ${context}:`, error)
    return { success: false, error: `Failed to ${context}` }
}
