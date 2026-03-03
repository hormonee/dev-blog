import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import PostEditForm from "@/components/PostEditForm";

interface EditPageProps {
    params: { id: string };
}

export default async function EditPostPage({ params }: EditPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 게시글 데이터 가져오기
    const { data: post, error } = await supabase
        .from("posts")
        .select("*, category:categories(name)")
        .eq("id", id)
        .single();

    if (error || !post) {
        notFound();
    }

    // 본인 게시글만 수정 가능
    if (post.user_id !== user.id) {
        redirect(`/posts/${id}`);
    }

    // 카테고리 목록
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .order("created_at", { ascending: true });

    return <PostEditForm post={post} categories={categories || []} />;
}
