import { Badge } from "@/components/ui/badge";
import {
    Instagram,
    Facebook,
    Twitter,
    Users,
    Radio,
    MapPin,
    MessageCircle,
    MoreHorizontal
} from "lucide-react";

interface LeadSourceBadgeProps {
    source: string;
    className?: string;
}

const sourceConfig: Record<string, {
    icon: React.ReactNode;
    className: string;
}> = {
    Instagram: {
        icon: <Instagram className="h-3 w-3" />,
        className: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20"
    },
    Facebook: {
        icon: <Facebook className="h-3 w-3" />,
        className: "bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20"
    },
    Twitter: {
        icon: <Twitter className="h-3 w-3" />,
        className: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
    },
    Referral: {
        icon: <Users className="h-3 w-3" />,
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
    },
    "Walk-in": {
        icon: <MapPin className="h-3 w-3" />,
        className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
    },
    Radio: {
        icon: <Radio className="h-3 w-3" />,
        className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20"
    },
    Billboard: {
        icon: <MapPin className="h-3 w-3" />,
        className: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20"
    },
    WhatsApp: {
        icon: <MessageCircle className="h-3 w-3" />,
        className: "bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20"
    },
    Other: {
        icon: <MoreHorizontal className="h-3 w-3" />,
        className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
    }
};

export function LeadSourceBadge({ source, className = "" }: LeadSourceBadgeProps) {
    const config = sourceConfig[source] || sourceConfig.Other;

    return (
        <Badge
            variant="outline"
            className={`flex items-center gap-1.5 ${config.className} ${className}`}
        >
            {config.icon}
            <span>{source}</span>
        </Badge>
    );
}
