// import { Revenue } from './definitions';

export const formatCurrency = (
  amount: number | string | null,
  locale: string = "ko"
) => {
  let currency = "KRW";
  let check_locale = "";

  switch (locale) {
    case "en":
      currency = "USD";
      check_locale = "en-US";
      break;
    default:
      check_locale = "ko-KR";
      break;
  }

  if(!amount) {
    const temp = 0;
    return temp.toLocaleString(check_locale, {
      style: "currency",
      currency: currency,
    });
  }

  return amount.toLocaleString(check_locale, {
    style: "currency",
    currency: currency,
  });
};

export const formatDateToLocal = (dateStr: string, locale: string = "ko") => {
  let check_locale = "";
  switch (locale) {
    case "en":
      check_locale = "en-US";
      break;
    default:
      check_locale = "ko-KR";
      break;
  }
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(check_locale, options);
  return formatter.format(date);
};

export const formatTimeToLocal = (dateStr: string, locale: string = "ko") => {
  let check_locale = "";
  switch (locale) {
    case "en":
      check_locale = "en-US";
      break;
    default:
      check_locale = "ko-KR";
      break;
  }

  
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(check_locale, options);
  try {
    return formatter.format(date);
  }
  catch(e){
    console.log('[Error] formatDate / input :', dateStr);
    console.log(' - converted :', date);
    return "";
  }
};

// export const generateYAxis = (revenue: Revenue[]) => {
//   // Calculate what labels we need to display on the y-axis
//   // based on highest record and in 1000s
//   const yAxisLabels = [];
//   const highestRecord = Math.max(...revenue.map((month) => month.revenue));
//   const topLabel = Math.ceil(highestRecord / 1000) * 1000;

//   for (let i = topLabel; i >= 0; i -= 1000) {
//     yAxisLabels.push(`$${i / 1000}K`);
//   }

//   return { yAxisLabels, topLabel };
// };

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const generateStrOf30Days = () => {
  const today = new Date();
  let xData: string[] = [];
  for (let i = 0; i < 30; i++) {
    const tempDay = new Date();
    tempDay.setDate(today.getDate() + i - 30);
    const tempDayStr = tempDay.toISOString().split("T")[0];
    xData.push(tempDayStr);
  }
  return xData;
};
