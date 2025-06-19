import { TableSkeleton, FrontTabSkeleton, BehindTabSkeleton, SmallCardSkeleton } from "@/app/components/skeletons";

  
export default function Loading() {
    return (
        <div className='w-full flex-col justify-start'>
            <div className="pl-2 flex flex-row">
                <FrontTabSkeleton />
                <BehindTabSkeleton />
            </div>
            <div className="w-full px-4 bg-gray-50 rounded-md">
                <div className="py-4 flex items-center justify-between gap-2 md:py-8">
                    <div className='flex gap-4 text-sm'>
                        <div className='w-24 h-7 border border-gray-300 rounded-md pl-2 md:mr-2 bg-white'></div>
                        <div className='w-24 h-7 border border-gray-300 rounded-md pl-2 md:mr-2 bg-white'></div>
                        <div className='w-32 h-7 ml-2 border border-gray-300 rounded-md bg-white'></div>
                        <div className='w-32 h-7 ml-2 border border-gray-300 rounded-md bg-white'></div>
                        <div className='w-32 h-7 ml-2 border border-gray-300 rounded-md bg-white'></div>
                        <div className='w-24 h-7 border bg-lime-900 text-white rounded-md'></div>
                    </div>
                </div>
                <div className="mb-8 flex flex-col items-stretch text-sm md:flex-row md:gap-4">
                    <SmallCardSkeleton />
                    <SmallCardSkeleton />
                    <SmallCardSkeleton />
                    <SmallCardSkeleton />
                </div>
                <div className="mb-4 p-2">
                    <div className='py-4'>
                        <div className='flex justify-start'>
                            <div className='flex bg-gray-200 px-2 py-1 rounded'>
                                <div className="h-8 w-24 py-2 px-4 rounded bg-white rounded"></div>
                                <div className="h-8 w-24 py-2 px-4 bg-gray-200 rounded rounded"></div>
                                <div className="h-8 w-24 py-2 px-4 bg-gray-200 rounded rounded"></div>
                            </div>
                        </div>
                        <TableSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
}