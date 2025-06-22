import { Suspense } from "react";
import BoardWrapper from "@/app/components/dashboard/board";
import { CardsSkeleton, ChartSkeleton } from "@/app/components/dashboard/skeletons";
import PageChartWrapper from "@/app/components/dashboard/charts";
import PrivacyInfoWrapper from "@/app/components/dashboard/privacy-info";
import getDictionary from '@/app/locales/dictionaries';
import clsx from "clsx";
import { auth } from "@/auth";

interface IDashboardParams {
  period?: "today" | "week" | "month" | "specified",
  dept?:string,
  user?:string,
  periodStart?:string,
  periodEnd?:string,
}

export default async function Page(props: {
  searchParams?: Promise<IDashboardParams>;
  params: Promise<{ locale: "ko" | "en" }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const locale = params.locale;
  const periodParam = searchParams?.period?? "month";
  const deptParam = searchParams?.dept;
  const userParam = searchParams?.user;
  const periodStartParam = searchParams?.periodStart;
  const periodEndParam = searchParams?.periodEnd;

  const t = await getDictionary(locale);

  const session = await auth();
  const isAdmin = session?.user.role === "admin";

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">{t("dashboard.dashboard")}</h1>
      <div className={clsx("flex", {"flex-col mb-4 md:flex-row": isAdmin}, {"flex-col": !isAdmin})}>
        <div className={clsx("flex flex-col gap-6 mb-6", {"md:w-1/4": isAdmin})}>
          <Suspense fallback={<CardsSkeleton />}>
            <BoardWrapper trans={t}/>
          </Suspense>
        </div>
        <div className={clsx("flex-1", {"md:ml-6": isAdmin})}>
          <Suspense fallback={<ChartSkeleton />}>
            <PageChartWrapper trans={t}/>
          </Suspense>
        </div>
      </div>
      {isAdmin && 
          <div className="mt-4 border-t border-gray-300">
            <PrivacyInfoWrapper
              trans={t}
              locale={locale}
              period={periodParam}
              dept={deptParam}
              user={userParam}
              periodStart={periodStartParam}
              periodEnd={periodEndParam}
            />
          </div>
        }
    </main>
  );
}
