"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * 프로필에서 닉네임을 가져오는 헬퍼 함수.
 */
async function getNickname(supabase: any, userId: string, userEmail?: string): Promise<string> {
    const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .single();
    return profile?.nickname || userEmail?.split("@")[0] || "익명";
}

export async function addComment(postId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "댓글을 작성하려면 로그인해주세요." };
    }

    const content = formData.get("content") as string;
    if (!content?.trim()) {
        return { error: "댓글 내용을 입력해주세요." };
    }

    const nickname = await getNickname(supabase, user.id, user.email);

    const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        author_name: nickname,
        content
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
}

export async function updateComment(commentId: string, postId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "로그인이 필요합니다." };
    }

    const newContent = formData.get("content") as string;
    if (!newContent?.trim()) {
        return { error: "수정할 내용을 입력해주세요." };
    }

    const { error } = await supabase
        .from("comments")
        .update({ content: newContent })
        .eq("id", commentId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
}

export async function deleteComment(commentId: string, postId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "로그인이 필요합니다." };
    }

    const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
}
