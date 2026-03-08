"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface TermiiBalanceCardProps {
    initialBalance: number;
}

export function TermiiBalanceCard({ initialBalance }: TermiiBalanceCardProps) {
    const [balance, setBalance] = useState(initialBalance);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchTermiiBalance = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/integrations/termii/balance');
            const data = await res.json();

            setBalance(Number(data.balance) || 0);
            toast.success("Balance updated successfully");
        } catch (error) {
            console.error("Error refreshing balance:", error);
            toast.error("Failed to refresh balance");
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Termii Balance</CardTitle>
                <Battery className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-primary">₦ {balance.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-1">
                    Approx. {Math.floor(balance / 4)} SMS units left.
                </p>

                <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs border border-border/50">
                    <p className="font-medium mb-1">Top-up Account:</p>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sterling Bank</span>
                        <span className="font-mono font-bold select-all">5292721605</span>
                    </div>
                </div>

                <Button
                    className="w-full mt-4"
                    size="sm"
                    onClick={fetchTermiiBalance}
                    disabled={isRefreshing}
                >
                    {isRefreshing ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Balance
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
