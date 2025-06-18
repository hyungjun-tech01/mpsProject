import { Add,
  NavigateBeforeOutlined,
  NavigateNextOutlined
} from '@mui/icons-material';
import Breadcrumbs from '@/app/components/breadcrumbs';

// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function TitleSkeleton() {
  return (
    <div className="flex w-full items-center justify-between">
      <div
        className={`${shimmer} relative mb-4 h-10 w-36 overflow-hidden rounded-md bg-gray-100`}
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-200" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full md:col-span-4">
      <div className="rounded-xl bg-gray-50 p-4">
        <div
          className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
        >
        </div>
        <div className="bg-white p-6 h-96">
        </div>
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
      <div className="relative flex flex-1 flex-shrink-0">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="peer block h-10 w-full bg-gray-100 rounded-md"></div>
      </div >
      <div className="flex h-10 items-center rounded-lg bg-gray-300 px-4 text-base font-medium text-white transition-colors">
        <span className="hidden w-12 md:block">{' '}</span>{' '}
        <Add className="h-5 md:ml-4" />
      </div>
    </div>
  );
}


function TableRowSkeleton() {
  return (
    <tr className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
      <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
        <div className="h-6 rounded bg-gray-100"></div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 rounded bg-gray-100"></div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 rounded bg-gray-100"></div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 rounded bg-gray-100"></div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 rounded bg-gray-100"></div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">
        <div className="h-6 rounded bg-gray-100"></div>
      </td>
      <td className="whitespace-nowrap py-3 px-3">
        <div className="flex justify-center gap-3">
          <div className="h-[36px] w-[36px] rounded bg-gray-100"></div>
          <div className="h-[36px] w-[36px] rounded bg-gray-100"></div>
        </div>
      </td>
    </tr>
  );
}

function MobileSkeleton() {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-8">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-100"></div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </div>
        <div className="h-6 w-16 rounded bg-gray-100"></div>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <div className="h-6 w-16 rounded bg-gray-100"></div>
          <div className="mt-2 h-6 w-24 rounded bg-gray-100"></div>
        </div>
        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-gray-100"></div>
          <div className="h-10 w-10 rounded bg-gray-100"></div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block w-full min-w-[700px] align-middle">
        <div className="rounded-lg bg-gray-50 border outline-2 md:pt-0">
          <div className="md:hidden">
            <MobileSkeleton />
            <MobileSkeleton />
            <MobileSkeleton />
            <MobileSkeleton />
            <MobileSkeleton />
            <MobileSkeleton />
          </div>
          <table className="hidden w-full md:table">
            <thead className="rounded-lg">
              <tr>
                <th scope="col" className="w-1/6 px-4 py-5 font-medium sm:pl-6">
                  <div
                    className={`${shimmer} relative h-8 overflow-hidden rounded-md bg-gray-200`}
                  />
                </th>
                <th scope="col" className="w-1/6 px-3 py-5 font-medium">
                  <div
                    className={`${shimmer} relative h-8 overflow-hidden rounded-md bg-gray-200`}
                  />
                </th>
                <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                  <div
                    className={`${shimmer} relative h-8 overflow-hidden rounded-md bg-gray-200`}
                  />
                </th>
                <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                  <div
                    className={`${shimmer} relative h-8 overflow-hidden rounded-md bg-gray-200`}
                  />
                </th>
                <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                  <div
                    className={`${shimmer} relative h-8 overflow-hidden rounded-md bg-gray-200`}
                  />
                </th>
                <th scope="col" className="w-1/8 px-3 py-5 font-medium">
                  <div
                    className={`${shimmer} relative h-8 overflow-hidden rounded-md bg-gray-200`}
                  />
                </th>
                <th scope="col" className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center py-3">
          <NavigateBeforeOutlined className="w-6 text-gray-200 mr-2" />
          <div className='h-10 w-10 rounded-md bg-gray-100'>{' '}</div>
          <NavigateNextOutlined className="w-6 text-gray-200 ml-2" />
        </div>
      </div>
    </div>
  )
}

