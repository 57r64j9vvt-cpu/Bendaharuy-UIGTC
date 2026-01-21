import { PrismaClient, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

interface RawTransaction {
    date: string
    description: string
    income?: string
    expense?: string
}

const rawData: RawTransaction[] = [
    { date: '05/01/2026', description: 'Pemasukan SMAN 12', income: 'Rp958.000' },
    { date: '06/01/2026', description: 'SMAN 10 MKSR & SMAN 15 MKSR', income: 'Rp839.000' },
    { date: '07/01/2026', description: 'SMA 17, 22, 23', income: 'Rp2.166.000' },
    { date: '07/01/2026', description: 'Modal keychain', expense: 'Rp620.000' },
    { date: '07/01/2026', description: 'Modal totebag', expense: 'Rp752.000' },
    { date: '07/01/2026', description: 'Modal sticker set', expense: 'Rp400.000' },
    { date: '07/01/2026', description: 'Modal memopad', expense: 'Rp230.000' },
    { date: '07/01/2026', description: 'Restock keychain makara (80 pcs)', expense: 'Rp520.000' },
    { date: '08/01/2026', description: 'Restock sticker makara (10 lembar)', expense: 'Rp200.000' },
    { date: '08/01/2026', description: 'Pemasukan Kartika, Ummul, Bone', income: 'Rp2.207.000' },
    { date: '09/01/2026', description: 'Modal notebook', expense: 'Rp450.000' },
    { date: '09/01/2026', description: 'Modal sticker makara', expense: 'Rp400.000' },
    { date: '09/01/2026', description: 'SPIDI, Ibnul Qayyim, Pare-pare', income: 'Rp535.000' },
    { date: '10/01/2026', description: 'Restock sticker makara (5 lembar)', expense: 'Rp100.000' },
    { date: '12/01/2026', description: '8, 12, Athpus, Al-azhar', income: 'Rp1.374.000' },
    { date: '13/01/2026', description: 'DP Photobooth', expense: 'Rp500.000' },
    { date: '13/01/2026', description: 'Pangkep (SMA 1 & SMA 11)', income: 'Rp1.434.000' },
    { date: '14/01/2026', description: 'SMA 5 & Gowa', income: 'Rp1.215.000' },
    { date: '14/01/2026', description: 'Restock keychain (180 pcs)', expense: 'Rp1.130.000' },
    { date: '14/01/2026', description: 'Restock sticker set (160 pcs)', expense: 'Rp600.000' },
    { date: '15/01/2026', description: '14,16, Al-ashri, Takalar', income: 'Rp1.457.000' },
    { date: '15/01/2026', description: 'Restock stiker makara', expense: 'Rp100.000' },
    { date: '15/01/2026', description: 'Restock stiker makara', expense: 'Rp180.000' },
    { date: '15/01/2026', description: 'Restock stiker makara', expense: 'Rp180.000' },
    { date: '16/01/2026', description: 'Pembelian dari website', income: 'Rp17.000' },
    { date: '17/01/2026', description: 'Pembelian dari website', income: 'Rp124.000' },
    { date: '19/01/2026', description: 'SDH, SMADA, IPEKA', income: 'Rp1.195.000' },
    { date: '19/01/2026', description: 'Restock Notebook', expense: 'Rp255.000' },
    { date: '20/01/2026', description: 'MAN 2, SMAN 1, Bosowa, Website', income: 'Rp2.696.000' }
]

function parseAmount(amountStr: string | undefined): number {
    if (!amountStr) return 0
    // Remove "Rp", dots, and whitespace
    const cleaned = amountStr.replace(/Rp/g, '').replace(/\./g, '').trim()
    return parseInt(cleaned, 10)
}

function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number)
    return new Date(year, month - 1, day)
}

async function main() {
    console.log('Starting fundraising data import...')

    // 1. Create or Find Pocket "fundraising"
    // We try to find first to avoid duplicates if re-run, or just create.
    // Given the prompt "masukkan data ini ke pocket baru", maybe we should create a new one.
    // I will check if exists first.

    let pocket = await prisma.pocket.findFirst({
        where: { name: 'Fundraising' }
    })

    if (!pocket) {
        console.log('Creating new pocket: Fundraising')
        pocket = await prisma.pocket.create({
            data: {
                name: 'Fundraising',
                balance: 0
            }
        })
    } else {
        console.log('Using existing pocket: Fundraising')
    }

    let totalIncome = 0
    let totalExpense = 0

    // 2. Process Transactions
    for (const row of rawData) {
        const income = parseAmount(row.income)
        const expense = parseAmount(row.expense)

        let amount = 0
        let type: TransactionType

        if (income > 0) {
            amount = income
            type = TransactionType.INCOME
            totalIncome += amount
        } else if (expense > 0) {
            amount = expense
            type = TransactionType.EXPENSE
            totalExpense += amount
        } else {
            console.warn(`Skipping row with no amount: ${JSON.stringify(row)}`)
            continue
        }

        const date = parseDate(row.date)

        await prisma.transaction.create({
            data: {
                description: row.description,
                amount: amount,
                type: type,
                category: 'Fundraising', // General category
                date: date,
                pocketId: pocket.id
            }
        })
    }

    // 3. Update Pocket Balance
    const finalBalance = pocket.balance + totalIncome - totalExpense
    await prisma.pocket.update({
        where: { id: pocket.id },
        data: { balance: finalBalance }
    })

    console.log(`Import completed.`)
    console.log(`Total Income Imported: Rp${totalIncome.toLocaleString('id-ID')}`)
    console.log(`Total Expense Imported: Rp${totalExpense.toLocaleString('id-ID')}`)
    console.log(`Final Pocket Balance: Rp${finalBalance.toLocaleString('id-ID')}`)
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
