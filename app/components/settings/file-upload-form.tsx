'use client';

import Link from 'next/link';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import clsx from 'clsx';
import type { UserState } from '@/app/lib/actions';
import { useActionState } from 'react';


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});


export function FileUpload({
  title,
  buttonTitle,
  accepted,
  action,
}: {
  title: string;
  buttonTitle: string;
  accepted: string;
  action: (prevState: UserState, formData: FormData) => Promise<void>;
}) {
  const initialState: UserState = { message: null, errors: {} };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <div className="flex items-center justify-between ml-4">
        <div id="div_upload_file" className="flex items-center justify-between gap-4">
          <label htmlFor="upload_file">{title}</label>
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            className="border-2 border-gray-600 rounded-md"
          >
            {buttonTitle}
            <VisuallyHiddenInput
              type="file"
              name="upload_file"
              // onChange={(event) => console.log(event.target.files)}
              accept={accepted}
            />
          </Button>
          {/* <input type="file" id="upload_file" name="upload_file" accept={accepted} /> */}
        </div>

        <Button
          type="submit"
          className="flex h-10 items-center rounded-lg bg-gray-200 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Upload
        </Button>
      </div>

    </form>
  );
}
