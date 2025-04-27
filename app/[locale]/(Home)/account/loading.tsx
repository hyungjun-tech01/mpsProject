import {  TitleSkeleton, EditSkeleton, LastEditSkeleton } from "@/app/components/skeletons";

export default function Loading() {
    return (
        <div className='w-full flex-col justify-start'>
            <TitleSkeleton />
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <EditSkeleton />
                <LastEditSkeleton />
            </div>
        </div>
    );
}