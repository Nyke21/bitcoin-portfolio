/**
 * Chart.js Setup - dynamische Datasets für N Assets
 */
var PortfolioChart = {
  chart: null,

  init: function() {
    this.buildChart();
  },

  buildChart: function() {
    var ctx = document.getElementById('mainChart');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    var labels = [t('today')];
    for (var i = 1; i <= AppState.years; i++) labels.push(t('year_short') + i);

    var datasets = [];

    // Dataset 0: Total (gold, filled)
    datasets.push({
      label: t('total_label'),
      data: [],
      borderColor: '#f7c948',
      backgroundColor: 'rgba(247,201,72,0.08)',
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: '#f7c948'
    });

    // Dataset 1..N: Individual assets (dashed)
    AppState.assets.forEach(function(a, i) {
      var color = StateManager.getColor(i);
      datasets.push({
        label: a.name,
        data: [],
        borderColor: color,
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color
      });
    });

    this.chart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        plugins: {
          legend: {
            labels: {
              color: '#6b7a8a',
              font: { family: "'Space Mono', monospace", size: 11 },
              boxWidth: 12, boxHeight: 12, padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#0d1318',
            borderColor: '#1a2330',
            borderWidth: 1,
            titleColor: '#6b7a8a',
            bodyColor: '#e8edf2',
            titleFont: { family: "'Space Mono', monospace", size: 10 },
            bodyFont: { family: "'Space Mono', monospace", size: 12 },
            padding: 14,
            callbacks: {
              label: function(c) {
                var v = c.raw;
                var s = Calc.sym();
                if (v >= 1e9) return ' ' + c.dataset.label + ': ' + s + (v / 1e9).toFixed(2) + 'B';
                if (v >= 1e6) return ' ' + c.dataset.label + ': ' + s + (v / 1e6).toFixed(2) + 'M';
                return ' ' + c.dataset.label + ': ' + s + Math.round(v).toLocaleString('de-DE');
              }
            }
          }
        },
        scales: {
          x: { grid: { color: '#1a2330' }, ticks: { color: '#6b7a8a', font: { family: "'Space Mono', monospace", size: 10 } } },
          y: {
            grid: { color: '#1a2330' },
            ticks: {
              color: '#6b7a8a',
              font: { family: "'Space Mono', monospace", size: 10 },
              callback: function(v) {
                var s = Calc.sym();
                if (v >= 1e9) return s + (v / 1e9).toFixed(1) + 'B';
                if (v >= 1e6) return s + (v / 1e6).toFixed(1) + 'M';
                return s + Math.round(v / 1000) + 'K';
              }
            }
          }
        }
      }
    });
  },

  update: function() {
    if (!this.chart) return;

    // Check if dataset count matches (N assets + 1 total)
    var expectedCount = AppState.assets.length + 1;
    if (this.chart.data.datasets.length !== expectedCount) {
      this.buildChart();
    }

    // Total array
    var totArr = [];
    var assetArrs = AppState.assets.map(function() { return []; });

    // Year 0 (today)
    var todayTotal = 0;
    AppState.assets.forEach(function(a, i) {
      var v = Calc.conv(a.price * a.quantity);
      assetArrs[i].push(v);
      todayTotal += v;
    });
    totArr.push(todayTotal);

    // Years 1-N
    for (var y = 1; y <= AppState.years; y++) {
      var d = Calc.calcYear(y);
      totArr.push(Calc.conv(d.total));
      d.assets.forEach(function(ad, i) {
        assetArrs[i].push(Calc.conv(ad.value));
      });
    }

    this.chart.data.datasets[0].data = totArr;
    this.chart.data.datasets[0].label = t('total_label');

    AppState.assets.forEach(function(a, i) {
      var ds = PortfolioChart.chart.data.datasets[i + 1];
      if (ds) {
        ds.data = assetArrs[i];
        ds.label = a.name;
        ds.borderColor = StateManager.getColor(i);
        ds.pointBackgroundColor = StateManager.getColor(i);
      }
    });

    // Update x-axis labels for language + year count
    var newLabels = [t('today')];
    for (var j = 1; j <= AppState.years; j++) {
      newLabels.push(t('year_short') + j);
    }
    this.chart.data.labels = newLabels;

    this.chart.update('none');
  }
};
