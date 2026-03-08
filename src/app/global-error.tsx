"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error("Global Error Caught:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center space-y-6 p-4">
                    <img src="/logo.svg" alt="Acrely" className="h-12" />
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">Something went wrong!</h2>
                        <p className="text-muted-foreground max-w-md">
                            A critical error occurred. Please try again or contact support if the problem persists.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => reset()}>Try again</Button>
                        <Button variant="outline" asChild>
                            <Link href="/portal/help">Contact Support</Link>
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    );
}
