import SearchIcon from '@mui/icons-material/Search';
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
                        <div className="peer block w-full h-10 rounded-md border border-gray-200 bg-white py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"></div>
                        <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    </div >
                </div>
                <TableSkeleton />
            </div>
        </div>
    );
}