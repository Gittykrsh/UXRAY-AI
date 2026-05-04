const config = {
  type: 'line',
  data: {
    labels: ['Attempt 1','Attempt 2','Attempt 3','Attempt 4','Attempt 5','Attempt 6','Attempt 7','Attempt 8'],
    datasets: [{
      label: 'UX Score',
      data: [78,85,96,95,90,74,99,98],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.2)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: '#cbd5f5'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    }
  }
};