
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Analyzing Pocket vs Transaction Consistency...")

    const pockets = await prisma.pocket.findMany({
        include: {
            transactions: true
        }
    })

    let totalPocketBalance = 0
    let totalTxImpliedBalance = 0

    console.log("---------------------------------------------------")
    console.log(String("Pocket Name").padEnd(20), String("Balance").padEnd(15), String("Tx Net").padEnd(15), "Diff")
    console.log("---------------------------------------------------")

    for (const pocket of pockets) {
        let txNet = 0
        for (const tx of pocket.transactions) {
            if (tx.type === 'INCOME') txNet += tx.amount
            else if (tx.type === 'EXPENSE') txNet -= tx.amount
        }

        const diff = pocket.balance - txNet
        totalPocketBalance += pocket.balance
        totalTxImpliedBalance += txNet

        console.log(
            pocket.name.padEnd(20),
            String(pocket.balance).padEnd(15),
            String(txNet).padEnd(15),
            diff === 0 ? "OK" : diff > 0 ? `+${diff}` : diff
        )
    }

    console.log("---------------------------------------------------")
    console.log("Total Pocket Balance:", totalPocketBalance)
    console.log("Total Tx Net (in pockets):", totalTxImpliedBalance)
    console.log("Difference:", totalPocketBalance - totalTxImpliedBalance)

    // Check transactions without pockets
    const orphans = await prisma.transaction.findMany({
        where: { pocketId: null }
    })

    let orphanNet = 0
    orphans.forEach(tx => {
        if (tx.type === 'INCOME') orphanNet += tx.amount
        else orphanNet -= tx.amount
    })
    console.log("Orphan Transactions Net:", orphanNet)
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
