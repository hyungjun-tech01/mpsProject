"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
// import faker from 'faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// const labels = ["January", "February", "March", "April", "May", "June", "July"];

// export const data = {
//   labels: labels,
//   datasets: [
//     {
//       label: "Dataset 1",
//       // data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
//       data: labels,
//       backgroundColor: "rgba(255, 99, 132, 0.5)",
//     },
//     {
//       label: "Dataset 2",
//       // data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
//       data: labels,
//       backgroundColor: "rgba(53, 162, 235, 0.5)",
//     },
//   ],
// };

export default function VerticalBarChart({
  title,
  xlabels,
  dataSets,
  stack,
}:{
  title?: string;
  xlabels: string[];
  dataSets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
  stack: boolean;
}) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: !!title && title !== "",
        text: title?? "",
      },
    },
    scales: stack ? {
      x: {
        stacked: true,
      },
      y: {
        stacked: true
      }
    } : {},
  };
  const data = {
    labels:xlabels,
    datasets: dataSets,
  }
  // console.log("Vertical Chart Data :", data);
  return (
      <Bar options={options} data={data} />
  );
}
