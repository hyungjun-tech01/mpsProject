import {
    PaidOutlined,
    AccountCircleOutlined,
    PrintOutlined,
    FileCopyOutlined,
    ErrorOutlined,
    WarningOutlined
  } from "@mui/icons-material";
  import clsx from 'clsx';

  const iconMap = {
    collected: PaidOutlined,
    users: AccountCircleOutlined,
    devices: PrintOutlined,
    pages: FileCopyOutlined,
    error: ErrorOutlined,
    warning: WarningOutlined
  };

  export default function Card({
    title,
    value,
    type,
    color,
    
  }: {
    title: string;
    value: number | string | object;
    type?: "users" | "devices" | "pages" | "collected" | "error" | "warning";
    color?: string;
  }) {
    const Icon = !!type ? iconMap[type] : null;
  
    return (
      <div className="flex-1 rounded-xl bg-gray-50 p-2 shadow-sm  border border-gray-300">
        <div className="flex p-4">
          {!!Icon && <Icon className={clsx("h-6 w-6", 
              {"text-gray-700": !color}, 
              {"text-red-500" : color === "red"},
              {"text-yellow-500" : color === "yellow"},
              {"text-blue-500" : color === "blue"},
            )} 
          />}
          <h3 className="ml-2 text-base text-sm">{title}</h3>
        </div>
        {typeof value !== 'object' &&
          <p className={`truncate rounded-xl bg-white px-4 py-6 text-center text-2xl`} >
            {value}
          </p>
        }
        {typeof value === 'object' &&
          <div className="flex flex-col bg-white">
            {
              value.map((item, idx) => {
                if (idx === value.length - 1) {
                  return (
                    <div key={idx} className="flex-1 flex justify-between truncate rounded-xl px-2 items-center" >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xl">{item.value}</div>
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} className="flex-1 flex justify-between truncate rounded-xl bg-white px-2 mb-2 items-center" >
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xl">{item.value}</div>
                    </div>
                  )
                }
              })
            }
          </div>
        }
      </div>
    );
  }
  