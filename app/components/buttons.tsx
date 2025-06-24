import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
import clsx from 'clsx';


export function CreateButton({ link, title }: { link: string, title: string}) {
  return (
    <Link
      href={link}
      className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-base font-medium text-white transition-colors hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
    >
      <span className="hidden md:block md:">{title}</span>{' '}
      <AddIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateButton({ link, disabled }: { link: string, disabled?: boolean }) {
  return (
    <Link
      href={disabled ? "" : link}
      className={clsx("rounded-md border p-2",
        {"text-gray-200 cursor-default": disabled},
        {"hover:bg-gray-100": !disabled},
      )}
    >
      <EditIcon className="w-5" />
    </Link>
  );
}

export function DeleteButtton({ id, title, deletedBy, ipAddress, action }: { id: string, title:string, deletedBy:string|undefined, ipAddress:string|undefined, action: (id:string, deletedBy:string) => void }) {
  //  console.log("DeleteButton / id :", id, ipAddress);

   const merged = `${deletedBy ?? 'unknown'},${ipAddress ?? 'unknown'}`;
  const actionWithId = action.bind(null, id, merged);
  return (
    <form action={actionWithId}>
      <button type="submit" className="rounded-md border px-4 py-1 hover:bg-gray-100">
        {/* <span className="sr-only">Delete</span> */}
        {/* <DeleteIcon className="w-5" /> */}
        {title}
      </button>
    </form>
  );
}
