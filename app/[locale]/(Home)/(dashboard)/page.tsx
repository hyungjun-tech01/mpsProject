import { Suspense } from 'react';
import CardWrapper from '@/app/components/dashboard/cards';
import { CardsSkeleton } from '@/app/components/dashboard/skeletons';

export default async function Page() {
    <main>
        <h1 className='mb-4 text-xl md:text-2xl'>
            Dashboard
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
    </main>
}