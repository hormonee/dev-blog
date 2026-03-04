"use client";

import { useState } from "react";
import { format } from "date-fns";
import { addComment, updateComment, deleteComment } from "@/app/actions/comments";
import { CornerDownRight, ChevronDown, ChevronUp } from "lucide-react";

export interface CommentType {
    id: string;
    user_id: string | null;
    author_name: string;
    content: string;
    created_at: string;
    parent_id: string | null;
}

interface Props {
    postId: string;
    initialComments: CommentType[];
    currentUserId: string | null;
}

interface ReplyFormProps {
    postId: string;
    parentId: string;
    onClose: () => void;
    onError: (msg: string) => void;
}

function ReplyForm({ postId, parentId, onClose, onError }: ReplyFormProps) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append("parent_id", parentId);
        const res = await addComment(postId, formData);
        if (res?.error) onError(res.error);
        else onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 ml-9 flex flex-col gap-2 bg-slate-900/50 p-3 rounded-xl border border-white/5">
            <textarea
                name="content"
                required
                placeholder="답글을 입력하세요..."
                rows={2}
                autoFocus
                className="w-full bg-[#131722] border border-white/10 rounded-lg p-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
            />
            <div className="flex gap-2 justify-end">
                <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 transition-colors">취소</button>
                <button type="submit" className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors">답글 등록</button>
            </div>
        </form>
    );
}

interface CommentItemProps {
    comment: CommentType;
    repliesMap: Record<string, CommentType[]>; // 전체 repliesMap 전달
    postId: string;
    currentUserId: string | null;
    onError: (msg: string) => void;
    depth?: number;
}

function CommentItem({ comment, repliesMap, postId, currentUserId, onError, depth = 0 }: CommentItemProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [showReplies, setShowReplies] = useState(true);

    // repliesMap에서 이 댓글의 대댓글 목록을 가져옴
    const replies = repliesMap[comment.id] || [];

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, commentId: string) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const res = await updateComment(commentId, postId, formData);
        if (res?.error) onError(res.error);
        else setEditingId(null);
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        const res = await deleteComment(commentId, postId);
        if (res?.error) onError(res.error);
    };

    return (
        <div className={depth > 0 ? "ml-6 border-l-2 border-blue-500/20 pl-4" : ""}>
            <div className="py-4">
                {/* 헤더 */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        {depth > 0 && <CornerDownRight className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />}
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold flex-shrink-0">
                            {(comment.author_name || "?")[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-white text-sm">{comment.author_name}</span>
                        <span className="text-xs text-slate-500">
                            {format(new Date(comment.created_at), "yyyy.MM.dd HH:mm")}
                        </span>
                    </div>
                    {currentUserId && comment.user_id === currentUserId && (
                        <div className="flex gap-3 text-xs shrink-0">
                            <button type="button" onClick={() => setEditingId(comment.id)} className="text-slate-400 hover:text-blue-400 transition-colors">수정</button>
                            <button type="button" onClick={() => handleDelete(comment.id)} className="text-slate-400 hover:text-red-400 transition-colors">삭제</button>
                        </div>
                    )}
                </div>

                {/* 본문 */}
                {editingId === comment.id ? (
                    <form onSubmit={(e) => handleUpdate(e, comment.id)} className="mt-2 flex flex-col gap-2 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                        <textarea name="content" defaultValue={comment.content} required rows={3} className="w-full bg-[#131722] border border-white/10 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 resize-y" />
                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">저장</button>
                            <button type="button" onClick={() => setEditingId(null)} className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors">취소</button>
                        </div>
                    </form>
                ) : (
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed ml-9">{comment.content}</p>
                )}

                {/* 답글/접기 버튼 */}
                <div className="ml-9 mt-2 flex items-center gap-3">
                    {currentUserId && depth < 2 && (
                        <button
                            type="button"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-xs text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                        >
                            <CornerDownRight className="h-3 w-3" />
                            {replyingTo === comment.id ? "취소" : "답글"}
                        </button>
                    )}
                    {replies.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowReplies((v) => !v)}
                            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            답글 {replies.length}개
                        </button>
                    )}
                </div>

                {/* 답글 작성 폼 */}
                {replyingTo === comment.id && (
                    <ReplyForm
                        postId={postId}
                        parentId={comment.id}
                        onClose={() => setReplyingTo(null)}
                        onError={onError}
                    />
                )}
            </div>

            {/* 대댓글 목록 — repliesMap을 그대로 전달하여 재귀적으로 조회 가능 */}
            {showReplies && replies.length > 0 && (
                <div>
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            repliesMap={repliesMap}  // ← 핵심 수정: repliesMap 전달
                            postId={postId}
                            currentUserId={currentUserId}
                            onError={onError}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CommentSection({ postId, initialComments, currentUserId }: Props) {
    const [errorMsg, setErrorMsg] = useState("");

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg("");
        const formData = new FormData(e.currentTarget);
        const res = await addComment(postId, formData);
        if (res?.error) setErrorMsg(res.error);
        else (e.target as HTMLFormElement).reset();
    };

    // 최상위 댓글과 대댓글 분리 후 repliesMap 구성
    const topLevel = initialComments.filter((c) => !c.parent_id);
    const replyList = initialComments.filter((c) => !!c.parent_id);
    const repliesMap: Record<string, CommentType[]> = {};
    for (const r of replyList) {
        if (!repliesMap[r.parent_id!]) repliesMap[r.parent_id!] = [];
        repliesMap[r.parent_id!].push(r);
    }

    const totalReplies = replyList.length;

    return (
        <section className="bg-[#1e2436] border border-white/5 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6">
                댓글 ({topLevel.length})
                {totalReplies > 0 && (
                    <span className="text-sm font-normal text-slate-400 ml-2">· 답글 {totalReplies}개</span>
                )}
            </h3>

            {errorMsg && (
                <div className="text-red-400 text-sm mb-4 bg-red-400/10 p-3 rounded-lg border border-red-500/20">
                    {errorMsg}
                </div>
            )}

            <div className="divide-y divide-white/5">
                {topLevel.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        repliesMap={repliesMap}
                        postId={postId}
                        currentUserId={currentUserId}
                        onError={setErrorMsg}
                    />
                ))}
                {topLevel.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-8">아직 작성된 댓글이 없습니다. 첫 댓글을 남겨주세요!</p>
                )}
            </div>

            {currentUserId ? (
                <form onSubmit={handleAdd} className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-4">
                    <h4 className="text-base font-semibold text-white">새 댓글 작성</h4>
                    <textarea
                        name="content"
                        required
                        placeholder="건전하고 유익한 댓글을 남겨주세요."
                        rows={4}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-y"
                    />
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-3 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]">
                            댓글 등록
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mt-8 pt-8 border-t border-white/10 text-center">
                    <p className="text-slate-400 text-sm">
                        댓글을 작성하려면 <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">로그인</a>해주세요.
                    </p>
                </div>
            )}
        </section>
    );
}
