'use client';

import { useState } from 'react';
import { DensitySmallOutlined } from '@mui/icons-material';
import DeviceModal from './deviceModal';

interface ModalButtonProps {
    list: Record<string, string>[];
    modalId: string | undefined;
}

export default function ModalButton({list, modalId}: ModalButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const clickModal = () => setShowModal(!showModal);
    return (
        <>
        <div 
            className='border-2 round-sm p-1 cursor-pointer'
            onClick={clickModal}
        >
            <DensitySmallOutlined className='w-6 h-6 text-gray-400' />
        </div>
        {showModal && 
            <DeviceModal clickModal={clickModal} groupList={list} groupId={modalId} />
        }
        </>
    )
}