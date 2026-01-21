
import { PrismaClient, MemberRole } from '@prisma/client'

const prisma = new PrismaClient()

const members = [
    // Operational
    { name: 'Agib', division: 'Operational', role: MemberRole.BPH },
    { name: 'Ruby', division: 'Operational', role: MemberRole.BPH },
    { name: 'Lutfi', division: 'Operational', role: MemberRole.STAFF },

    // Marketing
    { name: 'Nanas', division: 'Marketing', role: MemberRole.BPH },
    { name: 'Odi', division: 'Marketing', role: MemberRole.BPH },
    { name: 'Ilya', division: 'Marketing', role: MemberRole.BPH },

    // External
    { name: 'Farah', division: 'External', role: MemberRole.STAFF },
    { name: 'Umay', division: 'External', role: MemberRole.STAFF },
    { name: 'Linda', division: 'External', role: MemberRole.STAFF },

    // Sponsorship
    { name: 'Agung', division: 'Sponsorship', role: MemberRole.BPH },
    { name: 'Naren', division: 'Sponsorship', role: MemberRole.BPH },
    { name: 'Dea', division: 'Sponsorship', role: MemberRole.BPH },

    // Roadshow
    { name: 'Livi', division: 'Roadshow', role: MemberRole.BPH },
    { name: 'Nasya', division: 'Roadshow', role: MemberRole.BPH },
    { name: 'Rara', division: 'Roadshow', role: MemberRole.BPH },

    // Fundraising
    { name: 'Rere', division: 'Fundraising', role: MemberRole.BPH },
    { name: 'Tita', division: 'Fundraising', role: MemberRole.BPH },
    { name: 'Ica', division: 'Fundraising', role: MemberRole.BPH },

    // HR
    { name: 'Dilla', division: 'HR', role: MemberRole.BPH },
    { name: 'Tisya', division: 'HR', role: MemberRole.BPH },
    { name: 'Nopal', division: 'HR', role: MemberRole.BPH },

    // VCD
    { name: 'Gyas', division: 'VCD', role: MemberRole.BPH },
    { name: 'Chealsea', division: 'VCD', role: MemberRole.BPH },
    { name: 'Abijael', division: 'VCD', role: MemberRole.BPH },
]

async function main() {
    console.log('🌱 Starting seeding...')

    for (const member of members) {
        // Check if exists to avoid duplicates (optional, based on name)
        const existing = await prisma.member.findFirst({
            where: {
                name: {
                    equals: member.name,
                    mode: 'insensitive' // case insensitive check
                }
            }
        })

        if (!existing) {
            await prisma.member.create({
                data: {
                    name: member.name,
                    division: member.division,
                    role: member.role,
                    status: 'ACTIVE'
                }
            })
            console.log(`✅ Created: ${member.name} (${member.division})`)
        } else {
            console.log(`ℹ️  Skipped: ${member.name} (Already exists)`)
        }
    }

    console.log('✨ Seeding completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
