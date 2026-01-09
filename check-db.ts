
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Database Connection Check ---')

    const url = process.env.DATABASE_URL
    if (!url) {
        console.error('❌ DATABASE_URL is not defined in environment variables')
        return
    }

    // Mask password in URL for display
    const maskedUrl = url.replace(/:([^:@]+)@/, ':****@')
    console.log(`Connecting to: ${maskedUrl}`)

    try {
        await prisma.$connect()
        console.log('✅ Connected to database successfully!')

        // Try a simple count
        const transactionCount = await prisma.transaction.count()
        console.log(`✅ Database query successful. Found ${transactionCount} transactions.`)

    } catch (e: any) {
        console.error('❌ Connection failed:')
        console.error(e.message)
        if (e.message.includes('DNS resolution')) {
            console.log('\n--- Troubleshooting Tips ---')
            console.log('1. Check if your Internet connection is stable.')
            console.log('2. If using MongoDB Atlas, ensure your IP address is whitelisted in Network Access.')
            console.log('3. Verify the hostname in DATABASE_URL is correct.')
        }
    } finally {
        await prisma.$disconnect()
    }
}

main()
