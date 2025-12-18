"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  ChartData,
  ChartOptions,
  ChartDataset,
} from "chart.js";
import { fNumber } from '@/utils/format-number';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip
);

// Mixed chart type (bar + line)
type MixedChartType = "bar" | "line";

const labels = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
];

const datasets: ChartDataset<MixedChartType, number[]>[] = [
  {
    type: "bar",
    label: "Thu",
    data: [400000, 300000, 200000, 278000, 189000, 239000, 349000, 200000, 278000, 189000, 239000, 349000],
    backgroundColor: "#10b981",
    borderRadius: 8,
    barPercentage: 0.6,
    categoryPercentage: 0.6,
  },
  {
    type: "bar",
    label: "Chi",
    data: [240000, 139000, 98000, 390800, 480000, 380000, 430000, 210000, 390800, 480000, 380000, 430000],
    backgroundColor: "#f43f5e",
    borderRadius: 8,
    barPercentage: 0.6,
    categoryPercentage: 0.6,
  },
  {
    type: "line",
    label: "Thu (line)",
    data: [400000, 300000, 200000, 278000, 189000, 239000, 349000, 200000, 278000, 189000, 239000, 349000],
    borderColor: "#10b981",
    backgroundColor: "#10b98133",
    borderWidth: 3,
    pointRadius: 5,
    tension: 0.4,
    fill: false,
    yAxisID: "y",
  },
  {
    type: "line",
    label: "Chi (line)",
    data: [240000, 139000, 98000, 390800, 480000, 380000, 430000, 210000, 390800, 480000, 380000, 430000],
    borderColor: "#f43f5e",
    backgroundColor: "#f43f5e33",
    borderWidth: 3,
    pointRadius: 5,
    tension: 0.4,
    fill: false,
    yAxisID: "y",
  },
];

const data: ChartData<MixedChartType> = {
  labels,
  datasets,
};

const options: ChartOptions<MixedChartType> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: { size: 13 },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          let label = ctx.dataset?.label || "";
          if (label) label += ": ";
          const value = ctx.parsed?.y ?? ctx.parsed;
          if (value !== null && value !== undefined) {
            label += fNumber(Number(value)) + " đ";
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 12 },
      },
    },
    y: {
      grid: { color: "#e5e7eb" },
      ticks: {
        font: { size: 12 },
        callback: (value: any) => {
          if (typeof value === "number") return fNumber(value);
          const num = Number(value);
          return Number.isNaN(num) ? value : fNumber(num);
        },
      },
    },
  },
};

export default function DashboardBarChart() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto h-[420px]">
  <Bar data={data as any} options={options as any} />
    </div>
  );
}
