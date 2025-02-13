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

export default function LineChart({
  title,
  xlabels,
  ydata,
  maxY,
}: {
  title: string;
  xlabels: string[];
  ydata: number[];
  maxY: number;
}) {
  const addY = maxY >= 10000 ? 1000 : (
    maxY >= 1000 ? 100 : 10
  );
  const data = {
    labels: xlabels,
    datasets: [
      {
        label: title,
        data: ydata,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        display: true,
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
        radius: 5,
        hitRadius: 0,
      },
    },
    scales: {
      x: {
        display: true,
        offset: true,
      },
      y: {
        min: 0,
        suggestedMax: maxY + addY,
        display: true,
      },
    },
  };

  return (
    <Line
        data={data}
        options={options}
        className="w-full bg-white mt-5 mb-5"
    />
  );
}
