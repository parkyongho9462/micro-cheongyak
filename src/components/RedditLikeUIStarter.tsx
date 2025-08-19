"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowBigUp,
  ArrowBigDown,
  Flame,
  TrendingUp,
  Map as MapIcon,
  Building2,
  BarChart2,
  Search,
  Sun,
  Moon,
  Filter,
} from "lucide-react";

// shadcn/ui components (assumes shadcn is set up in your Next.js project)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
export interface PostItem {
  id: string;
  title: string;
  region: string; // e.g., "서울 강남구"
  builder: string; // 시공사
  avgRate: number; // 평균 경쟁률
  maxRate: number; // 최고 경쟁률
  types: number; // 주택형 개수
  units: number; // 총세대수(선택)
  announcedAt: string; // 모집공고일
  tags?: string[];
}

// --- Mock data (replace with Supabase fetch) ---
const MOCK_POSTS: PostItem[] = [
  {
    id: "2025-0003",
    title: "푸르지오 리버뷰",
    region: "서울 강남구",
    builder: "대우건설",
    avgRate: 18.4,
    maxRate: 42.7,
    types: 5,
    units: 812,
    announcedAt: "2025-08-15",
    tags: ["도심핵심", "중대형", "역세권"],
  },
  {
    id: "2025-0002",
    title: "힐스테이트 센트럴",
    region: "경기 성남시 분당구",
    builder: "현대건설",
    avgRate: 9.6,
    maxRate: 21.1,
    types: 4,
    units: 623,
    announcedAt: "2025-08-10",
    tags: ["분위기상승", "중형"],
  },
  {
    id: "2025-0001",
    title: "예시자이 가든",
    region: "대구 달서구",
    builder: "GS건설",
    avgRate: 3.2,
    maxRate: 5.7,
    types: 3,
    units: 512,
    announcedAt: "2025-08-01",
    tags: ["신규택지", "소형"],
  },
];

// --- Utilities ---
function toggleDarkMode() {
  const root = document.documentElement;
  root.classList.toggle("dark");
}

