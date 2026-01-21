
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Syncing SUC Records...')

    // 1. Get latest event
    const latestEvent = await prisma.sucEvent.findFirst({
        orderBy: { createdAt: 'desc' },
    })

    if (!latestEvent) {
        console.log('❌ No event found to sync to.')
        return
    }

    console.log(`🎯 Target Event: ${latestEvent.title}`)

    // 2. Find members without records
    const membersWithoutRecords = await prisma.member.findMany({
        where: {
            sucRecords: {
                none: {
                    eventId: latestEvent.id
                }
            }
        }
    })

    if (membersWithoutRecords.length === 0) {
        console.log('✅ No missing records found.')
        return
    }

    console.log(`📝 Creating records for ${membersWithoutRecords.length} members...`)

    // 3. Create records
    // We use a loop/promise.all instead of createMany to be safer with Mongo relations sometimes, 
    // but createMany is supported in recent Prisma versions for Mongo too if 
    // we don't need relation connect. But here we do. 
    // Actually createMany is supported for Mongo in newer versions, 
    // but let's stick to simple loop for clarity and error handling per item.

    let successCount = 0

    for (const member of membersWithoutRecords) {
        try {
            await prisma.sucRecord.create({
                data: {
                    memberId: member.id,
                    eventId: latestEvent.id,
                    status: 'UNPAID',
                    billedAmount: latestEvent.amountRequired || 150000
                }
            })
            successCount++
            // process.stdout.write('.') // minimal progress
        } catch (error) {
            console.error(`❌ Failed for ${member.name}:`, error)
        }
    }

    console.log(`\n✨ Successfully synced ${successCount} records.`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
