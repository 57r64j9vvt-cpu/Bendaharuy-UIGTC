'use server'

import { prisma } from '@/lib/prisma'
import { handleDbError } from '@/lib/db-error'

export async function getDashboardMetrics() {
    try {
        // 1. Calculate Total Income
        // Fetch all transactions and pockets
        const [transactions, pockets] = await Promise.all([
            prisma.transaction.findMany({
                select: {
                    type: true,
                    amount: true
                }
            }),
            prisma.pocket.findMany({
                select: {
                    balance: true
                }
            })
        ])

        let totalIncome = 0
        let totalExpense = 0

        transactions.forEach((tx: any) => {
            if (tx.type === 'INCOME') totalIncome += tx.amount
            else if (tx.type === 'EXPENSE') totalExpense += tx.amount
        })

        // Totals calculated above
        // const totalBalance = totalIncome - totalExpense

        // Use Pockets for Total Balance
        const totalBalance = pockets.reduce((sum, pocket) => sum + pocket.balance, 0)

        return {
            success: true,
            data: {
                totalIncome,
                totalExpense,
                totalBalance,
            },
        }
    } catch (error: any) {
        return handleDbError(error, 'fetching dashboard metrics')
    }
}
