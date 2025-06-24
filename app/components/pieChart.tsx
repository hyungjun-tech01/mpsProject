"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const bgColors = [
  "rgba(255, 99, 132, 0.2)",
  "rgba(54, 162, 235, 0.2)",
  "rgba(255, 206, 86, 0.2)",
  "rgba(75, 192, 192, 0.2)",
  "rgba(153, 102, 255, 0.2)",
  "rgba(255, 159, 64, 0.2)",
];
const bdColors = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
];

export default function PieChart({
  labels,
  dataSet,
}: {
  labels: string[];
  dataSet: {
    label: string;
    data: number[];
  }[];
}) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      }
    }
  };
  const inputData = {
    labels: labels,
    datasets: dataSet.map(item => ({
      label: item.label,
      data: item.data,
      backgroundColor: bgColors.slice(0, labels.length),
      borderColor: bdColors.slice(0, labels.length),
      borderWidth: 1,
    })),
  };
  return <Pie options={options} data={inputData} />;
}
