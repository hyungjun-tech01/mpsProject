import { SearchSkeleton, TableSkeleton, TitleSkeleton } from "@/app/components/skeletons";

export default function Loading() {
    return (
        <div className="w-full">
            <TitleSkeleton />
            <SearchSkeleton />
            <TableSkeleton />
        </div>
    );
}