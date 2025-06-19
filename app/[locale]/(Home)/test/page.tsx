import { Add, Search } from '@mui/icons-material';
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
                        <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                    </div >
                    <div className="flex h-10 items-center rounded-lg bg-gray-300 px-4 text-base font-medium text-white transition-colors">
                        <span className="hidden w-12 md:block">{' '}</span>{' '}
                        <Add className="h-5 md:ml-4" />
                    </div>
                </div>
                <TableSkeleton />
            </div>
        </div>
    );
}