export function FrontTabSkeleton() {
  return (
    <div className="w-24 px-2 py-1 h-8 rounded-t-lg border-solid font-medium bg-gray-50 border-x-2 border-t-2">
      <div
        className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
      />
    </div>
  );
}

export function BehindTabSkeleton() {
  return (
    <div className="w-24 px-2 py-1 h-8 rounded-t-lg border-solid font-medium bg-white border-2">
      <div
        className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
      />
    </div>
  );
}

export function EditItemSkeleton() {
  return (
    <div className="mb-4">
      <div className="mb-2 block h-8 w-24 bg-gray-200 rounded-md" />
      <div className="relative flex">
        <div className="mb-2 block h-8 w-full bg-white rounded-md" />
      </div>
    </div>
  )
}

export function EditSkeleton() {
  return (
    <div className='w-full p-2 flex flex-col md:flex-row border-b'>
      <div className='w-full md:w-1/3 pb-4 md:pr-6'>
        <div
          className={`${shimmer} h-10 w-64 mb-5 relative overflow-hidden rounded-xl bg-gray-200 p-2`}
        />
        <div
          className={`${shimmer} h-48 relative overflow-hidden rounded-xl bg-gray-100 p-2`}
        />
      </div>
      <div className='w-full flex flex-col md:w-2/3'>
        <EditItemSkeleton />
        <EditItemSkeleton />
        <EditItemSkeleton />
        <EditItemSkeleton />
      </div>
    </div>
  )
}

export function LastEditSkeleton() {
  return (
    <div className='w-full p-2 flex flex-col md:flex-row'>
      <div className='w-full md:w-1/3 pb-4 md:pr-6'>
        <div
          className={`${shimmer} h-10 w-64 mb-5 relative overflow-hidden rounded-xl bg-gray-200 p-2`}
        />
        <div
          className={`${shimmer} h-32 relative overflow-hidden rounded-xl bg-gray-100 p-2`}
        />
      </div>
      <div className='w-full flex flex-col md:w-2/3'>
        <EditItemSkeleton />
        <EditItemSkeleton />
      </div>
    </div>
  )
}

export function LongEditSkeleton() {
  return (
    <div className='w-full p-2 flex flex-col md:flex-row'>
      <div className='w-full md:w-1/3 pb-4 md:pr-6'>
        <div
          className={`${shimmer} h-10 w-64 mb-5 relative overflow-hidden rounded-xl bg-gray-200 p-2`}
        />
        <div
          className={`${shimmer} h-48 relative overflow-hidden rounded-xl bg-gray-100 p-2`}
        />
      </div>
      <div className='w-full flex flex-col md:w-2/3'>
        <EditItemSkeleton />
        <EditItemSkeleton />
        <EditItemSkeleton />
        <EditItemSkeleton />
        <EditItemSkeleton />
        <EditItemSkeleton />
        <EditItemSkeleton />
        <EditItemSkeleton />
      </div>
    </div>
  )
}

export function GroupSkeleton() {
  return (
    <div className='w-full px-2 pt-4 flex flex-col border-t-2'>
      <div className='w-full'>
        <div
            className={`${shimmer} h-10 w-64 mb-5 relative overflow-hidden rounded-xl bg-gray-200`}
          />
      </div>
      <div className='w-full flex'>
        <div className='h-96 flex-1 p-2 flex flex-col gap-2'>
          <div
            className={`${shimmer} h-10 w-64 mb-5 relative overflow-hidden rounded-xl bg-gray-200`}
          />
          <div className='h-full p-2 border rounded-lg bg-white' />
        </div>
        <div className='w-20 flex-0 flex flex-col justify-center'>
          <div className='h-8 border rounded-lg mb-2 mx-2 bg-gray-200' />
          <div className='h-8 border rounded-lg mx-2 bg-gray-200' />
        </div>
        <div className='h-96 flex-1 p-2 flex flex-col gap-2'>
          <div
            className={`${shimmer} h-10 w-64 mb-5 relative overflow-hidden rounded-xl bg-gray-200`}
          />
          <div className='h-full p-2 border rounded-lg bg-white' />
        </div>
      </div>
    </div>
  )
}
