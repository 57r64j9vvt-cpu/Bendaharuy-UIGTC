'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { handleDbError } from '@/lib/db-error'

/**
 * Calculates the percentage of members who have paid for a specific event.
 */
export async function getSucProgress(eventId: string) {
    try {
        const totalMembers = await prisma.sucRecord.count({
            where: { eventId },
        })

        if (totalMembers === 0) {
            return { success: true, percentage: 0, total: 0, paid: 0 }
        }

        const paidMembers = await prisma.sucRecord.count({
            where: {
                eventId,
                status: 'PAID',
            },
        })

        const percentage = (paidMembers / totalMembers) * 100

        return {
            success: true,
            percentage: parseFloat(percentage.toFixed(2)), // Return fixed 2 decimal places
            total: totalMembers,
            paid: paidMembers,
        }
    } catch (error: any) {
        return handleDbError(error, 'fetching SUC progress')
    }
}

/**
 * Marks a specific member's SUC record as PAID and automatically logs a generic INCOME transaction.
 */
export async function markAsPaid(memberId: string, eventId: string) {
    try {
        const event = await prisma.sucEvent.findUnique({ where: { id: eventId } })
        const member = await prisma.member.findUnique({ where: { id: memberId } })

        if (!event || !member) {
            return { success: false, error: 'Event or Member not found' }
        }

        await prisma.$transaction(async (tx: any) => {
            const existingRecord = await tx.sucRecord.findUnique({
                where: {
                    memberId_eventId: {
                        memberId,
                        eventId
                    }
                }
            })

            if (!existingRecord) {
                // If record doesn't exist, maybe create it? For now, assume it must exist (seeded).
                throw new Error('SUC Record not found for this member and event.')
            }

            if (existingRecord.status === 'PAID') return

            await tx.sucRecord.update({
                where: { id: existingRecord.id },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                },
            })

            await tx.transaction.create({
                data: {
                    amount: existingRecord.billedAmount, // Use the specific billed amount
                    type: 'INCOME',
                    category: 'SUC Payment',
                    date: new Date(),
                    description: `SUC Payment: ${event.title} - ${member.name} (${member.division})`,
                },
            })
        })

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        return handleDbError(error, 'marking SUC as paid')
    }
}

/**
 * Fetches the list of members and their payment status for a specific event.
 */
export async function getSucDetails(eventId: string) {
    try {
        const records = await prisma.sucRecord.findMany({
            where: { eventId },
            include: {
                member: true
            },
            orderBy: {
                member: {
                    name: 'asc'
                }
            }
        })

        return { success: true, data: records }
    } catch (error: any) {
        return handleDbError(error, 'fetching SUC details')
    }
}

/**
 * Fetches the ID of the latest created SUC Event.
 */
export async function getLatestEventId() {
    try {
        const event = await prisma.sucEvent.findFirst({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, id: event?.id }
    } catch (error: any) {
        return handleDbError(error, 'fetching latest event ID')
    }
}
