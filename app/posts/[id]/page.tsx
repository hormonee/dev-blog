import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ShareButtons from "./ShareButtons";
import PostActions from "./PostActions";
import PostCard from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";



interface PostDetailPageProps {
    params: {
        id: string;
    }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
    // URL을 통해 넘겨받은 {id} 값을 사용
    const { id } = await params;

    // Supabase 서버 클라이언트를 이용해 데이터 조회
    const supabase = await createClient();
    const { data: post, error } = await supabase
        .from("posts")
        .select("*, category:categories(name)")
        .eq("id", id)
        .single();

    if (error || !post) {
        notFound();
    }

    // post.nickname이 없으면 (마이그레이션 전 게시글) profiles 테이블에서 닉네임을 조회
    let authorNickname = post.nickname;
    if (!authorNickname && post.user_id) {
        const { data: authorProfile } = await supabase
            .from("profiles")
            .select("nickname")
            .eq("id", post.user_id)
            .single();
        authorNickname = authorProfile?.nickname || null;
    }

    // 전체 포스트 ID를 생성일과 ID 기준 내림차순(최신순)으로 조회하여 정렬 순서를 확보합니다.
    // (시드 데이터처럼 created_at이 완전히 동일한 경우를 대비해 id 정렬 추가)
    const { data: allPosts } = await supabase
        .from("posts")
        .select("id")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });

    let relatedPosts: any[] = [];
    if (allPosts && allPosts.length > 0) {
        const currentIndex = allPosts.findIndex(p => p.id === id);

        if (currentIndex !== -1) {
            const relatedIds = [];

            // 이전 글 (최신 방향): 인덱스가 더 작은 것들
            if (currentIndex > 0) relatedIds.push(allPosts[currentIndex - 1].id);
            if (currentIndex > 1) relatedIds.push(allPosts[currentIndex - 2].id);

            // 다음 글 (과거 방향): 인덱스가 더 큰 것들
            if (currentIndex < allPosts.length - 1) relatedIds.push(allPosts[currentIndex + 1].id);
            if (currentIndex < allPosts.length - 2) relatedIds.push(allPosts[currentIndex + 2].id);

            // 해당 ID들을 가진 포스트 상세 정보 조회
            if (relatedIds.length > 0) {
                const { data } = await supabase
                    .from("posts")
                    .select("*, category:categories(name)")
                    .in("id", relatedIds);

                // 원래 원했던 정렬 순서(최신순 -> 과거순)대로 다시 정렬
                if (data) {
                    relatedPosts = relatedIds.map(rId => data.find(d => d.id === rId)).filter(Boolean);
                }
            }
        }
    }

    // 현재 로그인 유저 확인
    const { data: { user } } = await supabase.auth.getUser();

    // 작성된 댓글 조회 (과거순 정렬, parent_id 포함)
    const { data: comments } = await supabase
        .from("comments")
        .select("id, user_id, author_name, content, created_at, parent_id")
        .eq("post_id", id)
        .order("created_at", { ascending: true });

    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 mt-8">
            <div className="flex items-center justify-between mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>
                {user && (
                    <div className="flex items-center gap-3">
                        {user.id === post.user_id && (
                            <PostActions postId={id} />
                        )}
                        <Link
                            href="/write"
                            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            ✏️ 글쓰기
                        </Link>
                    </div>
                )}
            </div>

            <article>
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        {post.category?.name && (
                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 uppercase tracking-wider">
                                {post.category.name}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-8">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between border-b border-white/10 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 ring-2 ring-slate-800 text-blue-400 font-bold text-lg">
                                {(authorNickname || '?')[0].toUpperCase()}
                            </div>
                            <div>
                                <div className="font-semibold text-white text-base">
                                    {authorNickname || '익명'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5">
                                    <span>{post.created_at ? format(new Date(post.created_at), 'MMM dd, yyyy') : ''}</span>
                                </div>
                            </div>
                        </div>

                        <ShareButtons />
                    </div>
                </header>

                {post.image_url && (
                    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-12 bg-slate-800 border border-white/5">
                        <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-headings:text-white prose-headings:font-bold prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-xl prose-li:text-slate-300 prose-strong:text-white prose-code:text-blue-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>
            </article>

            {/* 댓글 영역 */}
            <div className="mt-16">
                <CommentSection postId={id} initialComments={comments || []} currentUserId={user?.id || null} />
            </div>

            {relatedPosts.length > 0 && (
                <div className="mt-20 pt-10 border-t border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-8">추가로 읽어볼 만한 글</h2>
                    <div className="grid gap-8 sm:grid-cols-2">
                        {relatedPosts.map((relatedPost) => (
                            <PostCard key={relatedPost.id} post={relatedPost} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
