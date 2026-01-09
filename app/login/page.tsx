"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { login } from "@/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowRight, Lock } from "lucide-react"

export default function LoginPage() {
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const res = await login(password)

        if (res.success) {
            router.push("/")
            // router.refresh() // Ensure middleware re-runs if needed, but push should trigger check
        } else {
            setError(res.error || "Something went wrong")
            setIsLoading(false)
        }
    }

    return (
        <div className="h-[100dvh] overflow-hidden flex items-center justify-center p-4 bg-black selection:bg-emerald-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-white/5 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center space-y-4 pb-2">
                        <div className="mx-auto h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <Lock size={20} className="text-emerald-400" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold tracking-tight text-white">
                                Welcome Back
                            </CardTitle>
                            <p className="text-sm text-zinc-400">
                                Enter the access PIN to continue
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <input
                                        type="password"
                                        placeholder="Enter PIN..."
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono group-hover:bg-black/60"
                                        autoFocus
                                    />
                                </div>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-rose-400 text-center font-medium"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !password}
                                className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Access Dashboard</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
