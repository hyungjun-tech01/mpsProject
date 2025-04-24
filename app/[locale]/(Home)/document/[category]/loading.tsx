import { Add } from '@mui/icons-material';
import { TableSkeleton, FrontTabSkeleton, BehindTabSkeleton } from "@/app/components/skeletons";

export default function Loading() {
    return (
        <div className='w-full flex-col justify-start'>
            <div className="pl-2 flex flex-row">
                <FrontTabSkeleton />
                <BehindTabSkeleton />
            </div>
            <div className="w-full px-4 bg-gray-50 rounded-md">
                <div className="pt-4 flex items-center justify-between gap-2 md:pt-8">
                    <div className="relative flex flex-1 flex-shrink-0">
                        <label htmlFor="search" className="sr-only">
                            Search
                        </label>
                        <div className="peer block h-10 w-full bg-gray-100 rounded-md"></div>
                    </div >
                </div>
                <TableSkeleton />
            </div>
        </div>
    );
}