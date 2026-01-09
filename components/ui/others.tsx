import * as React from "react"
import { cn } from "@/lib/utils"

// --- Badge Component ---
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "success" | "destructive" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
        success: "border-transparent bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50",
        destructive: "border-transparent bg-rose-900/30 text-rose-400 hover:bg-rose-900/50",
        outline: "text-zinc-400 border-zinc-700",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

// --- Progress Component ---
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative h-2 w-full overflow-hidden rounded-full bg-zinc-800",
                className
            )}
            {...props}
        >
            <div
                className="h-full w-full flex-1 bg-zinc-50 transition-all"
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </div>
    )
)
Progress.displayName = "Progress"

export { Progress }
