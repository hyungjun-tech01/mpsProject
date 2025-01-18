import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


export function CreateButton({ link, title }: { link: string, title: string}) {
  return (
    <Link
      href={link}
      className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-base font-medium text-white transition-colors hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500"
    >
      <span className="hidden md:block">{title}</span>{' '}
      <AddIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateButton({ link }: { link: string }) {
  return (
    <Link
      href={link}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <EditIcon className="w-5" />
    </Link>
  );
}

export function DeleteButtton({ id, action }: { id: string, action: (id:string) => void }) {
  const actionWithId = action.bind(null, id);

  return (
    <form action={actionWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <DeleteIcon className="w-5" />
      </button>
    </form>
  );
}
