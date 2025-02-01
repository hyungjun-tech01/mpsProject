'use client';

import { useActionState } from 'react';
import { createDevice, State } from './actions';

export default function Form() {
    const initialState: State = { message: null, errors: {} };
    const [state, formAction] = useActionState(createDevice, initialState);
    return (
        <div>
            Create Device
            <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
            {/* User ID */}
                <div className="mb-4">
                <label htmlFor="title_user_id" className="mb-2 block text-sm font-medium">
                    User ID
                </label>
                <div className="relative">
                    <label htmlFor="value_user_id" className="mb-2 block text-sm font-medium">
                    User ID
                    </label>
                </div>
                </div>
            </div>
        </form>
        </div>
    );
}