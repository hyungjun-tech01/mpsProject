'use client';

import React, { useActionState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type { UserState } from '@/app/lib/actions';


export function FileUpload({
  title,
  button_title,
  detail_comment,
  accepted,
  action,
}: {
  title: string;
  button_title: string;
  detail_comment: string;
  accepted: object;
  action: (prevState: UserState, formData: FormData) => Promise<void>;
}) {
  const initialState: UserState = { message: null, errors: {} };
  const [state, formAction] = useActionState(action, initialState);
  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    noKeyboard: true,
    accept: accepted,
    onDrop: (incomingFiles) => {
      if (hiddenInputRef.current) {
        // Note the specific way we need to munge the file into the hidden input
        // https://stackoverflow.com/a/68182158/1068446
        const dataTransfer = new DataTransfer();
        incomingFiles.forEach((v) => {
          dataTransfer.items.add(v);
        });
        hiddenInputRef.current.files = dataTransfer.files;
      }
    },
    noClick: true,
  });
  const hiddenInputRef = useRef(null);

  const getStrFileSize = (byteSize: number) => {
    if (byteSize < 1024) {
      return byteSize + ' bytes';
    } else if (byteSize < 1024 * 1024) {
      return Math.round((byteSize * 10) / 1024) / 10 + ' kbytes';
    } else {
      return Math.round((byteSize * 10) / (1024 * 1024)) / 10 + ' Mbytes';
    }
  }
  const files = acceptedFiles.map(file => <li key={file.path}>{file.path} - {getStrFileSize(file.size)}</li>);

  return (
    <form action={formAction}>
      <section>
        <div>{title}</div>
        <div {...getRootProps({ className: 'dropzone' })}
          className="border-2 border-dashed border-lime-200 rounded-md p-4 mt-2 flex gap-2 bg-lime-50 text-gray-400 justify-between items-center"
        >
          <input type="file" name="upload_file" required
            style={{
              opacity: 0,
              clip: 'rect(0 0 0 0)',
              clipPath: 'inset(50%)',
              height: 1,
              overflow: 'hidden',
              position: 'absolute',
              bottom: 0,
              left: 0,
              whiteSpace: 'nowrap',
              width: 1,
            }}
            ref={hiddenInputRef}
          />
          <input {...getInputProps()} />
          <div className='flex gap-3'>
            <CloudUploadIcon />
            <p>{detail_comment}</p>
          </div>
          <button type="button" onClick={open} className='border border-lime-800 rounded-md bg-white px-2 py-1 text-black text-sm'>
            {button_title}
          </button>
        </div>
        {(files.length > 0) &&
          <aside className='flex mx-2 mt-3 justify-between items-start'>
            <div className='flex gap-4 font-normal'>
              <h4>File</h4>
              <ul className='text-lime-700'>{files}</ul>
            </div>
            <button type="submit" className='border border-lime-800 rounded-md bg-white px-2 py-1 text-black text-sm'>
              Upload
            </button>
          </aside>
        }
      </section>
    </form>
  );
}
