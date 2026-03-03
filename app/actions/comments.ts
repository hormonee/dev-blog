"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addComment(postId: string, formData: FormData) {
    const supabase = await createClient();
    const author_name = formData.get("author_name") as string;
    const password = formData.get("password") as string;
    const content = formData.get("content") as string;

    const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_name,
        password,
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
    const passwordInput = formData.get("password") as string;
    const newContent = formData.get("content") as string;

    const { data: comment } = await supabase.from("comments").select("password").eq("id", commentId).single();
    if (!comment || comment.password !== passwordInput) {
        return { error: "비밀번호가 일치하지 않습니다." };
    }

    const { error } = await supabase.from("comments").update({ content: newContent }).eq("id", commentId);
    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
}

export async function deleteComment(commentId: string, postId: string, formData: FormData) {
    const supabase = await createClient();
    const passwordInput = formData.get("password") as string;

    const { data: comment } = await supabase.from("comments").select("password").eq("id", commentId).single();
    if (!comment || comment.password !== passwordInput) {
        return { error: "비밀번호가 일치하지 않습니다." };
    }

    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
}
