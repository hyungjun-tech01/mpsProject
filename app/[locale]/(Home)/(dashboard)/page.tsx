import { Suspense } from "react";
import CardWrapper from "@/app/components/dashboard/cards";
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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper trans={t}/>
        </Suspense>
      </div>
      <div className="mt-6">
        <PageChartWrapper trans={t}/>
      </div>
    </main>
  );
}
