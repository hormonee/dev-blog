"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Hero, { Post } from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [postsPerPage, setPostsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // 카테고리 필터나 페이지당 개수가 변경되면 1페이지로 돌아갑니다.
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, postsPerPage]);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const supabase = createClient();

      // category 의 관계를 조인(fetch)해서 name 필드를 가져옵니다.
      let query = supabase
        .from("posts")
        .select("*, category:categories(name)")
        .order("created_at", { ascending: false });

      if (selectedCategory !== "All") {
        query = query.eq("category.name", selectedCategory);
      }

      const { data, error } = await query;

      if (!error && data) {
        // eq("category.name") 으로 필터링을 걸었을 때, PostgREST에서는 내부 조인을 사용하지만 
        // 클라이언트 사이드에서는 부모 행 데이터가 필터 아웃되지 않고 category 값이 null로 떨어집니다 (Inner vs Left join 차이).
        // 따라서 확실하게 하기 위해 프론트엔드에서도 한 번 더 필터링해줍니다.
        let filteredData = data as any[];

        if (selectedCategory !== "All") {
          filteredData = filteredData.filter(p => p.category?.name === selectedCategory);
        }

        setPosts(filteredData as Post[]);
      } else {
        console.error("Error fetching posts:", error);
      }

      setLoading(false);
    }

    fetchPosts();
  }, [selectedCategory]);

  // is_featured 속성이 없어졌으므로 최신글 하나를 Hero로 빼줍니다.
  const featuredPost = posts[0];
  const listPosts = posts.slice(1);

  // 페이지네이션 처리
  const totalPages = Math.ceil(listPosts.length / postsPerPage);
  const paginatedPosts = listPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // DB에 저장된 실제 카테고리 목록을 하드코딩 또는 서버에서 불러옵니다. (여기서는 DB와 동일하게 설정)
  const categories = ["기술", "라이프스타일", "여행", "음식"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 mt-16">
      {loading && posts.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <Hero post={featuredPost} />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-3">
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

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {paginatedPosts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              해당 카테고리에 등록된 기사가 없습니다.
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
