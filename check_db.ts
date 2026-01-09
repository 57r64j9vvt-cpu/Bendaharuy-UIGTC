import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Attempting to connect to MongoDB...')
        await prisma.$connect()
        console.log('Successfully connected to MongoDB!')
        const count = await prisma.member.count()
        console.log(`Connection verified. Member count: ${count}`)
    } catch (error) {
        console.error('Connection failed:')
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
