import { SearchSkeleton, TableSkeleton } from "@/app/components/skeletons";

export default function Loading() {
    return (
        <div className="w-full">
            <SearchSkeleton />
            <TableSkeleton />
        </div>
    );
}