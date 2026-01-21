
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking SUC State...')

    // 1. Get latest event
    const latestEvent = await prisma.sucEvent.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            sucRecords: true
        }
    })

    if (!latestEvent) {
        console.log('❌ No SUC Events found. You need to create an event first.')
        return
    }

    console.log(`📅 Latest Event: ${latestEvent.title} (ID: ${latestEvent.id})`)
    console.log(`   - Existing Records: ${latestEvent.sucRecords.length}`)

    // 2. Get all members
    const members = await prisma.member.count()
    console.log(`👥 Total Members in DB: ${members}`)

    // 3. Find members without records for this event
    const membersWithoutRecords = await prisma.member.findMany({
        where: {
            sucRecords: {
                none: {
                    eventId: latestEvent.id
                }
            }
        }
    })

    console.log(`⚠️  Members missing from this event: ${membersWithoutRecords.length}`)

    if (membersWithoutRecords.length > 0) {
        console.log('   Syncing needed for:', membersWithoutRecords.map(m => m.name).join(', '))
    } else {
        console.log('✅ All members are synced to this event.')
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
