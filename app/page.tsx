"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Hero, { Post } from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const PAGE_SIZE = 6;

interface Cursor {
  created_at: string;
  id: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const searchType = searchParams.get("type") || "all";
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [postsPerPage, setPostsPerPage] = useState(PAGE_SIZE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cursor, setCursor] = useState<Cursor | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Intersection Observer 감지용 sentinel 요소
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
  }, []);

  // 파라미터 변경 시 리셋
  useEffect(() => {
    setCursor(null);
    setPosts([]);
    setHasMore(false);
  }, [selectedCategory, searchQuery, searchType, dateFrom, dateTo, postsPerPage]);

  const fetchPosts = useCallback(async (cursorVal: Cursor | null, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    const supabase = createClient();
    let query = supabase
      .from("posts")
      .select("*, category:categories(name)")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(postsPerPage + 1);

    // 카테고리 필터
    if (selectedCategory !== "All") {
      query = query.eq("category.name", selectedCategory);
    }

    // 텍스트 검색
    if (searchQuery.trim()) {
      if (searchType === "title") {
        query = query.ilike("title", `%${searchQuery}%`);
      } else if (searchType === "content") {
        query = query.ilike("content", `%${searchQuery}%`);
      } else if (searchType === "author") {
        query = query.ilike("nickname", `%${searchQuery}%`);
      } else {
        query = query.or(
          `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,nickname.ilike.%${searchQuery}%`
        );
      }
    }

    // 날짜 범위 필터 (텍스트 검색과 독립적으로 AND 조건 적용)
    if (dateFrom) {
      query = query.gte("created_at", `${dateFrom}T00:00:00.000Z`);
    }
    if (dateTo) {
      // 종료일 당일 23:59:59 까지 포함
      query = query.lte("created_at", `${dateTo}T23:59:59.999Z`);
    }

    // 커서
    if (cursorVal) {
      query = query.or(
        `created_at.lt.${cursorVal.created_at},and(created_at.eq.${cursorVal.created_at},id.lt.${cursorVal.id})`
      );
    }

    const { data, error } = await query;

    if (!error && data) {
      let filteredData = data as any[];
      if (selectedCategory !== "All") {
        filteredData = filteredData.filter((p) => p.category?.name === selectedCategory);
      }

      const more = filteredData.length > postsPerPage;
      const pageData = more ? filteredData.slice(0, postsPerPage) : filteredData;

      setHasMore(more);
      if (pageData.length > 0) {
        const last = pageData[pageData.length - 1];
        setCursor({ created_at: last.created_at, id: last.id });
      }
      setPosts((prev) => (append ? [...prev, ...pageData] : pageData));
    } else {
      if (!append) setPosts([]);
    }

    if (append) setLoadingMore(false);
    else setLoading(false);
  }, [selectedCategory, searchQuery, searchType, dateFrom, dateTo, postsPerPage]);

  // 초기 로드 (파라미터 리셋 후)
  useEffect(() => {
    fetchPosts(null, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery, searchType, dateFrom, dateTo, postsPerPage]);

  // 무한 스크롤 — 마지막 PostCard 그리드 아래 sentinel이 뷰포트의 200px 안으로 들어오면 로드
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPosts(cursor, true);
        }
      },
      {
        rootMargin: "200px", // 하단 200px 미리 트리거 (UX 관점: 사용자가 느끼기 전에 로드)
        threshold: 0,
      }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, cursor, fetchPosts]);

  const isSearching = !!searchQuery || !!dateFrom || !!dateTo;
  const featuredPost = posts[0] ?? null;
  const listPosts = posts.slice(1);
  const displayPosts = isSearching ? posts : listPosts;
  const categories = ["기술", "라이프스타일", "여행", "음식"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 mt-16">
      {loading && posts.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {!isSearching && <Hero post={featuredPost} />}

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-3">
              {isLoggedIn && (
                <Link
                  href="/write"
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  ✏️ 글쓰기
                </Link>
              )}
              <span className="text-sm text-slate-400">게시물 표시:</span>
              <select
                value={postsPerPage}
                onChange={(e) => setPostsPerPage(Number(e.target.value))}
                className="bg-[#1e2436] text-white border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
              >
                <option value={3}>3개씩 보기</option>
                <option value={6}>6개씩 보기</option>
                <option value={9}>9개씩 보기</option>
                <option value={12}>12개씩 보기</option>
                <option value={15}>15개씩 보기</option>
              </select>
            </div>
          </div>

          {/* 검색/날짜 필터 결과 안내 */}
          {isSearching && (
            <p className="text-sm text-slate-400 mb-6">
              {searchQuery && <>&quot;<span className="text-white font-medium">{searchQuery}</span>&quot; </>}
              {(dateFrom || dateTo) && (
                <span className="text-slate-300">
                  {dateFrom && dateTo ? `${dateFrom} ~ ${dateTo}` :
                    dateFrom ? `${dateFrom} 이후` :
                      `${dateTo} 이전`}
                  {" "}
                </span>
              )}
              검색 결과 <span className="text-white font-medium">{posts.length}건</span>{hasMore && "+"}
            </p>
          )}

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {displayPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {displayPosts.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              {isSearching
                ? "검색 조건에 맞는 게시물이 없습니다."
                : "해당 카테고리에 등록된 게시물이 없습니다."
              }
            </div>
          )}

          {/* Intersection Observer 감지용 sentinel */}
          <div ref={sentinelRef} className="h-1" />

          {/* 로딩 스피너 */}
          {loadingMore && (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
