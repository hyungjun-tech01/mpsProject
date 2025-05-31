'use client';

import { useActionState } from 'react';
import { executeDos } from '@/app/lib/executeDos';


export function DosForm({ label }: { label: string }) {
    const [state, formAction] = useActionState(executeDos, null);

    return (
        <div>
            <form action={formAction}>
                <input type="hidden" name="command" value="dir" />
                <button 
                    type="submit" 
                    className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-base font-medium text-white transition-colors hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
                >
                    {label}
                </button>
            </form>
            {state && (
                <div className="mt-2">
                    <pre className="bg-gray-100 p-2 rounded">
                        {state.message}
                    </pre>
                </div>
            )}
        </div>
    );
}