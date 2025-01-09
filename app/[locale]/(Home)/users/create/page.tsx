import Form from '@/app/components/company/create-form';
import Breadcrumbs from '@/app/components/company/breadcrumbs';
import { fetchSalesPersions } from '@/app/lib/fetchData';


export default async function Page() {
    const salespersons = await fetchSalesPersions();

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Company', href: '/company' },
                    {
                        label: 'Create Company',
                        href: '/company/create',
                        active: true,
                    },
                ]}
            />
            <Form salespersons={salespersons} />
        </main>
    );
}