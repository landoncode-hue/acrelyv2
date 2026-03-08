"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-8 rounded-xl border border-zinc-200 shadow-sm max-w-md w-full flex flex-col items-center">
                <div className="bg-zinc-100 p-4 rounded-full mb-6">
                    <WifiOff className="h-8 w-8 text-zinc-500" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">You are offline</h1>
                <p className="text-zinc-500 mb-8">
                    It seems you've lost your internet connection.
                    Check your settings and try again to access Acrely.
                </p>
                <Button onClick={() => window.location.reload()} className="w-full">
                    Try Again
                </Button>
            </div>
        </div>
    );
}
