"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert } from "lucide-react";

// Hardcoded permission matrix based on RLS policies and middleware
// Ideally this would come from a DB table if using dynamic RBAC
const PERMISSIONS_MATRIX = [
    {
        resource: "Dashboard Access",
        admin: true,
        staff: true,
        agent: true,
        customer: false,
    },
    {
        resource: "Manage Staff",
        admin: true,
        staff: false,
        agent: false,
        customer: false,
    },
    {
        resource: "Manage Agents",
        admin: true,
        staff: true,
        agent: false,
        customer: false,
    },
    {
        resource: "View Reports",
        admin: true,
        staff: true,
        agent: false,
        customer: false,
    },
    {
        resource: "Edit Payments",
        admin: true,
        staff: false, // Usually restricted
        agent: false,
        customer: false,
    },
    {
        resource: "Approve Allocations",
        admin: true,
        staff: true,
        agent: false,
        customer: false,
    },
    {
        resource: "Delete Records",
        admin: true,
        staff: false,
        agent: false,
        customer: false,
    },
    {
        resource: "System Settings",
        admin: true,
        staff: false,
        agent: false,
        customer: false,
    }
];

export default function PermissionsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Permissions Reference"
                description="Overview of role-based access control (RBAC) policies."
            />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                            Role Capabilities
                        </CardTitle>
                        <CardDescription>
                            Current matrix of what each role can access in the system.
                            These rules are enforced by Row Level Security (RLS) in the database and Next.js Middleware.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Resource / Action</TableHead>
                                    <TableHead className="text-center">Admin (CEO/MD)</TableHead>
                                    <TableHead className="text-center">Staff</TableHead>
                                    <TableHead className="text-center">Agent</TableHead>
                                    <TableHead className="text-center">Customer</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {PERMISSIONS_MATRIX.map((row, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{row.resource}</TableCell>
                                        <TableCell className="text-center">
                                            {row.admin ?
                                                <Check className="mx-auto h-4 w-4 text-green-600" /> :
                                                <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                                            }
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.staff ?
                                                <Check className="mx-auto h-4 w-4 text-green-600" /> :
                                                <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                                            }
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.agent ?
                                                <Check className="mx-auto h-4 w-4 text-green-600" /> :
                                                <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                                            }
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.customer ?
                                                <Check className="mx-auto h-4 w-4 text-green-600" /> :
                                                <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Descriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <Badge>Admin</Badge>
                                    <span>System Administrator / CEO</span>
                                </div>
                                <p className="text-sm text-muted-foreground pl-1">Full access to all system resources, including sensitive financial data, system configuration, and data deletion.</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <Badge variant="secondary">Staff</Badge>
                                    <span>Operations Staff</span>
                                </div>
                                <p className="text-sm text-muted-foreground pl-1">Day-to-day operations: Managing customers, recording payments, and processing allocations. Cannot delete critical records.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Access Control Implementation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                <strong className="text-foreground">Authentication:</strong> Acrely Custom JWT Auth.
                            </p>
                            <p>
                                <strong className="text-foreground">Authorization:</strong>
                                <br />
                                1. <strong>Middleware:</strong> Helper function strictly routes <code>/dashboard</code> vs <code>/portal</code> request based on user claim.
                                <br />
                                2. <strong>Row Level Security (RLS):</strong> Database policies ensure users can only query/mutate data they are explicitly allowed to access.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
