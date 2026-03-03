"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const handlePageChange = (page: number) => {
        onPageChange(page);
        // 부드럽게 화면 위쪽으로 스크롤 이동
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const getPages = () => {
        const pages: (number | string)[] = [];

        // 전체 페이지가 7개 이하일 때는 모두 표시
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // 전체 페이지가 7개 초과일 때: 현재 페이지 위치에 따라 생략 부호(...) 처리
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="mt-16 mb-20 flex items-center justify-between border-t border-white/10 pt-6">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="group flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:not(:disabled):-translate-x-1" />
                이전
            </button>

            <div className="hidden sm:flex items-center gap-1">
                {getPages().map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-slate-500">
                            ...
                        </span>
                    ) : (
                        <button
                            key={`page-${page}`}
                            onClick={() => handlePageChange(page as number)}
                            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === page
                                ? "font-semibold text-blue-500 border-b-2 border-blue-500"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="group flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                다음
                <ArrowRight className="h-4 w-4 transition-transform group-hover:not(:disabled):translate-x-1" />
            </button>
        </div>
    );
}