// --- Components ---
function VoteColumn({ initialScore = 0 }: { initialScore?: number }) {
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState<0 | 1 | -1>(0);

  const onUp = () => {
    if (voted === 1) {
      setVoted(0);
      setScore((s) => s - 1);
    } else {
      setVoted(1);
      setScore((s) => s + (voted === -1 ? 2 : 1));
    }
  };
  const onDown = () => {
    if (voted === -1) {
      setVoted(0);
      setScore((s) => s + 1);
    } else {
      setVoted(-1);
      setScore((s) => s - (voted === 1 ? 2 : 1));
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 pr-3 sm:pr-4 select-none">
      <Button onClick={onUp} variant={voted === 1 ? "default" : "ghost"} size="icon" className="h-8 w-8" aria-pressed={voted===1}>
        <ArrowBigUp className="h-5 w-5" />
      </Button>
      <div className="text-xs font-semibold tabular-nums" aria-live="polite">{score}</div>
      <Button onClick={onDown} variant={voted === -1 ? "default" : "ghost"} size="icon" className="h-8 w-8" aria-pressed={voted===-1}>
        <ArrowBigDown className="h-5 w-5" />
      </Button>
    </div>
  );
}

function KPI({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3 sm:p-3.5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-base sm:text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function PostCard({ post }: { post: PostItem }) {
  const initial = useMemo(() => Math.floor(Math.random() * 300) + 10, []);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex">
            <VoteColumn initialScore={initial} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="shrink-0">{post.region}</Badge>
                <span>•</span>
                <div className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /><span>{post.builder}</span></div>
                <span>•</span>
                <div>{post.announcedAt}</div>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <a className="font-semibold truncate hover:underline text-base sm:text-lg" href={`#/project/${post.id}`}>{post.title}</a>
                <Badge className="hidden sm:inline-flex" variant="outline">주택형 {post.types}</Badge>
                <Badge className="hidden sm:inline-flex" variant="outline">세대수 {post.units}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <KPI label="평균 경쟁률" value={`${post.avgRate.toFixed(1)}x`} icon={<TrendingUp className="h-4 w-4" />} />
                <KPI label="최고 경쟁률" value={`${post.maxRate.toFixed(1)}x`} icon={<Flame className="h-4 w-4" />} />
                <KPI label="타입 수" value={`${post.types}`} icon={<BarChart2 className="h-4 w-4" />} />
              </div>

              {post.tags && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((t) => (
                    <Badge key={t} variant="secondary">#{t}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm">자세히 보기</Button>
                <Button size="sm" variant="outline">주택형 분석</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LeftSidebar() {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">필터</CardTitle></CardHeader>
        <CardContent className="p-3 space-y-2">
          <Button variant="outline" className="w-full justify-start" size="sm"><Filter className="mr-2 h-4 w-4"/>지역/기간</Button>
          <Button variant="outline" className="w-full justify-start" size="sm"><Building2 className="mr-2 h-4 w-4"/>시공사</Button>
          <Button variant="outline" className="w-full justify-start" size="sm"><BarChart2 className="mr-2 h-4 w-4"/>세대수 구간</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">트렌딩</CardTitle></CardHeader>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm"><Flame className="h-4 w-4"/> 최상위 경쟁률 Top 5</div>
          <div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4"/> 상승 지역</div>
        </CardContent>
      </Card>
    </div>
  );
}

function RightSidebar() {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">지도 미리보기</CardTitle></CardHeader>
        <CardContent className="p-3">
          <div className="aspect-[4/3] rounded-lg border grid place-items-center">
            <MapIcon className="h-10 w-10 opacity-50"/>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">시군구별 평균 경쟁률 Choropleth 예정</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">빠른 링크</CardTitle></CardHeader>
        <CardContent className="p-3 space-y-2">
          <Button variant="link" className="px-0 h-auto">신규 공고</Button>
          <Button variant="link" className="px-0 h-auto">시공사 랭킹</Button>
          <Button variant="link" className="px-0 h-auto">데이터 파이프라인 상태</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TopBar({ onToggleTheme }: { onToggleTheme: () => void }) {
  return (
    <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90 border-b">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="font-bold text-lg sm:text-xl">미니청약홈</div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
              <Input className="pl-8 w-[240px]" placeholder="현장/지역 검색"/>
            </div>
            <Tabs defaultValue="hot" className="hidden sm:block">
              <TabsList>
                <TabsTrigger value="hot">HOT</TabsTrigger>
                <TabsTrigger value="new">NEW</TabsTrigger>
                <TabsTrigger value="top">TOP</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="toggle theme">
              <Sun className="h-5 w-5 rotate-0 dark:-rotate-90 transition-all" />
              <Moon className="absolute h-5 w-5 rotate-90 dark:rotate-0 transition-all" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RedditLikeUIStarter() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>([]);

  useEffect(() => {
    // Simulate fetch delay; replace with real Supabase fetch in Next.js server component or route
    const t = setTimeout(() => {
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar onToggleTheme={toggleDarkMode} />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_280px] gap-4">
        {/* Left Sidebar */}
        <aside className="hidden lg:block"><LeftSidebar/></aside>

        {/* Feed */}
        <section className="space-y-3">
          {loading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex">
                      <div className="pr-3 sm:pr-4"><Skeleton className="h-20 w-8"/></div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-24"/>
                          <Skeleton className="h-5 w-16"/>
                          <Skeleton className="h-5 w-20"/>
                        </div>
                        <Skeleton className="h-6 w-2/3"/>
                        <div className="grid grid-cols-3 gap-2">
                          <Skeleton className="h-12"/>
                          <Skeleton className="h-12"/>
                          <Skeleton className="h-12"/>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
              <div className="grid place-items-center pt-1">
                <Button variant="outline" className="w-full sm:w-auto">더 불러오기</Button>
              </div>
            </>
          )}
        </section>

        {/* Right Sidebar */}
        <aside className="hidden xl:block"><RightSidebar/></aside>
      </main>

      <footer className="border-t mt-6">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Micro Cheongyak. 데이터 출처: 공공데이터포털 · 청약홈
        </div>
      </footer>
    </div>
  );
}
