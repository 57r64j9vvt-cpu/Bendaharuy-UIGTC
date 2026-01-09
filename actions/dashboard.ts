'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardMetrics() {
    try {
        // 1. Calculate Total Income
        // Fetch all transactions to manually calculate totals (more robust for Mongo/Prisma edge cases)
        const transactions = await prisma.transaction.findMany({
            select: {
                type: true,
                amount: true
            }
        })

        let totalIncome = 0
        let totalExpense = 0

        transactions.forEach((tx: any) => {
            if (tx.type === 'INCOME') totalIncome += tx.amount
            else if (tx.type === 'EXPENSE') totalExpense += tx.amount
        })

        // Totals calculated above
        const totalBalance = totalIncome - totalExpense

        return {
            success: true,
            data: {
                totalIncome,
                totalExpense,
                totalBalance,
            },
        }
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
        return { success: false, error: 'Failed to fetch dashboard metrics' }
    }
}
