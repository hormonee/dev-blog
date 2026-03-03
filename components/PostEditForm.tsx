"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Italic, Link as LinkIcon, Code, Quote, List, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { updatePost } from "@/app/actions/posts";

interface Category {
    id: string;
    name: string;
}

interface PostEditFormProps {
    post: {
        id: string;
        title: string;
        content: string;
        category_id: string;
    };
    categories: Category[];
}

export default function PostEditForm({ post, categories }: PostEditFormProps) {
    const [title, setTitle] = useState(post.title);
    const [categoryId, setCategoryId] = useState(post.category_id);
    const [content, setContent] = useState(post.content);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 본문을 입력해주세요.");
            return;
        }
        setIsSaving(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("category_id", categoryId);

        const res = await updatePost(post.id, formData);
        if (res?.error) {
            alert(res.error);
            setIsSaving(false);
        }
    };

    const insertText = (before: string, after: string = "") => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

        setContent(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    return (
        <div className="flex flex-col h-screen bg-[#0f1219]">
            {/* Header */}
            <header className="flex h-16 items-center justify-between border-b border-white/10 px-6 shrink-0 bg-[#0f1219]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f1219]/60">
                <div className="flex items-center gap-8">
                    <Link href={`/posts/${post.id}`} className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">DevBlog</span>
                    </Link>
                    <span className="text-sm text-slate-400 font-medium">글 수정하기</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href={`/posts/${post.id}`}
                        className="text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-white/5"
                    >
                        취소
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isSaving ? "저장 중..." : "저장"}
                    </button>
                </div>
            </header>

            {/* Split Editor */}
            <div className="flex flex-1 overflow-hidden">
                <div className="w-1/2 flex flex-col border-r border-white/10 bg-[#131722]">
                    <div className="p-6 border-b border-white/5">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title."
                            className="w-full bg-transparent text-3xl font-bold text-white placeholder-slate-600 focus:outline-none mb-4"
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 text-slate-400">
                                <button onClick={() => insertText("**", "**")} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors" title="Bold"><Bold size={16} /></button>
                                <button onClick={() => insertText("*", "*")} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors" title="Italic"><Italic size={16} /></button>
                                <div className="w-px h-5 bg-white/10 my-auto mx-1"></div>
                                <button onClick={() => insertText("[", "](url)")} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors" title="Link"><LinkIcon size={16} /></button>
                                <button onClick={() => insertText("`", "`")} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors" title="Code"><Code size={16} /></button>
                                <button onClick={() => insertText("> ")} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors" title="Quote"><Quote size={16} /></button>
                                <button onClick={() => insertText("- ")} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors" title="List"><List size={16} /></button>
                                <button onClick={() => insertText("![alt](", ")")} className="p-1.5 hover:bg-slate-800 rounded-md transition-colors" title="Image"><ImageIcon size={16} /></button>
                            </div>

                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="bg-slate-800 text-slate-300 text-xs rounded-md border border-white/10 px-2 py-1 focus:outline-none focus:border-blue-500/50"
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0f1219]/50 border-r border-white/5 py-4 flex flex-col items-center text-xs text-slate-700 font-mono pointer-events-none select-none">
                            {content.split('\n').map((_, i) => (
                                <div key={i} className="leading-6 h-6">{i + 1}</div>
                            ))}
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            spellCheck={false}
                            className="w-full h-full bg-transparent text-slate-300 font-mono text-sm pl-16 pr-4 py-4 focus:outline-none resize-none leading-6"
                        />
                    </div>
                </div>

                {/* Preview */}
                <div className="w-1/2 bg-[#1a1f2e] overflow-y-auto p-12">
                    <h1 className="text-4xl font-bold text-white mb-10 leading-tight">
                        {title || "Untitled"}
                    </h1>
                    <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-white prose-a:text-blue-400 prose-li:text-slate-300 prose-strong:text-white prose-code:text-blue-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
