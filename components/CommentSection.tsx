"use client";

import { useState } from "react";
import { format } from "date-fns";
import { addComment, updateComment, deleteComment } from "@/app/actions/comments";

export interface CommentType {
    id: string;
    user_id: string | null;
    author_name: string;
    content: string;
    created_at: string;
}

interface Props {
    postId: string;
    initialComments: CommentType[];
    currentUserId: string | null;
}

export default function CommentSection({ postId, initialComments, currentUserId }: Props) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg("");
        const formData = new FormData(e.currentTarget);
        const res = await addComment(postId, formData);
        if (res?.error) setErrorMsg(res.error);
        else (e.target as HTMLFormElement).reset();
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, commentId: string) => {
        e.preventDefault();
        setErrorMsg("");
        const formData = new FormData(e.currentTarget);
        const res = await updateComment(commentId, postId, formData);
        if (res?.error) setErrorMsg(res.error);
        else setEditingId(null);
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        setErrorMsg("");
        const res = await deleteComment(commentId, postId);
        if (res?.error) setErrorMsg(res.error);
    };

    return (
        <section className="bg-[#1e2436] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6">댓글 ({initialComments.length})</h3>

            {errorMsg && <div className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg border border-red-500/20">{errorMsg}</div>}

            <div className="space-y-6 mb-10">
                {initialComments.map((comment) => (
                    <div key={comment.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="font-semibold text-white mr-3">{comment.author_name}</span>
                                <span className="text-xs text-slate-500">
                                    {format(new Date(comment.created_at), 'yyyy.MM.dd HH:mm')}
                                </span>
                            </div>
                            {/* 본인 댓글만 수정/삭제 가능 */}
                            {currentUserId && comment.user_id === currentUserId && (
                                <div className="flex gap-3 text-xs">
                                    <button type="button" onClick={() => { setEditingId(comment.id); setErrorMsg(""); }} className="text-slate-400 hover:text-blue-400 transition-colors">수정</button>
                                    <button type="button" onClick={() => handleDelete(comment.id)} className="text-slate-400 hover:text-red-400 transition-colors">삭제</button>
                                </div>
                            )}
                        </div>

                        {editingId === comment.id ? (
                            <form onSubmit={(e) => handleUpdate(e, comment.id)} className="mt-3 flex flex-col gap-3 bg-slate-800/50 p-4 rounded-xl border border-white/5">
                                <textarea name="content" defaultValue={comment.content} required rows={3} className="w-full bg-[#131722] border border-white/10 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-y" />
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors">저장</button>
                                    <button type="button" onClick={() => setEditingId(null)} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors">취소</button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {comment.content}
                            </p>
                        )}
                    </div>
                ))}
                {initialComments.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-8">아직 작성된 댓글이 없습니다. 첫 댓글을 남겨주세요!</p>
                )}
            </div>

            {/* 로그인한 사용자만 댓글 작성 가능 */}
            {currentUserId ? (
                <form onSubmit={handleAdd} className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
                    <h4 className="text-lg font-medium text-white mb-2">새 댓글 작성</h4>
                    <textarea name="content" required placeholder="건전하고 유익한 댓글을 남겨주세요." rows={4} className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-y" />
                    <div className="flex justify-end mt-2">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-3 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]">
                            댓글 등록
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                    <p className="text-slate-400 text-sm">댓글을 작성하려면 <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">로그인</a>해주세요.</p>
                </div>
            )}
        </section>
    );
}
