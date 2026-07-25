import { Doughnut } from "react-chartjs-2";
import { useContext } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);
import  {User_dataContext} from '../routs/CreateContext'
const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    const { width, ctx } = chart;

    const dataset = chart.data.datasets[0].data;
    const total = dataset.reduce((a, b) => a + b, 0);

    ctx.save();

    const centerX = chart.getDatasetMeta(0).data[0].x;
    const centerY = chart.getDatasetMeta(0).data[0].y;

    // styles
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff"

    // 🔴 Number (big)
    ctx.font = `${(width / 25).toFixed(0)}px sans-serif`;
    ctx.fillText(total, centerX, centerY - 10);

    // 🔴 "total" (small)
    ctx.font = `${(width / 25).toFixed(0)}px sans-serif`;
    ctx.fillText("total", centerX, centerY + 15);

    ctx.restore();
  },
};

export default function ProblemChart() {
  const {UserData, setUserData} = useContext(User_dataContext)
  const data = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [UserData?.submitStats?.acSubmissionNum?.[1]?.count ?? 0, UserData?.submitStats?.acSubmissionNum?.[2]?.count ?? 0, UserData?.submitStats?.acSubmissionNum?.[3]?.count ?? 0],
        backgroundColor: ["#22c55e", "#3b82f6", "#ef4444"],
        borderColor: "#0f172a",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
  maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right", // ✅ move to right
        labels: {
          color: "#fff",
          boxWidth: 20,
        },
      },
    },
    cutout: "50%", // donut thickness
  };

  return (
    <Doughnut
      data={data}
      options={options}
      plugins={[centerTextPlugin]} // ✅ add center text
    />
  );
}