import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function benchmark() {
    console.log('Starting Benchmark...')

    // 1. Connection Time
    const startConnect = performance.now()
    await prisma.$connect()
    const endConnect = performance.now()
    console.log(`Connection Time: ${(endConnect - startConnect).toFixed(2)}ms`)

    // 2. Insert Time
    const startInsert = performance.now()
    const tx = await prisma.transaction.create({
        data: {
            amount: 1000,
            type: 'INCOME',
            category: 'Benchmark',
            description: 'Benchmark Test',
            date: new Date()
        }
    })
    const endInsert = performance.now()
    console.log(`Insert Time: ${(endInsert - startInsert).toFixed(2)}ms`)

    // 3. Delete Time (Cleanup)
    const startDelete = performance.now()
    await prisma.transaction.delete({
        where: { id: tx.id }
    })
    const endDelete = performance.now()
    console.log(`Delete Time: ${(endDelete - startDelete).toFixed(2)}ms`)

    await prisma.$disconnect()
}

benchmark()
