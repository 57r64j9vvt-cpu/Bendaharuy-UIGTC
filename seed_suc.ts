import { PrismaClient, MemberRole, MemberStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Clear existing data
    await prisma.transaction.deleteMany({}) // Also clear transactions to be safe/consistent
    await prisma.sucRecord.deleteMany({})
    await prisma.member.deleteMany({})
    await prisma.sucEvent.deleteMany({})

    // 2. Create Event
    const event = await prisma.sucEvent.create({
        data: {
            title: 'UIGTC 2024',
            amountRequired: 150000, // Default base
            deadline: new Date('2024-02-28'), // Example deadline
        }
    })
    console.log(`Created Event: ${event.title}`)

    // 3. Define Members Data
    const divisions = [
        {
            name: 'PI',
            role: MemberRole.PI,
            members: ['Obi', 'Pudil', 'Abi', 'Debol', 'Diva']
        },
        {
            name: 'Event',
            members: [
                { name: 'Viernis', role: MemberRole.BPH },
                { name: 'Jerry', role: MemberRole.BPH },
                { name: 'Sasa', role: MemberRole.BPH },
                'Andi Naurah Zahra Azhar', 'Fariza Audya Farahdita', 'Layyina Tussifha', 'Lefi', 'Ratu Aulya Rahmah', 'Shafa Kayla Khairunnisa'
            ]
        },
        {
            name: 'External',
            members: ['Akhtar Ulrich Darmawan', 'Kani Azzahra Jefri', 'Nur Aisyah Rudy', 'Nurul Aqilah Sa\'adah Adrias', 'Zahwa Afizah']
        },
        {
            name: 'Fundraising',
            members: ['Aamirah F.P. Mahmudiah', 'Ashalina Shaista Ayla', 'Dhafin Fahrezy Sahama', 'Dimas Feryandi Putra S', 'Efa Fatma Dewi', 'St. Syuhrah']
        },
        {
            name: 'HR',
            members: ['Anshar Takha', 'R. Arjuna Maulana P.', 'Zul Karnail']
        },
        {
            name: 'Marketing',
            members: ['Aliyah S. Putri Hartono', 'Gita Auliah', 'Muh. Arif Hamsah', 'Nurmayanti', 'Nurulfarhah', 'Siti Anisa Indah Musbah']
        },
        {
            name: 'Operational',
            members: ['Ahmad Rozaan', 'Khalishah Athiyah', 'Lutfi Muh. Arya Ardiawan']
        },
        {
            name: 'Roadshow',
            members: ['Alizar', 'Alvin Muharramsyah Anhar', 'Diandra Abidzar Zul Atsari', 'Fadilah Farah Miskah Rahman', 'Muh. Faiz Dwiputra', 'Muh. Farrel Aqil Mabrur', 'Muh. Tajsmul Jumran', 'Raodatul Janna', 'Shizkia Christania Pabura']
        },
        {
            name: 'VCD',
            members: ['Arya Sangaji Agung', 'Graceylah R. Melianus', 'Nida Nafisah Mirsyaf', 'Nurul Fajri']
        },
        {
            name: 'Sponsorship',
            members: ['Ghadiza Fatimah Azzahra', 'Latifahtun Nur Faqihah S.', 'Muh. Nabil', 'Syahdah Khalisa Lutfi']
        }
    ]

    for (const div of divisions) {
        console.log(`Seeding Division: ${div.name}`)
        for (const m of div.members) {
            let memberName = ''
            let memberRole: MemberRole = MemberRole.STAFF

            // Handle simple string or object with role override
            if (typeof m === 'string') {
                memberName = m
                if (div.name === 'PI') memberRole = MemberRole.PI
            } else {
                memberName = m.name
                memberRole = m.role || MemberRole.STAFF
            }

            // Determine Billed Amount
            let billedAmount = 150000
            if (memberRole === MemberRole.PI) billedAmount = 200000
            if (memberRole === MemberRole.BPH) billedAmount = 170000

            // Create Member
            const newMember = await prisma.member.create({
                data: {
                    name: memberName,
                    division: div.name,
                    role: memberRole,
                    status: MemberStatus.ACTIVE
                }
            })

            // Create SUC Record
            await prisma.sucRecord.create({
                data: {
                    memberId: newMember.id,
                    eventId: event.id,
                    billedAmount: billedAmount,
                    status: 'UNPAID'
                }
            })
        }
    }

    console.log('Seeding completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
