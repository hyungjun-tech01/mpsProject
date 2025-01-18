import Form from '@/app/components/user/create-form';
import Breadcrumbs from '@/app/components/user/breadcrumbs';


export default async function Page() {
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
            <Form />
        </main>
    );
}