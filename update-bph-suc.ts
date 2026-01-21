
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('💰 Updating SUC Amount for BPH Members...')

    // 1. Get latest event
    const latestEvent = await prisma.sucEvent.findFirst({
        orderBy: { createdAt: 'desc' },
    })

    if (!latestEvent) {
        console.log('❌ No event found.')
        return
    }

    console.log(`🎯 Target Event: ${latestEvent.title}`)

    // 2. Find records for BPH members in this event
    // We update Many where member is BPH
    // Note: updateMany doesn't support deep relation filtering (where: { member: { role: 'BPH' } }) in earlier Prisma versions or Mongo properly sometimes.
    // Let's first find the IDs.

    const bphMembers = await prisma.member.findMany({
        where: {
            role: 'BPH'
        },
        select: { id: true, name: true }
    })

    const bphMemberIds = bphMembers.map(m => m.id)

    console.log(`👥 Found ${bphMemberIds.length} BPH members. Updating their records...`)

    const updateResult = await prisma.sucRecord.updateMany({
        where: {
            eventId: latestEvent.id,
            memberId: {
                in: bphMemberIds
            }
        },
        data: {
            billedAmount: 170000
        }
    })

    console.log(`✅ Updated ${updateResult.count} records to Rp 170.000`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
