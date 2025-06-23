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
    const [ detectedData, allDepts] = await Promise.all([
        adapter.getPrivacytDetectedData(period, periodStart, periodEnd, dept, user),
        adapter.getAllDepts(),
    ]);

    return (
        <DetectInfoWrapper
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
