import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    backHref?: string;
}

export function PageHeader({
    title,
    description,
    actions,
    backHref,
    className,
    ...props
}: PageHeaderProps) {
    return (
        <div className={cn("relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 md:p-8 rounded-xl overflow-hidden shadow-sm", className)} {...props}>
            {/* Background Image & Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/header-background.jpg')" }}
            />
            <div className="absolute inset-0 z-0 bg-black/20" />

            {/* Content */}
            <div className="relative z-10 space-y-1.5">
                <div className="flex items-center gap-2">
                    {backHref && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:text-white/80 hover:bg-white/20 -ml-2" asChild>
                            <Link href={backHref}>
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                    )}
                    <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
                </div>
                {description && (
                    <p className="text-white/80 text-sm xl:text-base">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="relative z-10 flex items-center gap-2 [&_button]:!bg-white [&_button]:!text-black [&_a]:!bg-white [&_a]:!text-black hover:[&_button]:opacity-90 hover:[&_a]:opacity-90 [&_button]:border-none [&_a]:border-none [&_svg]:!text-black transition-all">
                    {actions}
                </div>
            )}
        </div>
    );
}
