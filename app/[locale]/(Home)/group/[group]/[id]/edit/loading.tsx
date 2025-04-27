import { TitleSkeleton, LastEditSkeleton, GroupSkeleton, EditSkeleton } from "@/app/components/skeletons";

export default function Loading() {
    return (
        <div className='w-full flex-col justify-start'>
            <TitleSkeleton />
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <EditSkeleton />
                <LastEditSkeleton />
                <GroupSkeleton />
            </div>
            <div className="mt-4 flex justify-end gap-4">
                <div className="flex h-10 w-24 rounded-lg bg-gray-100 px-4" />
                <div className="flex h-10 w-24 rounded-lg bg-gray-100 px-4" />
            </div>
        </div>
    );
}