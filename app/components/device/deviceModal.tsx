'use client';

import { Close } from '@mui/icons-material';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';


interface DeviceModalProps {
    clickModal: () => void;
    groupList: Record<string, string>[];
    groupId: string | undefined;
}


export default function DeviceModal({ clickModal, groupList, groupId}: DeviceModalProps) {
    console.log("DeviceModal : ", groupId);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter()

    const convGroupId = groupId ?? "0";
    const tempNoGroup = {
        id: '0',
        group_name: '전체 기기',
        created_date: new Date(),
        device_count: ""
    };
    const tempGroupList = [
        tempNoGroup,
        ...groupList
    ];

    const changeGroup = (event: React.ChangeEvent<HTMLInputElement>, group: string) => {
        if(event.target.checked) {
            if(group === '0') {
                router.push(pathname);
            } else {
                const params = new URLSearchParams(searchParams);
                params.set("groupId", group);
                router.push(`${pathname}?${params.toString()}`);
            }
            clickModal();
        }
    };

    return (
        <div onClick={clickModal}
            className="fixed w-screen h-screen inset-0 z-50 flex items-center justify-center outline-none focus:outline-none bg-black/40"
        >
            <div onClick={e => e.stopPropagation()}
                className="relative mx-auto my-6 w-1/3 max-w-3xl">
                <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
                    <div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5">
                        <div className="text-lg font-semibold">장치 그룹</div>
                        <button onClick={clickModal}>
                            <Close className="text-black" />
                        </button>
                    </div>
                    <div className="relative flex-auto p-6">
                        {tempGroupList.map((group) => (
                            <div key={group.id} className="mb-4 flex items-center justify-between">
                                <span>
                                    <input 
                                        id="device_group"
                                        type='radio'
                                        name={`rb_${group.id}`}
                                        defaultChecked={group.id === convGroupId}
                                        className='mr-2'
                                        onChange={(e) => changeGroup(e, group.id) }
                                    />
                                    <label htmlFor="device_group">{group.group_name}</label>
                                </span>
                                {group.id !== '0' && <span>{group.device_count}대</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}