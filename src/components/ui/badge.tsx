import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
                outline: "text-foreground",

                // Untitled UI Style - Modern/Subtle
                success: "border-transparent bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-inset ring-green-600/20",
                warning: "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-inset ring-amber-600/20",
                info: "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-inset ring-blue-700/10",

                // Status Mappings
                available: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
                allocated: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10",
                reserved: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
