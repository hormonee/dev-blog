"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * 프로필에서 닉네임을 가져오는 헬퍼 함수.
 * 프로필이 없는 기존 유저(마이그레이션 전 가입)는 null을 반환합니다.
 */
async function getNickname(supabase: any, userId: string, userEmail?: string): Promise<string> {
    const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .single();
    return profile?.nickname || userEmail?.split("@")[0] || "익명";
}

export async function publishPost(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "글을 작성하려면 로그인해주세요." };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category_id = formData.get("category_id") as string;

    if (!title || !content || !category_id) {
        return { error: "제목, 본문, 카테고리는 필수 입력 항목입니다." };
    }

    const nickname = await getNickname(supabase, user.id, user.email);

    const randomSeed = Math.random().toString(36).substring(7);
    const image_url = `https://picsum.photos/seed/${randomSeed}/800/600`;

    const { data: newPost, error } = await supabase.from("posts").insert({
        title,
        content,
        category_id,
        image_url,
        user_id: user.id,
        nickname
    }).select().single();

    if (error || !newPost) {
        return { error: error?.message || "게시물 등록에 실패했습니다." };
    }

    revalidatePath("/");
    redirect(`/posts/${newPost.id}`);
}

export async function updatePost(postId: string, formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "로그인이 필요합니다." };
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category_id = formData.get("category_id") as string;

    if (!title || !content || !category_id) {
        return { error: "제목, 본문, 카테고리는 필수 입력 항목입니다." };
    }

    const nickname = await getNickname(supabase, user.id, user.email);

    // RLS가 user_id 검증 → 본인 게시글만 수정 가능
    const { error } = await supabase
        .from("posts")
        .update({ title, content, category_id, nickname })
        .eq("id", postId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);
    redirect(`/posts/${postId}`);
}

export async function deletePost(postId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "로그인이 필요합니다." };
    }

    // RLS가 user_id 검증 → 본인 게시글만 삭제 가능
    const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/");
    redirect("/");
}
