import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#0f172a] py-16 text-center">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4">

                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>

                <nav className="mb-12 flex flex-wrap justify-center gap-8 md:gap-12">
                    <Link href="#" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Blog</Link>
                    <Link href="#" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Newsletter</Link>
                    <Link href="#" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Jobs</Link>
                    <Link href="#" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">Privacy</Link>
                </nav>

                <p className="text-sm text-slate-500">
                    © 2024 DevBlog Platform, Inc. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
