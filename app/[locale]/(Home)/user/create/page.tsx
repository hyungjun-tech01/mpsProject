import Form from '@/app/components/user/create-form';
import Breadcrumbs from '@/app/components/user/breadcrumbs';
import { fetchSalesPersons } from '@/app/lib/fetchData';


export default async function Page() {
    const salespersons = await fetchSalesPersons();

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Users', href: '/user' },
                    {
                        label: 'Create User',
                        href: '/user/create',
                        active: true,
                    },
                ]}
            />
            <Form salespersons={salespersons} />
        </main>
    );
}