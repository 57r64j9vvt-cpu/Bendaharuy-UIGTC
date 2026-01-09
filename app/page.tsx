
"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/others"
import { getDashboardMetrics } from "@/actions/dashboard"
import { getSucDetails, markAsPaid, getSucProgress, getLatestEventId } from "@/actions/suc"
import { getFinancialChartData, createTransaction, getRecentTransactions, getAllTransactions } from "@/actions/transaction"
import { FinancialChart } from "@/components/FinancialChart"
import { Plus, X, Loader2, Check } from "lucide-react"

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export default function Dashboard() {
    const [metrics, setMetrics] = useState({ totalBalance: 0, totalIncome: 0, totalExpense: 0 })
    const [sucProgress, setSucProgress] = useState({ percentage: 0, total: 0, paid: 0 })

    // Using 'any' for sucRecords to avoid complex type matching in client for now. 
    // Ideally import type from Prisma client.
    const [sucRecords, setSucRecords] = useState<any[]>([])
    const [chartData, setChartData] = useState<{ date: string; income: number; expense: number }[]>([])
    const [recentTransactions, setRecentTransactions] = useState<any[]>([])
    const [allTransactions, setAllTransactions] = useState<any[]>([])

    const [refreshKey, setRefreshKey] = useState(0)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        type: 'INCOME' as 'INCOME' | 'EXPENSE',
        category: 'General'
    })

    // We need an Event ID to fetch SUC. Real app would select period.
    // We'll try to find one dynamically or just assume empty if none.
    // For functionality, user needs to seed/create event in DB.
    // Here we'll just try to fetch assuming the backend handles validation.
    // Wait, getSucDetails NEEDS an ID.
    // Strategy: In this demo, we might not have an Event ID.
    // We'll skip SUC fetch if we don't know the ID, OR we hardcode a known ID if we had one?
    // Better: Create an action to `getCurrentEvent`? 
    // For now, let's leave SUC records empty if no ID, but UI will show "No Event Active".
    // Actually, let's omit the SUC fetch logic or make it safe.
    const [currentEventId, setCurrentEventId] = useState<string | null>(null)

    useEffect(() => {
        getDashboardMetrics().then(res => {
            if (res.success && 'data' in res) setMetrics(res.data)
        })

        getFinancialChartData().then(res => {
            if (res.success && 'data' in res) setChartData(res.data)
        })

        // Fetch Latest SUC Event and Data
        getLatestEventId().then(res => {
            if (res.success && 'id' in res && res.id) {
                setCurrentEventId(res.id)
                // Fetch progress
                getSucProgress(res.id).then(prog => {
                    if (prog.success && 'percentage' in prog && prog.percentage !== undefined) {
                        setSucProgress({
                            percentage: prog.percentage,
                            total: prog.total || 0,
                            paid: prog.paid || 0
                        })
                    }
                })
                // Fetch details
                getSucDetails(res.id).then(det => {
                    if (det.success && 'data' in det) setSucRecords(det.data)
                })
            }
        })

        getRecentTransactions().then(res => {
            if (res.success && 'data' in res) setRecentTransactions(res.data)
        })

        getAllTransactions().then(res => {
            if (res.success && 'data' in res) setAllTransactions(res.data)
        })

    }, [refreshKey])

    const handleCreateTransaction = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const amount = parseInt(formData.amount.replace(/\D/g, '')) || 0

        await createTransaction({
            amount,
            type: formData.type,
            description: formData.description,
            category: formData.category
        })

        setIsSubmitting(false)
        setIsModalOpen(false)
        setFormData({ amount: '', description: '', type: 'INCOME', category: 'General' })
        setRefreshKey(prev => prev + 1) // Refresh dashboard
    }

    const handleMarkAsPaid = async (memberId: string, eventId: string) => {
        // Optimistic update or just wait for refresh? User wants "Auto".
        // Let's call server action then refresh.
        const res = await markAsPaid(memberId, eventId)
        if (res.success) {
            setRefreshKey(prev => prev + 1) // Triggers re-fetch of metrics, chart, and recent activity
        } else {
            alert("Failed to update status")
        }
    }

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 30, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 50 }
        }
    }

    // Helper for Division Colors
    const getDivisionColor = (div: string) => {
        const map: any = {
            'PI': 'text-amber-400 border-amber-500/20 bg-amber-500/10',
            'Event': 'text-blue-400 border-blue-500/20 bg-blue-500/10',
            'Roadshow': 'text-red-400 border-red-500/20 bg-red-500/10',
            'Fundraising': 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
            'HR': 'text-rose-400 border-rose-500/20 bg-rose-500/10',
            'Marketing': 'text-purple-400 border-purple-500/20 bg-purple-500/10',
            'Operational': 'text-orange-400 border-orange-500/20 bg-orange-500/10',
            'VCD': 'text-violet-400 border-violet-500/20 bg-violet-500/10',
            'Sponsorship': 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
            'External': 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10'
        }
        return map[div] || 'text-zinc-400 border-zinc-800 bg-zinc-900/40' // Fallback for General
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 relative">
            {/* Header */}
            <div className="flex items-end justify-between pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">
                        Bendaharuy<span className="text-emerald-500">.</span>
                    </h1>
                    <p className="text-zinc-400">
                        El Bendaharuy
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="hidden md:block">
                        <Badge variant="outline" className="px-4 py-1 text-zinc-500 border-zinc-800">
                            {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                        </Badge>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-zinc-100 text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Cashflow</span>
                    </button>
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {/* Metric Cards - Minimalist but Animated */}
                {[
                    { title: "Total Balance", value: metrics.totalBalance, color: "text-white" },
                    { title: "Total Income", value: metrics.totalIncome, color: "text-emerald-400" },
                    { title: "Total Expense", value: metrics.totalExpense, color: "text-rose-400" },
                ].map((stat, i) => (
                    <motion.div key={i} variants={item} whileHover={{ y: -5, transition: { duration: 0.3 } }}>
                        <Card className="h-full relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 h-32 w-32 bg-white/5 blur-3xl rounded-full group-hover:bg-white/10 transition-colors duration-500" />

                            <CardHeader className="pb-2 relative z-10">
                                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{stat.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className={`text-3xl font-bold tracking-tight ${stat.color} `}>
                                    {formatCurrency(stat.value)}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {/* Financial Chart */}
                <motion.div variants={item} className="md:col-span-3">
                    <FinancialChart data={chartData.length > 0 ? chartData : [{ date: 'No Data', income: 0, expense: 0 }]} />
                </motion.div>

                {/* SUC Tracker Section */}
                <motion.div variants={item} className="md:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">SUC Tracker</h2>
                        <Badge variant="outline" className="border-white/10 text-zinc-400">Januari 2024</Badge>
                    </div>

                    {/* Progress Summary */}
                    <Card className="border-white/5 bg-zinc-900/30">
                        <CardContent className="py-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Total Collection Progress ({(sucProgress.percentage || 0).toFixed(0)}%)</span>
                                    <span className="text-white font-mono">{formatCurrency(sucProgress.paid)} / {formatCurrency(sucProgress.total)}</span>
                                </div>
                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-900">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${sucProgress.percentage}% ` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Division Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sucRecords.length === 0 ? (
                            <div className="col-span-full text-zinc-500 text-sm italic py-8 text-center border border-dashed border-zinc-800 rounded-xl">
                                Loading data... (If stuck, restart server)
                            </div>
                        ) : (
                            Object.entries(sucRecords.reduce((acc: any, record: any) => {
                                const div = record.member.division || 'General'
                                if (!acc[div]) acc[div] = []
                                acc[div].push(record)
                                return acc
                            }, {})).map(([division, records]: [string, any]) => {
                                const colorClass = getDivisionColor(division)
                                const borderColor = colorClass.split(' ')[1] // Extract border class

                                return (
                                    <Card key={division} className={`h-full border bg-black/40 backdrop-blur-sm transition-all hover:border-opacity-50 ${borderColor}`}>
                                        <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
                                            <CardTitle className={`text-sm font-bold uppercase tracking-widest ${colorClass.split(' ')[0]}`}>{division}</CardTitle>
                                            <Badge variant="outline" className="text-[10px] border-white/10">{records.length}</Badge>
                                        </CardHeader>
                                        <CardContent className="pt-4 grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {records.map((record: any) => (
                                                <div key={record.id} className={`flex items-center justify-between p-2 rounded-lg border transition-all hover:scale-[1.02] ${record.status === 'PAID' ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-zinc-900/30 border-white/5'} `}>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-bold leading-none mb-1 ${record.status === 'PAID' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                                            {record.member.name}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500 font-mono">
                                                            {formatCurrency(record.billedAmount || 0)}
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            if (record.status !== 'PAID') {
                                                                if (currentEventId) {
                                                                    handleMarkAsPaid(record.member.id, currentEventId)
                                                                }
                                                            }
                                                        }}
                                                        disabled={record.status === 'PAID'}
                                                        className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${record.status === 'PAID' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] cursor-default' : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-600 cursor-pointer'} `}
                                                    >
                                                        {record.status === 'PAID' && <Check size={14} className="text-black" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </motion.div>

                {/* Recent Transactions - Moved to bottom grid or separate */}
                <motion.div variants={item} className="md:col-span-3">
                    <Card className="h-full border-white/5">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recentTransactions.length === 0 ? (
                                    <div className="col-span-full text-zinc-500 text-sm italic py-4 text-center">No recent activity</div>
                                ) : (
                                    recentTransactions.map((tx: any) => (
                                        <div key={tx.id} className="flex items-end justify-between group p-3 rounded-xl bg-zinc-900/30 border border-white/5 hover:bg-white/5 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border transition-colors ${tx.type === 'INCOME' ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-500' : 'bg-rose-950/30 border-rose-500/20 text-rose-500'} `}>
                                                    {tx.type === 'INCOME' ? <Plus size={16} /> : <X size={16} className="rotate-45" />}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-medium text-zinc-200">{tx.description}</p>
                                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-mono ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'} `}>
                                                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* All Transactions History */}
                <motion.div variants={item} className="md:col-span-3">
                    <Card className="h-full border-white/5 bg-zinc-900/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Transaction History</CardTitle>
                            <Badge variant="outline" className="border-white/10 text-zinc-400">
                                {allTransactions.length} Total
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-zinc-500 uppercase bg-white/5">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Date</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-zinc-500 italic">
                                                    No transactions found
                                                </td>
                                            </tr>
                                        ) : (
                                            allTransactions.map((tx: any) => (
                                                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-zinc-400">
                                                        {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-zinc-200">
                                                        {tx.description}
                                                    </td>
                                                    <td className="px-4 py-3 text-zinc-400">
                                                        <Badge variant="outline" className="border-white/10 text-xs font-normal bg-transparent">
                                                            {tx.category}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} `}>
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-mono font-medium ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'} `}>
                                                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Add Transaction Modal */}
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
                                <h2 className="text-lg font-semibold text-white">Add Cashflow</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                                            className={`py-2 rounded-lg text-sm font-medium border transition-colors ${formData.type === 'INCOME' ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'} `}
                                        >
                                            Income
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                                            className={`py-2 rounded-lg text-sm font-medium border transition-colors ${formData.type === 'EXPENSE' ? 'bg-rose-950 border-rose-500/50 text-rose-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'} `}
                                        >
                                            Expense
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Amount (IDR)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                                        placeholder="eg. 50000"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                                        placeholder="eg. Office Supplies"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                                        placeholder="eg. General"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mt-4"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                    {isSubmitting ? 'Saving...' : 'Save Transaction'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    )
}

