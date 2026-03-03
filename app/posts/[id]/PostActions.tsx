"use client";

import { deletePost } from "@/app/actions/posts";

export default function PostActions({ postId }: { postId: string }) {
    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
        const res = await deletePost(postId);
        if (res?.error) {
            alert(res.error);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <a
                href={`/posts/${postId}/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 border border-white/5"
            >
                ✏️ 수정
            </a>
            <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-900/30 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-900/50 border border-red-500/20"
            >
                🗑️ 삭제
            </button>
        </div>
    );
}
