'use client';

import { useActionState, useState } from 'react';
import { createDevice, State } from './actions';
import Link from 'next/link';
import Button from '@mui/material/Button';

export default function Form() {
    const initialState: State = { message: null, errors: {} };
    const [printerChecked, setPrinterChecked] = useState(false);
    const [scanChecked, setScanChecked] = useState(false);
    const [faxChecked, setFaxChecked] = useState(false);

    const [state, formAction] = useActionState(createDevice, initialState);

    // 체크박스 상태 변경 핸들러
    const handlePrinterChange = (e) => {
        setPrinterChecked(e.target.checked);
    };

    const handleScanChange = (e) => {
        setScanChecked(e.target.checked);
    };

    const handleFaxChange = (e) => {
        setFaxChecked(e.target.checked);
    };

    return (
        <div>
            <form action={formAction}>

            <div className="flex justify-between mb-6">
                <div className="w-1/3">
                    <div>장치생성</div>
                    <div>복사기 터미널 같은 주변 장치의 설치를 허용합니다. 하드웨어가 있어야 합니다.</div>
                </div>
                <div className="w-2/3 pl-6">
                    <div className="mb-4">
                        <label htmlFor="title_device_type" className="mb-2 block text-sm font-medium">
                            Device Type
                        </label>
                        <select
                            id="device_type"
                            name="device_type"
                            className="peer block w-1/2 cursor-pointer rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue=""
                        >
                            <option value="" className="text-left" disabled>
                                Choose device type
                            </option>
                            <option value="OpenAPI" className="text-left">
                                OpenAPI
                            </option>
                            <option value="Workpath SDK" className="text-left">
                                Workpath SDK
                            </option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="title_device_name" className="mb-2 block text-sm font-medium">
                            Device Name
                        </label>
                        <input
                            id="device_name"
                            name="device_name"
                            type="text"
                            placeholder="Device Name"
                            className="h-8 w-1/2 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="title_location" className="mb-2 block text-sm font-medium">
                            Location(Option)
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="Location"
                            className="h-8 w-1/2 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="title_physical_printer_ip" className="mb-2 block text-sm font-medium">
                            IP
                        </label>
                        <input
                            id="physical_printer_ip"
                            name="physical_printer_ip"
                            type="text"
                            placeholder="IP Address"
                            className="h-8 w-1/2 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="title_device_administrator_name" className="mb-2 block text-sm font-medium">
                            Device's Administrator Name
                        </label>
                        <input
                            id="device_administrator_name"
                            name="device_administrator_name"
                            type="text"
                            defaultValue=""
                            className="h-8 w-1/2 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="title_device_administrator_password" className="mb-2 block text-sm font-medium">
                            Device's Administrator Password
                        </label>
                        <input
                            id="device_administrator_password"
                            name="device_administrator_password"
                            type="password"
                            defaultValue=""
                            className="h-8 w-1/2 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="title_ext_device_function" className="mb-2 block text-sm font-medium">
                            장치 기능 
                        </label>
                        <div className="mb-4">
                            <input
                                id="ext_device_function_printer"
                                name="ext_device_function_printer"
                                type="checkbox"
                                defaultValue=""
                                checked={printerChecked}
                                onChange={handlePrinterChange}
                                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2 "
                            />
                            <label htmlFor="ext_device_function_printer" className="ml-2 text-sm font-medium">
                                Track & Control Copying
                            </label>
                        </div>
                        <div className="mb-4">
                            <input
                                id="ext_device_function_scan"
                                name="ext_device_function_scan"
                                type="checkbox"
                                defaultValue=""
                                checked={scanChecked}
                                onChange={handleScanChange}
                                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                            />
                            <label htmlFor="ext_device_function_scan" className="ml-2 text-sm font-medium">
                                Track & Control Scanning
                            </label>
                        </div>
                        <div className="mb-4">
                            <input
                                id="ext_device_function_fax"
                                name="ext_device_function_fax"
                                type="checkbox"
                                defaultValue=""
                                checked={faxChecked}
                                onChange={handleFaxChange}
                                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                            />
                            <label htmlFor="ext_ext_device_function_fax" className="ml-2 text-sm font-medium">
                                Track & Control Fax
                            </label>
                        </div>                        
                    </div>  
                    <div className="mb-4">
                        <label htmlFor="title_printer_device_group" className="mb-2 block text-sm font-medium">
                            Printer/Device Group
                        </label>
                        <input
                            id="printer_device_group"
                            name="printer_device_group"
                            type="text"
                            defaultValue=""
                            className="h-8 w-1/2 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                        />
                    </div>
                    <div className="mt-4 flex justify-start gap-4">
                    <Link
                        href="/device"
                        className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-sm font-medium text-white transition-colors hover:bg-lime-500"
                        >
                    Cancel
                    </Link>
                    <Button
                        type="submit"
                        className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-sm font-medium text-white transition-colors hover:bg-lime-500"
                        >
                    Create Device
                    </Button>
                    </div>
                </div>
            </div>
            
            </form>
        </div>
    );
}