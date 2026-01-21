'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/others"
import { Plus, Trash2, Wallet, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createPocket, getPockets, deletePocket } from '@/actions/pocket'
import { useRouter } from 'next/navigation'

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export default function PocketsPage() {
    const [pockets, setPockets] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({ name: '', initialBalance: '' })
    const router = useRouter()

    const fetchPockets = async (silent = false) => {
        if (!silent) setIsLoading(true)
        const res = await getPockets()
        if (res.success && 'data' in res) {
            setPockets(res.data)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchPockets()
    }, [])

    const handleCreatePocket = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        await createPocket({
            name: formData.name,
            initialBalance: parseInt(formData.initialBalance.replace(/\D/g, '')) || 0
        })

        setIsSubmitting(false)
        setIsModalOpen(false)
        setFormData({ name: '', initialBalance: '' })
        fetchPockets(true) // Silent refresh
    }

    const handleDeletePocket = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering card click if we add one later
        if (!confirm('Are you sure you want to delete this pocket? Transactions will remain but lose their association.')) return

        // Optimistic update
        setPockets(prev => prev.filter(p => p.id !== id))

        await deletePocket(id)
        fetchPockets(true) // Silent sync
    }

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 50 }
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-white/5">
                    <div className="space-y-1">
                        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors mb-2 gap-1">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Pockets</h1>
                        <p className="text-zinc-400 text-sm">Manage your money containers (Bank, Cash, E-Wallet)</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">New Pocket</span>
                    </button>
                </div>

                {/* Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {isLoading ? (
                        <div className="col-span-full py-12 flex justify-center text-zinc-500">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : pockets.length === 0 ? (
                        <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                            <Wallet size={48} className="mx-auto text-zinc-600 mb-4" />
                            <h3 className="text-lg font-medium text-white">No Pockets Yet</h3>
                            <p className="text-zinc-500 text-sm mt-1 mb-6">Create a pocket to start tracking balances individually.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                            >
                                <span className="underline underline-offset-4">Create your first pocket</span>
                            </button>
                        </div>
                    ) : (
                        pockets.map((pocket) => (
                            <motion.div key={pocket.id} variants={item}>
                                <Link href={`/pockets/${pocket.id}`} className="block h-full cursor-pointer">
                                    <Card className="h-full group relative overflow-hidden border-white/5 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleDeletePocket(pocket.id, e)}
                                                className="text-zinc-600 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="absolute -right-6 -bottom-6 h-24 w-24 bg-emerald-500/10 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition-all duration-500" />

                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
                                                {pocket.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-white tracking-tight">
                                                {formatCurrency(pocket.balance)}
                                            </div>
                                            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                                                <Badge variant="outline" className="border-white/5 text-zinc-500 font-mono bg-black/20">
                                                    ID: {pocket.id.slice(-4)}
                                                </Badge>
                                                <span>•</span>
                                                <span>Updated {new Date(pocket.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-white">New Pocket</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>
                            <form onSubmit={handleCreatePocket} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Pocket Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                        placeholder="eg. BCA, Wallet, Emergency Fund"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Initial Balance (IDR)</label>
                                    <input
                                        type="text" // Text to handle formating
                                        value={formData.initialBalance}
                                        onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                                        {isSubmitting ? 'Creating...' : 'Create Pocket'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
