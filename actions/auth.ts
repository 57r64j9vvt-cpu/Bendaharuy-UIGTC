'use server'

import { cookies } from 'next/headers'

export async function login(password: string) {
    // Default password for development if env is missing
    const correctPassword = process.env.APP_PASSWORD || 'admin123'

    if (password === correctPassword) {
        cookies().set('auth_token', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        })
        return { success: true }
    }

    return { success: false, error: 'Incorrect password' }
}
