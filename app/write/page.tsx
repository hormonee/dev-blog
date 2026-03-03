import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";

export default async function WritePage() {
    const supabase = await createClient();

    // 인증 확인 — 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 카테고리 목록을 가져옵니다.
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .order("created_at", { ascending: true });

    // MarkdownEditor 클라이언트 컴포넌트에 넘겨줍니다.
    return <MarkdownEditor categories={categories || []} />;
}
