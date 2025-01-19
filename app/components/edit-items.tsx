
export interface IEditItem {
    name: string;
    title: string;
    type: 'label' | 'input' | 'select';
    defaultValue: string | number;
    options?: { title: string, value: string | number }[] | null;
    error?: string[];
}

export function EditItem({
    name,
    title,
    type,
    defaultValue,
    options,
    error,
}: IEditItem
) {

    switch (type) {
        case 'label':
            return (
                <div className="mb-4">
                    <label htmlFor={name} className="mb-2 block text-sm font-medium">
                        {title}
                    </label>
                    <div className="relative">
                        <label htmlFor={name} className="mb-2 block text-sm font-medium">
                            {defaultValue}
                        </label>
                    </div>
                </div>
            );
        case 'input':
            return (
                <div className="mb-4">
                    <label htmlFor={name} className="mb-2 block text-sm font-medium">
                        Full Name
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                            <input
                                id={name}
                                name={name}
                                type="text"
                                defaultValue={defaultValue || ''}
                                placeholder={`Enter ${title}`}
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                required
                            />
                        </div>
                        <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
                            {error && error.map((error: string) => (
                                <p className="mt-2 text-sm text-red-500" key={error}>
                                    {error}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'label':
            return (
                <div className="mb-4">
                    <label htmlFor={name} className="mb-2 block text-sm font-medium">
                        Enable / Disable Printing
                    </label>
                    <div className="relative">
                        <select
                            id={name}
                            name={name}
                            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue=""
                            aria-describedby="customer-error"
                        >
                            {options && options.map(item => {
                                return item.value === defaultValue
                                    ? <option value={item.value} selected>{item.title}</option>
                                    : <option value={item.value}>{item.title}</option>
                            })
                            }
                        </select>
                    </div>
                    <div id="customer-error" aria-live="polite" aria-atomic="true">
                        {error && error.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                                {error}
                            </p>
                        ))}
                    </div>
                </div>
            );
    };
}