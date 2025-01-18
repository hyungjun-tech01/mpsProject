import EditUserForm from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/user/breadcrumbs';
import { fetchUserById } from '@/app/lib/fetchData';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const user = await fetchUserById(id);
    console.log(`[Edit User] user id: ${id} /`, user);

    if(!user) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'User', href: '/user' },
                    {
                        label: 'Edit User',
                        href: `/user/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <EditUserForm user={user} />
        </main>
    );
}