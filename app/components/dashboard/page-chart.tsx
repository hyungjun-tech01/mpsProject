"use client";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  LinearScale,
  LineController,
  CategoryScale,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  LineController,
  CategoryScale
);

export default function PageChart({
  labels,
  ydata,
}: {
  labels: string[];
  ydata: number[];
}) {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Printed Pages",
        data: ydata,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0,
        borderWidth: 2,
        borderColor: "rgb(75,192,192,1)",
        fill: "start",
        backgroundColor: "rgb(75,192,192,0.3)",
      },
      point: {
        radius: 2,
        hitRadius: 2,
      },
    },
    scales: {
      xAxis: {
        display: false,
      },
      yAxis: {
        display: false,
      },
    },
  };

  return (
    <Line
        data={data}
        options={options}
        className="w-full"
    />
  );
}
