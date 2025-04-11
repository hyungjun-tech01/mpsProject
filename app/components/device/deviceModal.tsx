'use client';

import { Close } from '@mui/icons-material';

interface DeviceModalProps {
    clickModal: () => void;
    groupList: any[];
}

export default function DeviceModal({ clickModal, groupList }: DeviceModalProps) {
    console.log('Check group :', groupList);
    return (
        <div onClick={clickModal}
            className="fixed w-screen h-screen inset-0 z-50 flex items-center justify-center outline-none focus:outline-none bg-black/40"
        >
            <div onClick={e => e.stopPropagation()}
                className="relative mx-auto my-6 w-1/3 max-w-3xl">
                <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
                    <div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5">
                        <h5 className="text-3xl font-semibold">장치 그룹</h5>
                        <button onClick={clickModal}>
                            <Close className="text-black" />
                        </button>
                    </div>
                    <div className="relative flex-auto p-6">
                        {groupList?.map((group) => (
                            <div key={group.id} className="mb-4 flex items-center justify-between">
                                <span><input type='radio' name={`rb_${group.group_id}`} className='mr-2'/>{group.group_name}</span>
                                <span>{group.device_count}대</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}