import { Add } from '@mui/icons-material';
import { FrontTabSkeleton, BehindTabSkeleton, TitleSkeleton, EditSkeleton, LastEditSkeleton } from "@/app/components/skeletons";

export default function Loading() {
    return (
        <div className='w-full flex-col justify-start'>
            <TitleSkeleton />
            <div className="pl-2 mt-2 flex flex-row">
                <FrontTabSkeleton />
                <BehindTabSkeleton />
                <BehindTabSkeleton />
            </div>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <EditSkeleton />
                <EditSkeleton />
                <LastEditSkeleton />
            </div>
        </div>
    );
}