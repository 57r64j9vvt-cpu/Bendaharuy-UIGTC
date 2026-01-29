'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { handleDbError } from '@/lib/db-error'

export async function syncPocketBalances() {
    try {
        console.log("Starting Pocket Balance Sync...")

        const pockets = await prisma.pocket.findMany()
        let updatedCount = 0

        for (const pocket of pockets) {
            // Aggregate transactions for this pocket
            const aggregationsIncome = await prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                    pocketId: pocket.id,
                    type: 'INCOME'
                }
            })
            const incomeSum = aggregationsIncome._sum.amount || 0

            const aggregationsExpense = await prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                    pocketId: pocket.id,
                    type: 'EXPENSE'
                }
            })
            const expenseSum = aggregationsExpense._sum.amount || 0

            const newBalance = incomeSum - expenseSum

            if (pocket.balance !== newBalance) {
                await prisma.pocket.update({
                    where: { id: pocket.id },
                    data: { balance: newBalance }
                })
                updatedCount++
            }
        }

        revalidatePath('/')
        revalidatePath('/pockets')

        return { success: true, updatedCount }
    } catch (error: any) {
        return handleDbError(error, 'syncing pocket balances')
    }
}
