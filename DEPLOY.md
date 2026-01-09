# How to Deploy to Vercel

This project is optimized for deployment on [Vercel](https://vercel.com).

## Prerequisites
1. A GitHub repository with this project pushed.
2. A MongoDB Atlas database (or any compatible MongoDB provider).

## Step-by-Step Guide

1. **Dashboard Setup**
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Import your GitHub repository.

2. **Environment Variables**
   In the "Configure Project" screen, expand "Environment Variables" and add:
   
   | Name | Description | Example |
   |------|-------------|---------|
   | `DATABASE_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
   | `APP_PASSWORD` | Password for login page | `MySecretPin123` |

3. **Deploy**
   - Click "Deploy".
   - Vercel will automatically detect Next.js and run `postinstall` (which runs `prisma generate`) + `npm run build`.

## Troubleshooting
- **Prisma Error**: If you see an error about Prisma Client, make sure `DATABASE_URL` is correct and allows access from Vercel IPs (allow 0.0.0.0/0 in MongoDB Atlas Network Access).
- **Build Failure**: Check the logs. If it's a type error, fix it locally and push.
