"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, X } from "lucide-react";

const SEARCH_TYPES = [
    { value: "all", label: "전체" },
    { value: "title", label: "제목" },
    { value: "author", label: "작성자" },
    { value: "content", label: "내용" },
];

export default function HeaderSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const [searchType, setSearchType] = useState(searchParams.get("type") || "all");
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [dateFrom, setDateFrom] = useState(searchParams.get("from") || "");
    const [dateTo, setDateTo] = useState(searchParams.get("to") || "");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const hasDateFilter = !!dateFrom || !!dateTo;

    const buildParams = (q: string, type: string, from: string, to: string) => {
        const params = new URLSearchParams();
        if (q.trim()) { params.set("q", q.trim()); params.set("type", type); }
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        return params;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.push(`/?${buildParams(query, searchType, dateFrom, dateTo).toString()}`);
        setShowDatePicker(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSubmit();
        if (e.key === "Escape") { setQuery(""); inputRef.current?.blur(); }
    };

    const handleClearSearch = () => {
        setQuery("");
        router.push(`/?${buildParams("", searchType, dateFrom, dateTo).toString()}`);
    };

    const handleApplyDate = () => {
        router.push(`/?${buildParams(query, searchType, dateFrom, dateTo).toString()}`);
        setShowDatePicker(false);
    };

    const handleClearDate = () => {
        setDateFrom("");
        setDateTo("");
        router.push(`/?${buildParams(query, searchType, "", "").toString()}`);
        setShowDatePicker(false);
    };

    return (
        <form onSubmit={handleSubmit} className="relative hidden lg:flex items-center">
            {/* 검색 분류 드롭다운 */}
            <select
                value={searchType}
                onChange={(e) => { setSearchType(e.target.value); setQuery(""); }}
                className="h-8 appearance-none rounded-l-xl border border-r-0 border-white/10 bg-white/5 pl-3 pr-6 text-xs text-slate-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 6px center",
                }}
            >
                {SEARCH_TYPES.map((t) => (
                    <option key={t.value} value={t.value} className="bg-slate-900">{t.label}</option>
                ))}
            </select>

            {/* 텍스트 검색 입력 */}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        searchType === "title" ? "제목으로 검색..." :
                            searchType === "author" ? "작성자 검색..." :
                                searchType === "content" ? "내용으로 검색..." :
                                    "제목, 내용, 작성자 검색..."
                    }
                    className="h-8 w-44 border border-white/10 bg-white/5 pl-9 pr-7 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all focus:w-56"
                />
                {query && (
                    <button type="button" onClick={handleClearSearch} className="absolute inset-y-0 right-1 flex items-center px-1 text-slate-400 hover:text-white text-xs">
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            {/* 달력 아이콘 버튼 (검색바 우측 끝) */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowDatePicker((v) => !v)}
                    className={`flex h-8 w-8 items-center justify-center rounded-r-xl border border-l-0 border-white/10 transition-colors ${hasDateFilter
                            ? "bg-blue-600/40 text-blue-300 border-blue-500/40"
                            : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                    title="작성 기간 필터"
                >
                    <Calendar className="h-3.5 w-3.5" />
                </button>

                {/* 날짜 피커 드롭다운 */}
                {showDatePicker && (
                    <div
                        ref={datePickerRef}
                        className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-white/10 bg-[#1a2035] p-4 shadow-2xl shadow-black/40"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-white">작성 기간 설정</span>
                            {hasDateFilter && (
                                <button type="button" onClick={handleClearDate} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                    <X className="h-3 w-3" /> 초기화
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">시작일</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    max={dateTo || today}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-[#131722] px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">종료일</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    min={dateFrom || undefined}
                                    max={today}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-[#131722] px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="mt-4 text-xs text-slate-500 space-y-0.5">
                            <p>· 시작일만: 해당 날짜 이후 전체 조회</p>
                            <p>· 종료일만: 해당 날짜까지 전체 조회</p>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowDatePicker(false)}
                                className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors"
                            >
                                닫기
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyDate}
                                className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs text-white hover:bg-blue-500 transition-colors font-medium"
                            >
                                적용
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
