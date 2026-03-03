"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Post } from "./Hero";

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <Link href={`/posts/${post.id}`} className="group flex flex-col overflow-hidden rounded-2xl bg-[#1e2436] border border-white/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-white/10">
            <div className="relative h-48 w-full overflow-hidden bg-slate-800 flex-shrink-0">
                {post.image_url ? (
                    <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800" />
                )}
                {post.category?.name && (
                    <div className="absolute left-4 top-4">
                        <span className="rounded bg-black/50 backdrop-blur-md px-2 py-1 text-xs font-semibold text-white">
                            {post.category.name}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span>{post.created_at ? format(new Date(post.created_at), 'MMM dd, yyyy') : ''}</span>
                    <span className="font-semibold text-slate-300">{post.category?.name || 'Uncategorized'}</span>
                </div>

                <h3 className="mb-2 text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                </h3>

                <p className="mb-6 flex-1 text-sm text-slate-400 leading-relaxed line-clamp-3">
                    {post.content
                        .replace(/^#{1,6}\s+/gm, '')
                        .replace(/(\*\*|__)(.*?)\1/g, '$2')
                        .replace(/(\*|_)(.*?)\1/g, '$2')
                        .replace(/`{1,3}[^`]*`{1,3}/g, '')
                        .replace(/^\s*[-*+]\s+/gm, '')
                        .replace(/^\s*>\s+/gm, '')
                        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
                        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
                        .trim()
                    }
                </p>
            </div>
        </Link>
    );
}
