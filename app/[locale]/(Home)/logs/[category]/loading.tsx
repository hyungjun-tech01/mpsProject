import { TableSkeleton, TitleSkeleton } from "@/app/components/skeletons";

export default function Loading() {
    return (
        <div className="w-full">
            <TitleSkeleton />
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <div className="relative flex flex-1 flex-shrink-0">
                    <label htmlFor="search" className="sr-only">
                        Search
                    </label>
                    <div className="peer block h-10 w-full bg-gray-100 rounded-md"></div>
                </div >
            </div>
            <TableSkeleton />
        </div>
    );
}