
import { getDashboardMetrics } from './actions/dashboard'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Verifying Dashboard Metrics...")

    // 1. Get Metrics via Action
    const metrics = await getDashboardMetrics()
    console.log("Metrics Result:", metrics)

    // 2. Manual Verification
    const pockets = await prisma.pocket.findMany()
    const sumPockets = pockets.reduce((acc, p) => acc + p.balance, 0)

    console.log("Sum of Pockets (Manual):", sumPockets)

    if (metrics.success && "data" in metrics && metrics.data.totalBalance === sumPockets) {
        console.log("SUCCESS: Dashboard Total Balance matches Sum of Pockets")
    } else {
        console.error("FAILURE: Mismatch detected")
    }
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
