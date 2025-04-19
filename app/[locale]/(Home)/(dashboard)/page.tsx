import { Suspense } from "react";
import BoardWrapper from "@/app/components/dashboard/board";
import { CardsSkeleton } from "@/app/components/dashboard/skeletons";
import PageChartWrapper from "@/app/components/dashboard/charts";
import getDictionary from '@/app/locales/dictionaries';


export default async function Page(props: {
  params: Promise<{ id: string, job: string, locale: "ko" | "en" }>
}) {
  const params = await props.params;
  const locale = params.locale;
  const t = await getDictionary(locale);


  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">{t("dashboard.dashboard")}</h1>
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col gap-6 mb-6 md:w-1/4">
          <Suspense fallback={<CardsSkeleton />}>
            <BoardWrapper trans={t}/>
          </Suspense>
        </div>
        <div className="flex-1 md:ml-6">
          <PageChartWrapper trans={t}/>
        </div>
      </div>
    </main>
  );
}
