"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

export interface Post {
    id: string;
    title: string;
    content: string;
    image_url: string;
    created_at: string;
    category?: {
        name: string;
    };
}

interface HeroProps {
    post: Post | null;
}

export default function Hero({ post }: HeroProps) {
    if (!post) return null;

    return (
        <div className="relative mt-12 w-full overflow-hidden rounded-3xl bg-[#151c2f] border border-white/5 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="p-10 lg:p-14 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                        {post.category?.name && (
                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                                {post.category.name}
                            </span>
                        )}
                        <span className="text-sm text-slate-400">
                            {post.created_at ? format(new Date(post.created_at), 'MMM dd, yyyy') : ''}
                        </span>
                    </div>
                    <h2 className="mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                        {post.title}
                    </h2>
                    <p className="mb-8 text-lg text-slate-300 leading-relaxed max-w-lg line-clamp-3">
                        {post.content}
                    </p>

                    <div className="flex items-center justify-between">
                        <Link href={`/posts/${post.id}`} className="group flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-blue-400">
                            Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                <div className="relative h-[300px] md:h-full min-h-[400px] w-full hidden md:block flex-shrink-0">
                    {post.image_url ? (
                        <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            className="object-cover object-center"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 bg-slate-800" />
                    )}
                    {/* subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#151c2f] via-transparent to-transparent opacity-80" />
                </div>
            </div>
        </div>
    );
}
