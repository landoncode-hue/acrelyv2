"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ContextPanelContent = React.ReactNode;

interface ContextPanelContextType {
    openPanel: (content: ContextPanelContent, title?: string) => void;
    closePanel: () => void;
    isOpen: boolean;
    content: ContextPanelContent;
    title: string | null;
}

const ContextPanelContext = React.createContext<ContextPanelContextType | undefined>(undefined);

export function ContextPanelProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [content, setContent] = React.useState<ContextPanelContent>(null);
    const [title, setTitle] = React.useState<string | null>(null);

    const openPanel = (newContent: ContextPanelContent, newTitle?: string) => {
        setContent(newContent);
        setTitle(newTitle || null);
        setIsOpen(true);
    };

    const closePanel = () => {
        setIsOpen(false);
        setTimeout(() => {
            // Clear content after animation
            setContent(null);
            setTitle(null);
        }, 300);
    };

    return (
        <ContextPanelContext.Provider value={{ openPanel, closePanel, isOpen, content, title }}>
            {children}
            <ContextPanel />
        </ContextPanelContext.Provider>
    );
}

export function useContextPanel() {
    const context = React.useContext(ContextPanelContext);
    if (context === undefined) {
        throw new Error("useContextPanel must be used within a ContextPanelProvider");
    }
    return context;
}

function ContextPanel() {
    const { isOpen, closePanel, content, title } = useContextPanel();

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && closePanel()}>
            <SheetContent className="w-[400px] sm:w-[540px] border-l border-border/50 shadow-2xl bg-background/95 backdrop-blur-sm p-0 gap-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className={cn("text-xl font-heading", !title && "hidden")}>{title}</SheetTitle>
                    <SheetDescription className="hidden">Context Panel</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-6">
                    {content}
                </div>
            </SheetContent>
        </Sheet>
    );
}
