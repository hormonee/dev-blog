import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/login/actions";
import { Suspense } from "react";
import HeaderSearch from "./HeaderSearch";

export default async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">DevBlog</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-white transition-colors hover:text-blue-400">Articles</Link>
                        <Link href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Topics</Link>
                        <Link href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Showcase</Link>
                        <Link href="#" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">About</Link>
                    </nav>
                </div>

                <div className="flex items-center gap-6">
                    {/* 검색바 — useSearchParams 때문에 Suspense로 감쌈 */}
                    <Suspense fallback={<div className="hidden lg:block w-64 h-8 rounded-xl bg-white/5 border border-white/10 animate-pulse" />}>
                        <HeaderSearch />
                    </Suspense>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <form action={logout}>
                                <button type="submit" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    Log out
                                </button>
                            </form>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
