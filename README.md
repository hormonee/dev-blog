# DevBlog

> **마크다운 기반 풀스택 개발 블로그 플랫폼**  
> Next.js 16 App Router + Supabase + TypeScript

<br/>

## 📸 Preview
![dev-blog-overview-img](./design/dev-blog-overview.png)

<br/>

## 📌 프로젝트 소개

개발자 향 블로그 서비스를 직접 설계하고 구현한 풀스택 프로젝트입니다.  
게시글 작성/수정/삭제부터 댓글·대댓글, 커서 기반 무한 스크롤, 다중 조건 검색까지 실제 서비스 수준의 기능을 구현했습니다.

<br/>

## 🛠 기술 스택

| 분류 | 기술 |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, @tailwindcss/typography |
| **Backend** | Next.js Server Actions, Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (이메일/비밀번호), SSR 세션 관리 |
| **DB 마이그레이션** | Supabase CLI (`db push`) |
| **Markdown** | react-markdown, remark-gfm |
| **Icons** | lucide-react |
| **날짜** | date-fns |

<br/>

## ✨ 주요 기능

### 🔐 인증
- 이메일/비밀번호 회원가입 및 로그인 (이메일 인증 방식)
- 회원가입 시 닉네임, 비밀번호 실시간 검증
- **30분 세션 자동 만료** — Supabase 쿠키 `maxAge` 설정
- SSR 미들웨어를 통한 세션 갱신

### 📝 게시글
- **마크다운 에디터** — 분할 화면(편집 + 미리보기), 툴바 단축 삽입
- 게시글 CRUD — 작성·수정·삭제 (본인 게시글만)
- Server Actions 기반 DB 뮤테이션
- 게시글 상세 페이지 마크다운 렌더링 (`@tailwindcss/typography`)
- 이전글/다음글 내비게이션

### 💬 댓글 · 대댓글
- 계층형 댓글 구조 (`parent_id` — 최대 2뎁스)
- 로그인 유저만 작성 가능, 본인 댓글만 수정/삭제
- 답글 접기/펼치기 토글
- Supabase RLS(Row Level Security)로 DB 레벨 접근 제어

### 🔍 검색
- **헤더 통합 검색바** — 전체 / 제목 / 작성자 / 내용 분류 선택
- 달력 아이콘 클릭 → **시작일·종료일 독립 날짜 범위 필터**
  - 텍스트 검색과 날짜 필터 동시 적용(AND 조건)
  - 날짜 제약: 오늘까지, 시작일 ≤ 종료일
- URL params 기반 (`?q=...&type=...&from=...&to=...`) — 링크 공유 가능

### 📄 페이지네이션 (무한 스크롤)
- **커서 기반 페이지네이션** — `created_at + id` 복합 커서 (중복·누락 없음)
- **Intersection Observer** 무한 스크롤 — 뷰포트 하단 200px 도달 시 자동 로드
- 게시물 표시 개수 드롭다운(3/6/9/12/15개)과 연동

<br/>

## 🗂 프로젝트 구조

```
dev-blog/
├── app/
│   ├── actions/            # Server Actions (posts, comments)
│   ├── login/              # 로그인 페이지 & 액션
│   ├── signup/             # 회원가입 페이지 & 폼
│   ├── posts/[id]/         # 게시글 상세 & 수정 페이지
│   ├── write/              # 게시글 작성 페이지
│   ├── page.tsx            # 메인 페이지 (무한 스크롤)
│   └── layout.tsx
├── components/
│   ├── Header.tsx          # 서버 컴포넌트 헤더
│   ├── HeaderSearch.tsx    # 검색바 클라이언트 컴포넌트
│   ├── MarkdownEditor.tsx  # 분할 에디터
│   ├── PostEditForm.tsx    # 게시글 수정 에디터
│   ├── CommentSection.tsx  # 계층형 댓글 UI
│   ├── PostCard.tsx        # 게시글 카드
│   ├── Hero.tsx            # 메인 피처드 포스트
│   ├── CategoryFilter.tsx
│   └── Pagination.tsx
├── supabase/
│   └── migrations/         # SQL 마이그레이션 파일
└── utils/
    └── supabase/           # 서버/클라이언트/미들웨어 Supabase 클라이언트
```

<br/>

## 🗄 데이터베이스 스키마

```sql
-- 주요 테이블
categories   (id, name, created_at)
posts        (id, title, content, image_url, category_id, user_id, nickname, created_at)
comments     (id, post_id, user_id, author_name, content, parent_id, created_at)
profiles     (id → auth.users, nickname)
```

- 모든 테이블에 **RLS 활성화**
- 공개 읽기 / 인증 유저 쓰기 / 본인 소유 수정·삭제 정책 적용

<br/>

## ⚙️ 아키텍처 설계 포인트

| 선택 | 이유 |
|---|---|
| **Server Actions (뮤테이션)** | 별도 API Route 없이 서버에서 DB 직접 접근, 인증 강제 |
| **Server Component (상세 페이지)** | SSR로 초기 렌더링 최적화, SEO 유리 |
| **Client Component (목록 페이지)** | Intersection Observer 무한 스크롤은 브라우저 API가 필요 |
| **RLS (보안)** | 프론트 anon key 노출에도 DB 레벨에서 접근 제어 |
| **커서 페이징** | offset 방식의 중복·누락 문제 없이 일관된 페이지 순서 보장 |

<br/>

## 🚀 로컬 실행 방법

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 입력

# DB 마이그레이션 (Supabase CLI 필요)
npx supabase db push

# 개발 서버 실행
npm run dev
```

<br/>

## 🔑 환경변수

```bash
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key
```

