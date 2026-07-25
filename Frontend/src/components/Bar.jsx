import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
  } from 'chart.js';
  import { useContext } from 'react';
  import { Bar } from 'react-chartjs-2';
  import  {User_dataContext} from '../routs/CreateContext'
  // register components
  ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
  
  const BarChart = () => {
    const {UserData, setUserData} = useContext(User_dataContext)
    const data = {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [
        {
          data: [UserData?.submitStats?.acSubmissionNum?.[1]?.count ?? 0, UserData?.submitStats?.acSubmissionNum?.[2]?.count ?? 0, UserData?.submitStats?.acSubmissionNum?.[3]?.count ?? 0],
          backgroundColor: ['#10b981', '#3b82f6', '#ef4444'],
          borderRadius: 10,
          barThickness: 60
        }
      ]
    };
  
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: '#fff' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        x: {
          ticks: { color: '#fff' },
          grid: { display: false }
        }
      }
    };
  
    const plugins = [
      {
        id: 'valueOnTop',
        afterDatasetsDraw(chart) {
          const { ctx } = chart;
  
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
  
            meta.data.forEach((bar, index) => {
              const value = dataset.data[index];
  
              ctx.save();
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 16px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(value, bar.x, bar.y - 10);
            });
          });
        }
      }
    ];
  
    return <Bar data={data} options={options} plugins={plugins} />;
  };
  
  export default BarChart;