import { Suspense } from "react";
import CardWrapper from "@/app/components/dashboard/cards";
import { CardsSkeleton } from "@/app/components/dashboard/skeletons";
import PageChartWrapper from "@/app/components/dashboard/charts";
import { auth } from "@/auth" // auth 추가

export default async function Page() {
  const session = await auth() // session 호출 추가
  console.log(session); // console log 추가
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6">
        <PageChartWrapper />
      </div>
    </main>
  );
}
