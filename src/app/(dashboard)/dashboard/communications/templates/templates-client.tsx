"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";
import { updateTemplateAction } from "@/lib/actions/communication-actions";
import { useRouter } from "next/navigation";

type Template = {
    id: string;
    name: string;
    type: string;
    body: string;
    subject?: string;
};

interface TemplatesClientProps {
    initialTemplates: Template[];
}

export default function TemplatesClient({ initialTemplates }: TemplatesClientProps) {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    const handleSave = async () => {
        if (!editingTemplate) return;

        const result = await updateTemplateAction({
            id: editingTemplate.id,
            subject: editingTemplate.subject,
            body: editingTemplate.body
        });

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Template updated successfully");
            setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, body: editingTemplate.body, subject: editingTemplate.subject } : t));
            setEditingTemplate(null);
        }
    };

    const grouped = templates.reduce((acc, t) => {
        acc[t.type] = acc[t.type] || [];
        acc[t.type].push(t);
        return acc;
    }, {} as Record<string, Template[]>);

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="space-y-4">
                    <h3 className="text-xl font-semibold capitalize flex items-center gap-2">
                        {type} Templates
                        <Badge variant="secondary">{items.length}</Badge>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((template) => (
                            <Card key={template.id} className="group relative hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base truncate pr-6">{template.name}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute top-4 right-4"
                                            onClick={() => setEditingTemplate(template)}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    {template.subject && <CardDescription className="truncate text-xs">Sub: {template.subject}</CardDescription>}
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 font-mono text-xs bg-muted p-2 rounded">
                                        {template.body}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
                        <DialogDescription>
                            Use variables like {'{{customer_name}}'} to dynamically insert data.
                        </DialogDescription>
                    </DialogHeader>
                    {editingTemplate && (
                        <div className="space-y-4 py-4">
                            {editingTemplate.subject !== undefined && ( // Only show subject if it exists (e.g. email)
                                <div className="space-y-2">
                                    <Label>Subject Line</Label>
                                    <Input
                                        value={editingTemplate.subject || ''}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Message Body</Label>
                                <Textarea
                                    className="min-h-[200px] font-mono text-sm"
                                    value={editingTemplate.body}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
