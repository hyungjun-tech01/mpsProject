'use server';

import MyDBAdapter from '@/app/lib/adapter';
import DetectInfoWrapper from '@/app/components/analysis/detect-info';


export default async function PrivacyInfoWrapper({
    trans, period, dept, user, periodStart, periodEnd
}: {
    trans: (key: string) => string;
    period: "today" | "week" | "month" | "specified";
    dept?: string;
    user?: string;
    periodStart?: string;
    periodEnd?: string;
}) {
    const adapter = MyDBAdapter();
    const [detectedData, allDepts] = await Promise.all([
        adapter.getPrivacyDetectedData(period, periodStart, periodEnd, dept, user),
        adapter.getAllDepts(),
    ]);

    const titles = {
        main: trans('analysis.privacy_info_detect_stats'),
        card: [
            trans('analysis.total_print_count'),
            trans('analysis.privacy_detect_count'),
            trans('analysis.privacy_detect_rate'),
            trans('analysis.privacy_last_detect_time')
        ],
        pieChart: trans('analysis.privacy_detect_by_dept'),
        barChart: trans('analysis.privacy_detect_by_date'),
    }

    return (
        <DetectInfoWrapper
            category="privacy"
            titles={titles}
            trans={trans}
            period={period}
            dept={dept}
            user={user}
            periodStart={periodStart}
            periodEnd={periodEnd}
            data={detectedData}
            deptInfo={allDepts}
        />
    );
}
