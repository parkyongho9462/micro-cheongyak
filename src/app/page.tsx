// src/app/page.tsx
import RedditLikeUIStarter from "@/components/RedditLikeUIStarter";
import DBProjectsList from "@/components/DBProjectsList";

export default function Page() {
  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">마이크로 청약홈</h1>
      <p className="text-gray-600">레딧 느낌 피드(목데이터) + DB 연동 리스트(시드 데이터)</p>

      <div className="mt-6">
        <RedditLikeUIStarter />
      </div>

      <DBProjectsList />
    </main>
  );
}
