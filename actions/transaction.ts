'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { handleDbError } from '@/lib/db-error'

export type CreateTransactionData = {
    amount: number
    type: 'INCOME' | 'EXPENSE'
    category: string
    description: string
}

/**
 * Creates a generic transaction (Income or Expense).
 */
export async function createTransaction(data: CreateTransactionData) {
    try {
        console.time('Prisma Create')
        await prisma.transaction.create({
            data: {
                amount: data.amount,
                type: data.type,
                category: data.category,
                description: data.description,
                date: new Date(),
            },
        })
        console.timeEnd('Prisma Create')

        console.time('Revalidate')
        revalidatePath('/')
        console.timeEnd('Revalidate')

        return { success: true }
    } catch (error: any) {
        return handleDbError(error, 'creating transaction')
    }
}

/**
 * Fetches transaction data grouped by date for the chart.
 * Returns the last 30 days or similar range.
 */
export async function getFinancialChartData() {
    try {
        // Ideally we group by day in SQL, but Prisma groupBy date is tricky without native query.
        // We'll fetch last 30 days raw and aggregate in JS for simplicity and DB compatibility.

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const transactions = await prisma.transaction.findMany({
            where: {
                date: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        // Group by Date "YYYY-MM-DD"
        const grouped: Record<string, { date: string; income: number; expense: number }> = {}

        transactions.forEach((tx: any) => {
            const dateKey = tx.date.toISOString().split('T')[0] // YYYY-MM-DD

            if (!grouped[dateKey]) {
                grouped[dateKey] = { date: dateKey, income: 0, expense: 0 }
            }

            if (tx.type === 'INCOME') {
                grouped[dateKey].income += Number(tx.amount)
            } else {
                grouped[dateKey].expense += Number(tx.amount)
            }
        })

        // Convert to array
        const chartData = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))

        return { success: true, data: chartData }
    } catch (error: any) {
        return handleDbError(error, 'fetching chart data')
    }
}

export async function getRecentTransactions() {
    try {
        const transactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: {
                date: 'desc'
            }
        })
        return { success: true, data: transactions }
    } catch (error: any) {
        return handleDbError(error, 'fetching recent transactions')
    }
}

export async function getAllTransactions() {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: {
                date: 'desc'
            }
        })
        return { success: true, data: transactions }
    } catch (error: any) {
        return handleDbError(error, 'fetching all transactions')
    }
}
