import Link from 'next/link';
import { fetchProcessLogByUserId } from '@/app/lib/fetchData';



export default async function ProcessLogTable({
  id
}: {
  id: string
}) {
  const logData = await fetchProcessLogByUserId(id);

  return (
    <div className="rounded-md bg-gray-50 p-4 md:p-6">

      
    </div>
  );
}
