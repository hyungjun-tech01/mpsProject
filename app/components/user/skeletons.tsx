import Breadcrumbs from '@/app/components/user/breadcrumbs';
import AddIcon from '@mui/icons-material/Add';

function TableRowSkeleton() {
    return (
        <tr className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
            {/* User ID */}
            <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-32 rounded bg-gray-100"></div>
                </div>
            </td>
            {/* User Name */}
            <td className="whitespace-nowrap px-3 py-3">
                <div className="h-6 w-32 rounded bg-gray-100"></div>
            </td>
            {/* Balance */}
            <td className="whitespace-nowrap px-3 py-3">
                <div className="h-6 w-16 rounded bg-gray-100"></div>
            </td>
            {/* Restricted */}
            <td className="whitespace-nowrap px-3 py-3">
                <div className="h-6 w-16 rounded bg-gray-100"></div>
            </td>
            {/* Pages */}
            <td className="whitespace-nowrap px-3 py-3">
                <div className="h-6 w-16 rounded bg-gray-100"></div>
            </td>
            {/* Jobs */}
            <td className="whitespace-nowrap px-3 py-3">
                <div className="h-6 w-16 rounded bg-gray-100"></div>
            </td>
            {/* Actions */}
            <td className="whitespace-nowrap py-3 pl-6 pr-3">
                <div className="flex justify-end gap-3">
                    <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
                    <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
                </div>
            </td>
        </tr>
    );
}

function MobileSkeleton() {
    return (
        <div className="mb-2 w-full rounded-md bg-white p-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                <div className="flex items-center">
                    <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
                    <div className="h-6 w-16 rounded bg-gray-100"></div>
                </div>
                <div className="h-6 w-16 rounded bg-gray-100"></div>
            </div>
            <div className="flex w-full items-center justify-between pt-4">
                <div>
                    <div className="h-6 w-16 rounded bg-gray-100"></div>
                    <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
                </div>
                <div className="flex justify-end gap-2">
                    <div className="h-10 w-10 rounded bg-gray-100"></div>
                    <div className="h-10 w-10 rounded bg-gray-100"></div>
                </div>
            </div>
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="mt-6 flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                    <div className="md:hidden">
                        <MobileSkeleton />
                        <MobileSkeleton />
                        <MobileSkeleton />
                        <MobileSkeleton />
                        <MobileSkeleton />
                        <MobileSkeleton />
                    </div>
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                                    User ID
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    User Name
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Balance
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Restricted
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Pages
                                </th>
                                <th scope="col" className="px-3 py-5 font-medium">
                                    Jobs
                                </th>
                                <th
                                    scope="col"
                                    className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6"
                                >
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                            <TableRowSkeleton />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export function UserTableSkeleton() {
    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">Users</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <div className="relative flex flex-1 flex-shrink-0">
                    <label htmlFor="search" className="sr-only">
                        Search
                    </label>
                    <div className="peer block h-10 w-full bg-gray-50 rounded-md border border-gray-200 outline-2"></div>
                </div >
                <div className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-base font-medium text-white transition-colors hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500">
                    <span className="hidden md:block">Create User</span>{' '}
                    <AddIcon className="h-5 md:ml-4" />
                </div>
            </div>
            <TableSkeleton />
        </div>
    );
}

export function UserEditSkeleton() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'User', href: '/user' },
                    {
                        label: `Edit User :  (  )`,
                        href: `/user/error`,
                        active: true,
                    },
                ]}
            />
            <div className='w-full pl-2 flex justify-start'>
                <div className="w-24 h-9 rounded-t-lg border-solid font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2" />
                <div className="w-24 h-9 rounded-t-lg border-solid text-gray-300  bg-white border-2" />
                <div className="w-24 h-9 rounded-t-lg border-solid text-gray-300  bg-white border-2" />
                <div className="w-24 h-9 rounded-t-lg border-solid text-gray-300  bg-white border-2" />
            </div>
            <div className="h-80 rounded-md bg-gray-50"/>
        </main>
    )
}

export function UserCreateSkeleton() {
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'User', href: '/user' },
                    {
                        label: `Create User :  (  )`,
                        href: `/user/error`,
                        active: true,
                    },
                ]}
            />
            <div className='w-full pl-2 flex justify-start'>
                <div className="w-24 h-9 rounded-t-lg border-solid font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2" />
                <div className="w-24 h-9 rounded-t-lg border-solid text-gray-300  bg-white border-2" />
                <div className="w-24 h-9 rounded-t-lg border-solid text-gray-300  bg-white border-2" />
                <div className="w-24 h-9 rounded-t-lg border-solid text-gray-300  bg-white border-2" />
            </div>
            <div className="h-80 rounded-md bg-gray-50"/>
        </main>
    )
}