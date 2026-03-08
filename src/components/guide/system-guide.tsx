"use client";

import { useState } from "react";
import { GUIDE_CONTENT, GuideSection } from "@/lib/constants/guide-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/use-profile";

export function SystemGuide() {
    const { profile } = useProfile();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSectionId, setActiveSectionId] = useState(GUIDE_CONTENT[0].id);

    // Filter categories based on user role
    const filteredContent = GUIDE_CONTENT.filter(section =>
        !profile || section.roles.includes(profile.role)
    );

    // Filter based on search query
    const displayedContent = filteredContent.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.steps.some(step =>
            step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            step.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const activeSection = GUIDE_CONTENT.find(s => s.id === activeSectionId) || GUIDE_CONTENT[0];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Manual</h2>
                    <p className="text-muted-foreground">Learn how to operate every part of the Acrely platform.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search for a flow (e.g. 'payments')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Navigation Sidebar */}
                <div className="md:col-span-4 space-y-2">
                    {displayedContent.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSectionId(section.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                                    activeSectionId === section.id
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{section.title}</p>
                                    <p className={cn(
                                        "text-xs truncate",
                                        activeSectionId === section.id ? "text-primary-foreground/80" : "text-muted-foreground"
                                    )}>
                                        {section.description}
                                    </p>
                                </div>
                                <ChevronRight className={cn("h-4 w-4", activeSectionId === section.id ? "opacity-100" : "opacity-0")} />
                            </button>
                        );
                    })}

                    {displayedContent.length === 0 && (
                        <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
                            No matching guides found.
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="md:col-span-8 flex flex-col gap-4">
                    <Card className="border-2">
                        <CardHeader className="bg-muted/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <activeSection.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{activeSection.title}</CardTitle>
                                    <CardDescription>{activeSection.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {activeSection.videoUrl && (
                                <div className="mb-8 rounded-xl overflow-hidden border-2 border-primary/20 bg-black aspect-video relative group shadow-2xl">
                                    <video
                                        key={activeSection.videoUrl}
                                        controls
                                        className="w-full h-full object-cover"
                                        poster="/header-background.jpg"
                                    >
                                        <source src={activeSection.videoUrl} type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        Demo Recording
                                    </div>
                                </div>
                            )}

                            <div className="space-y-8">
                                {activeSection.steps.map((step, idx) => (
                                    <div key={idx} className="relative pl-10">
                                        {/* Step Number Bubble */}
                                        <div className="absolute left-0 top-0 h-7 w-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold">
                                            {idx + 1}
                                        </div>

                                        {/* Connecting Line */}
                                        {idx !== activeSection.steps.length - 1 && (
                                            <div className="absolute left-3.5 top-8 w-px h-[calc(100%+8px)] bg-border" />
                                        )}

                                        <div className="space-y-1">
                                            <h4 className="font-bold text-foreground">{step.title}</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pro Tip Box */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900">Need more help?</p>
                            <p className="text-xs text-blue-700 mt-0.5">
                                If you cannot find the answer here, please reach out to your system administrator or open a support ticket.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
