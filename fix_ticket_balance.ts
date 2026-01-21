
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Fixing Ticket Pocket Balance...")

    // 1. Find Ticket Pocket
    const pocket = await prisma.pocket.findFirst({
        where: { name: { contains: 'Ticket', mode: 'insensitive' } }
    })

    if (!pocket) {
        console.error("Ticket pocket not found!")
        return
    }

    console.log(`Found Pocket: ${pocket.name} (ID: ${pocket.id}, Balance: ${pocket.balance})`)

    // 2. Check if Initial Balance transaction already exists (idempotency check)
    const existing = await prisma.transaction.findFirst({
        where: {
            pocketId: pocket.id,
            description: { contains: "Initial Balance" }
        }
    })

    if (existing) {
        console.log("Initial Balance transaction already exists. Skipping.")
        return
    }

    // 3. Create Transaction
    // distinct amount: 14,575,000
    const AMOUNT = 14575000

    const tx = await prisma.transaction.create({
        data: {
            amount: AMOUNT,
            type: 'INCOME',
            category: 'Initial Balance',
            description: `Initial Balance (${pocket.name})`,
            date: new Date('2024-01-01'), // Set to past date
            pocketId: pocket.id
        }
    })

    console.log("Created Transaction:", tx)
    console.log("Done.")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
