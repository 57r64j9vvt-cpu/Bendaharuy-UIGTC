import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testFetch() {
    console.log('Testing Data Fetch...')
    try {
        const start = performance.now()

        // Race between fetch and timeout
        const fetchPromise = prisma.transaction.findMany({
            take: 5,
            orderBy: { date: 'desc' }
        })

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
        )

        const transactions: any = await Promise.race([fetchPromise, timeoutPromise])
        const end = performance.now()

        console.log(`Successfully fetched ${transactions.length} transactions in ${(end - start).toFixed(2)}ms`)
        console.log('Sample Data:', transactions)
    } catch (error) {
        console.error('Fetch Failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

testFetch()
