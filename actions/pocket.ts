'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { handleDbError } from '@/lib/db-error'

export type CreatePocketData = {
    name: string
    initialBalance?: number
}

/**
 * Creates a new pocket for managing finances.
 */
export async function createPocket(data: CreatePocketData) {
    try {
        await prisma.pocket.create({
            data: {
                name: data.name,
                balance: data.initialBalance || 0,
            },
        })
        revalidatePath('/')
        revalidatePath('/pockets')
        return { success: true }
    } catch (error: any) {
        return handleDbError(error, 'creating pocket')
    }
}

/**
 * Fetches all pockets.
 */
export async function getPockets() {
    try {
        const pockets = await prisma.pocket.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: pockets }
    } catch (error: any) {
        return handleDbError(error, 'fetching pockets')
    }
}

/**
 * Deletes a pocket.
 */
export async function deletePocket(id: string) {
    try {
        await prisma.pocket.delete({
            where: { id }
        })
        revalidatePath('/')
        revalidatePath('/pockets')
        return { success: true }
    } catch (error: any) {
        return handleDbError(error, 'deleting pocket')
    }
}

/**
 * Fetches pocket details including transactions and metrics.
 */
export async function getPocketDetails(id: string) {
    try {
        const pocket = await prisma.pocket.findUnique({
            where: { id },
            include: {
                transactions: {
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        })

        if (!pocket) {
            return { success: false, error: 'Pocket not found' }
        }

        // Calculate aggregates dynamically for display (or trust stored balance)
        let totalIncome = 0
        let totalExpense = 0

        pocket.transactions.forEach(tx => {
            if (tx.type === 'INCOME') totalIncome += tx.amount
            else totalExpense += tx.amount
        })

        return {
            success: true,
            data: {
                ...pocket,
                stats: {
                    totalIncome,
                    totalExpense
                }
            }
        }
    } catch (error: any) {
        return handleDbError(error, 'fetching pocket details')
    }
}
