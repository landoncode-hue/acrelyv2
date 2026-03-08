"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DeliveryChartProps {
    data: any[];
}

export function DeliveryChart({ data }: DeliveryChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Delivery Overview</CardTitle>
                <CardDescription>SMS vs Email delivery performance over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--popover-foreground))',
                                borderRadius: '8px'
                            }}
                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        />
                        <Bar dataKey="sms" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="SMS" />
                        <Bar dataKey="email" fill="#10b981" radius={[4, 4, 0, 0]} name="Email" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
