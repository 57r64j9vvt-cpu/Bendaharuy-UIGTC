'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/others"
import { ArrowLeft, Loader2, Plus, X, Wallet, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPocketDetails, deletePocket } from '@/actions/pocket'

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export default function PocketDetailsPage({ params }: { params: { id: string } }) {
    const [pocket, setPocket] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const id = params.id

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            const res = await getPocketDetails(id)
            if (res.success && 'data' in res) {
                setPocket(res.data)
            }
            setIsLoading(false)
        }
        fetchData()
    }, [id])

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this pocket?')) return
        await deletePocket(id)
        router.push('/pockets')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin" />
            </div>
        )
    }

    if (!pocket) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
                <h1 className="text-2xl font-bold">Pocket Not Found</h1>
                <Link href="/pockets" className="text-emerald-400 hover:underline">Return to Pockets</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
                    <div className="space-y-1">
                        <Link href="/pockets" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-2 gap-1">
                            <ArrowLeft size={16} /> Back to Pockets
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">{pocket.name}</h1>
                        <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest text-xs">ID: {pocket.id}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current Balance</p>
                            <p className="text-3xl font-bold text-emerald-400 tracking-tight">{formatCurrency(pocket.balance)}</p>
                        </div>
                        <button
                            onClick={handleDelete}
                            className="ml-4 p-3 rounded-full bg-rose-950/30 text-rose-500 border border-rose-500/20 hover:bg-rose-900/50 transition-colors"
                            title="Delete Pocket"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-emerald-500/20 bg-emerald-950/10">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-400/80 uppercase tracking-widest mb-1">Total Income</p>
                                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(pocket.stats?.totalIncome || 0)}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <TrendingUp size={24} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-rose-500/20 bg-rose-950/10">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-rose-400/80 uppercase tracking-widest mb-1">Total Expense</p>
                                <p className="text-2xl font-bold text-rose-400">{formatCurrency(pocket.stats?.totalExpense || 0)}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <TrendingDown size={24} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Transaction History</h2>
                    <Card className="border-white/5 bg-zinc-900/20">
                        <div className="divide-y divide-white/5">
                            {pocket.transactions?.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 italic">
                                    No transactions in this pocket yet.
                                </div>
                            ) : (
                                pocket.transactions.map((tx: any) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${tx.type === 'INCOME' ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-500' : 'bg-rose-950/30 border-rose-500/20 text-rose-500'}`}>
                                                {tx.type === 'INCOME' ? <Plus size={16} /> : <X size={16} className="rotate-45" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{tx.description}</p>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <Badge variant="outline" className="border-white/10 text-[10px] font-normal px-1 py-0 h-auto">{tx.category}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-mono font-medium ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
