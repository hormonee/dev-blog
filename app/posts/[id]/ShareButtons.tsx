"use client";

import { useState } from "react";
import { Share, Bookmark, Check } from "lucide-react";

export default function ShareButtons() {
    const [copied, setCopied] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy URL:", err);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={handleShare}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors"
                aria-label="Share article"
                title="Copy URL"
            >
                {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                    <Share className="h-4 w-4 text-slate-300 group-hover:text-white" />
                )}
            </button>
            <button
                onClick={() => setBookmarked(!bookmarked)}
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700 transition-colors"
                aria-label="Bookmark article"
                title="Bookmark"
            >
                <Bookmark className={`h-4 w-4 transition-colors ${bookmarked ? 'text-blue-400 fill-blue-400' : 'text-slate-300 group-hover:text-white'}`} />
            </button>
        </div>
    );
}
