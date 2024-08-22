import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register chart.js components
ChartJS.register(CategoryScale, PointElement, LinearScale, LineElement, Title, Tooltip, Legend);

const ChartComponent = ({ likesData, followersData }) => {
  // Format chart data
  const formatChartData = (data, label, color) => ({
    labels: data.map(item => {
      const date = new Date(item.week);    
      return date.toLocaleDateString('en-GB');
    }),
    datasets: [
      {
        label: label,
        data: data.map(item => item.count),
        fill: false,
        backgroundColor: `${color}80`,
        borderColor: color,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4, 
      },
    ],
  });

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#fff', 
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Chart Title',
        color: '#fff', 
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#fff', 
        },
        grid: {
          color: '#fff', 
        },
      },
      y: {
        ticks: {
          color: '#fff',
        },
        grid: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className='flex flex-col lg:flex-row w-full lg:w-fit xl:w-full gap-6 p-0 xl:flex-nowrap flex-wrap items-center justify-center mx-auto'>
      <div className='w-full xl:w-1/2 text-center bg-blue-600 p-4 rounded-md'>
        {/* Likes chart */}
        {likesData && (
          <Line
            data={formatChartData(likesData, 'Likes', 'rgba(255,255,0,1)')} // yellow line
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Likes Over Time',
                },
              },
            }}
          />
        )}
      </div>
      
      <div className='w-full xl:w-1/2 text-center bg-blue-600 p-4 rounded-md'>
        {/* Followers chart */}
        {followersData && (
          <Line
            data={formatChartData(followersData, 'Followers', 'rgba(0,255,0,1)')} // green line
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Followers Over Time',
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ChartComponent;