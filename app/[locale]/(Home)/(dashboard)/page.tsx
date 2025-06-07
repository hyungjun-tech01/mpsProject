import { Suspense } from "react";
import BoardWrapper from "@/app/components/dashboard/board";
import { BoardSkeleton, ChartSkeleton } from "@/app/components/dashboard/skeletons";
import PageChartWrapper from "@/app/components/dashboard/charts";
import PrivateInfotWrapper from "@/app/components/dashboard/private-info";
import getDictionary from '@/app/locales/dictionaries';
import clsx from "clsx";
import { auth } from "@/auth";


export default async function Page(props: {
  params: Promise<{ id: string, period:string, dept:string, user:string, locale: "ko" | "en" }>
}) {
  const params = await props.params;
  const locale = params.locale;
  const t = await getDictionary(locale);
  const session = await auth();
  const isAdmin = session?.user.role === "admin";

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">{t("dashboard.dashboard")}</h1>
      <div className={clsx("flex", {"flex-col mb-4 md:flex-row": isAdmin}, {"flex-col": !isAdmin})}>
        <div className={clsx("flex flex-col gap-6 mb-6", {"md:w-1/4": isAdmin})}>
          <Suspense fallback={<BoardSkeleton />}>
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
          <div>
            <PrivateInfotWrapper trans={t} />
          </div>
        }
    </main>
  );
}
