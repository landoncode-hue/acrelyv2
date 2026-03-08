"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/use-profile";
import {
    deleteAllocationAction,
    deleteCustomerAction,
    deleteLeadAction,
    deletePaymentAction
} from "@/lib/actions/delete-actions";

interface AdminDeleteButtonProps {
    table: "allocations" | "payments" | "customers" | "leads";
    itemId: string;
    resourceName: string; // e.g., "Allocation #123"
    redirectUrl?: string; // Where to go after delete
    onSuccess?: () => void; // Callback if not redirecting
    className?: string; // Extra styles
}

export function AdminDeleteButton({
    table,
    itemId,
    resourceName,
    redirectUrl,
    onSuccess,
    className
}: AdminDeleteButtonProps) {
    const { profile, loading } = useProfile();
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    // Only show for Sysadmin, CEO, MD, or Frontdesk
    if (loading) return null;
    if (!profile || !["sysadmin", "ceo", "md", "frontdesk"].includes(profile.role)) {
        return null;
    }

    const handleDelete = async () => {
        setDeleting(true);
        try {
            let result;

            switch (table) {
                case 'customers':
                    result = await deleteCustomerAction(itemId);
                    break;
                case 'allocations':
                    result = await deleteAllocationAction(itemId);
                    break;
                case 'payments':
                    result = await deletePaymentAction(itemId);
                    break;
                case 'leads':
                    result = await deleteLeadAction(itemId);
                    break;
                default:
                    throw new Error(`Unsupported resource type: ${table}`);
            }

            if (!result || !result.success) {
                const errorMessage = typeof result?.error === 'string'
                    ? result.error
                    : (result?.error as any)?.message || "Deletion failed. Please try again.";
                throw new Error(errorMessage);
            }

            toast.success(`${resourceName} deleted successfully`);

            if (onSuccess) {
                onSuccess();
            }

            if (redirectUrl) {
                router.push(redirectUrl);
            } else {
                router.refresh();
            }

        } catch (error: any) {
            console.error("Delete error:", error);
            const msg = error.message || "Failed to delete item";
            if (msg.includes("foreign key constraint")) {
                toast.error(`Cannot delete ${resourceName}: It has dependent records.`);
            } else {
                toast.error(msg);
            }
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`text-destructive hover:text-destructive/90 hover:bg-destructive/10 ${className}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        <span className="font-semibold text-foreground"> {resourceName} </span>
                        and remove all associated data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
