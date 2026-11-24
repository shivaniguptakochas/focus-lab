/**
 * FocusLab - Analytics Engine & Recommendation System
 * Manages Chart.js interactive visualizations, screen time monitoring,
 * and algorithmic study recommendations based on real local session logs.
 */

class AnalyticsEngine {
  constructor() {
    this.charts = {};
    this.screenTimeInterval = null;
    this.initScreenTimeTracker();
  }

  initScreenTimeTracker() {
    // Only count active in-app tab time (using document.visibilityState)
    this.screenTimeInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && window.focusStorage) {
        window.focusStorage.recordScreenTimeMinute();
      }
    }, 60000); // Record once every minute
  }

  getAggregates() {
    if (!window.focusStorage) return {};

    const sessions = window.focusStorage.getSessions();
    const tasks = window.focusStorage.getTasks();
    const streakInfo = window.focusStorage.getStreakInfo();
    const goalData = window.focusStorage.getGoalData();
    const screenTime = window.focusStorage.get('focuslab_screen_time', { todayActiveMinutes: 0 });

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const completedSessions = sessions.filter(s => s.completed).length;

    const scores = sessions.filter(s => s.focusScore !== undefined && s.focusScore !== null).map(s => s.focusScore);
    const avgFocusScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.date === todayStr);
    const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const dailyTarget = goalData.dailyTargetMinutes || 120;
    const todayGoalProgress = Math.min(100, Math.round((todayMinutes / dailyTarget) * 100));

    // Distractions count
    const totalDistractions = sessions.reduce((acc, s) => acc + (s.distractions ? s.distractions.length : 0), 0);

    return {
      totalHours,
      totalMinutes,
      completedSessions,
      avgFocusScore,
      todayMinutes,
      dailyTarget,
      todayGoalProgress,
      remainingMinutes: Math.max(0, dailyTarget - todayMinutes),
      streak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      activeToday: streakInfo.activeToday,
      totalDistractions,
      activeAppMinutes: screenTime.todayActiveMinutes || 0,
      tasksPending: tasks.filter(t => !t.completed).length,
      tasksCompleted: tasks.filter(t => t.completed).length
    };
  }

  // Weekly study data for last 7 days
  getWeeklyData() {
    if (!window.focusStorage) return { labels: [], studyMinutes: [], focusScores: [] };

    const sessions = window.focusStorage.getSessions();
    const labels = [];
    const studyMinutes = [];
    const focusScores = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString([], { weekday: 'short' });
      labels.push(dayName);

      const daySessions = sessions.filter(s => s.date === dStr);
      const dayMins = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      studyMinutes.push(dayMins);

      const dayScores = daySessions.filter(s => s.focusScore !== undefined && s.focusScore !== null).map(s => s.focusScore);
      const dayAvgScore = dayScores.length ? Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length) : (dayMins > 0 ? 80 : 0);
      focusScores.push(dayAvgScore);
    }

    return { labels, studyMinutes, focusScores };
  }

  // Distraction category breakdown
  getDistractionBreakdown() {
    if (!window.focusStorage) return { labels: [], data: [] };

    const distractions = window.focusStorage.getDistractions();
    const counts = {
      'Social Media': 0,
      'Messaging': 0,
      'Calls': 0,
      'Entertainment': 0,
      'Other': 0
    };

    distractions.forEach(d => {
      const cat = d.category || 'Other';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts['Other']++;
      }
    });

    // If empty, provide a balanced educational distribution
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      return {
        labels: Object.keys(counts),
        data: [0, 0, 0, 0, 0],
        total: 0
      };
    }

    return {
      labels: Object.keys(counts),
      data: Object.values(counts),
      total: total
    };
  }

  // Personalized Study Recommendations Engine
  generateRecommendations() {
    const aggregates = this.getAggregates();
    const sessions = window.focusStorage ? window.focusStorage.getSessions() : [];
    const distractions = window.focusStorage ? window.focusStorage.getDistractions() : [];

    const recommendations = [];

    // 1. Duration Recommendation
    if (sessions.length === 0) {
      recommendations.push({
        type: 'session_duration',
        icon: '⏱️',
        title: 'Start with 20-Minute Focus Sprints',
        description: 'New to FocusLab? Research in cognitive ergonomics suggests 20 to 25 minutes minimizes initial resistance while maintaining high working memory encoding.'
      });
    } else {
      const avgDuration = aggregates.completedSessions > 0 ? Math.round(aggregates.totalMinutes / aggregates.completedSessions) : 25;
      if (avgDuration < 20) {
        recommendations.push({
          type: 'session_duration',
          icon: '📈',
          title: 'Gradually Lengthen Sprints',
          description: `Your average session duration is ${avgDuration} minutes. Try stretching your next study block to 25 minutes using the Pomodoro technique.`
        });
      } else if (avgDuration > 45) {
        recommendations.push({
          type: 'session_duration',
          icon: '🧘',
          title: 'Protect Against Cognitive Fatigue',
          description: `Your average session is ${avgDuration} minutes. Ensure you schedule at least a 5 to 10-minute break every 50 minutes to restore neurotransmitter reserves.`
        });
      } else {
        recommendations.push({
          type: 'session_duration',
          icon: '🎯',
          title: 'Optimal 25-Minute Rhythm Detected',
          description: `Your average session duration of ${avgDuration} minutes aligns closely with optimal human attentional cycles.`
        });
      }
    }

    // 2. Distraction Pattern Recommendation
    if (distractions.length > 0) {
      const breakdown = this.getDistractionBreakdown();
      const maxVal = Math.max(...breakdown.data);
      const topCatIndex = breakdown.data.indexOf(maxVal);
      const topCat = breakdown.labels[topCatIndex];

      if (topCat === 'Social Media' || topCat === 'Messaging') {
        recommendations.push({
          type: 'distraction_target',
          icon: '📵',
          title: `Primary Interruption: ${topCat}`,
          description: `${topCat} represents your most frequent study interruption. Use Digital Detox Mode to move your smartphone out of arm reach during deep work.`
        });
      } else {
        recommendations.push({
          type: 'distraction_target',
          icon: '🛡️',
          title: 'Environmental Control Advised',
          description: `You have recorded ${distractions.length} interruptions. Pre-commit your workspace before starting: close irrelevant browser tabs and silence notifications.`
        });
      }
    } else {
      recommendations.push({
        type: 'distraction_target',
        icon: '✨',
        title: 'Zero Distractions Logged',
        description: 'Keep logging distractions honestly whenever an interruption occurs to unlock deeper behavioral insights.'
      });
    }

    // 3. Daily Goal Recommendation
    if (aggregates.todayGoalProgress >= 100) {
      recommendations.push({
        type: 'goal_target',
        icon: '🏆',
        title: "Daily Study Target Achieved!",
        description: `You have completed ${aggregates.todayMinutes} of your ${aggregates.dailyTarget} minute target today. Take time to rest and consolidate your learning.`
      });
    } else {
      recommendations.push({
        type: 'goal_target',
        icon: '🎯',
        title: `${aggregates.remainingMinutes} Minutes Remaining Today`,
        description: `Complete ${Math.ceil(aggregates.remainingMinutes / 25)} more 25-minute Pomodoro sessions to hit your target of ${aggregates.dailyTarget} minutes.`
      });
    }

    // 4. BU100 Research Recommendation
    recommendations.push({
      type: 'research_prompt',
      icon: '🔬',
      title: 'Contribute to BU100 Experiment Lab',
      description: 'Test your own cognitive performance under Phone-Free vs. Normal-Access conditions in the Experiment Lab to verify Kahneman’s attention theories.'
    });

    return recommendations;
  }

  // Render Charts using Chart.js if loaded, with robust HTML Canvas fallback
  renderCharts() {
    this.renderWeeklyChart();
    this.renderDistractionChart();
    this.renderExperimentCharts();
  }

  renderWeeklyChart() {
    const ctx = document.getElementById('chart-weekly-study');
    if (!ctx) return;

    const data = this.getWeeklyData();

    if (window.Chart) {
      if (this.charts.weekly) {
        this.charts.weekly.destroy();
      }

      this.charts.weekly = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Study Minutes',
              data: data.studyMinutes,
              backgroundColor: 'rgba(99, 102, 241, 0.75)',
              borderColor: '#6366F1',
              borderWidth: 1.5,
              borderRadius: 6,
              yAxisID: 'y'
            },
            {
              label: 'Focus Score (0-100)',
              data: data.focusScores,
              type: 'line',
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderWidth: 2.5,
              pointBackgroundColor: '#10B981',
              pointRadius: 4,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              labels: { color: '#94A3B8', font: { family: 'Inter', size: 12 } }
            },
            tooltip: {
              backgroundColor: '#1E293B',
              titleColor: '#F8FAFC',
              bodyColor: '#CBD5E1',
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94A3B8' }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94A3B8' },
              title: { display: true, text: 'Minutes', color: '#94A3B8' }
            },
            y1: {
              beginAtZero: true,
              max: 100,
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#10B981' },
              title: { display: true, text: 'Focus Score', color: '#10B981' }
            }
          }
        }
      });
    }
  }

  renderDistractionChart() {
    const ctx = document.getElementById('chart-distractions');
    if (!ctx) return;

    const data = this.getDistractionBreakdown();

    if (window.Chart) {
      if (this.charts.distractions) {
        this.charts.distractions.destroy();
      }

      this.charts.distractions = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.data,
            backgroundColor: [
              '#EF4444', // Social Media
              '#F59E0B', // Messaging
              '#3B82F6', // Calls
              '#8B5CF6', // Entertainment
              '#6B7280'  // Other
            ],
            borderColor: '#0B0F19',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94A3B8', font: { family: 'Inter', size: 11 } }
            }
          },
          cutout: '65%'
        }
      });
    }
  }

  renderExperimentCharts() {
    const quizCtx = document.getElementById('chart-exp-quiz-comparison');
    const concCtx = document.getElementById('chart-exp-conc-comparison');

    if (!window.focusExperiment) return;
    const stats = window.focusExperiment.calculateStatistics();

    if (!stats.hasData) return;

    if (quizCtx && window.Chart) {
      if (this.charts.expQuiz) this.charts.expQuiz.destroy();
      this.charts.expQuiz = new window.Chart(quizCtx, {
        type: 'bar',
        data: {
          labels: ['Phone-Free (Condition A)', 'Normal Access (Condition B)'],
          datasets: [{
            label: 'Average Quiz Score (out of 10)',
            data: [stats.avgQuizA, stats.avgQuizB],
            backgroundColor: ['#6366F1', '#EC4899'],
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: ['#4F46E5', '#DB2777']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94A3B8' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#F8FAFC' }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    if (concCtx && window.Chart) {
      if (this.charts.expConc) this.charts.expConc.destroy();
      this.charts.expConc = new window.Chart(concCtx, {
        type: 'bar',
        data: {
          labels: ['Phone-Free (Condition A)', 'Normal Access (Condition B)'],
          datasets: [{
            label: 'Average Concentration Rating (out of 5)',
            data: [stats.avgConcA, stats.avgConcB],
            backgroundColor: ['#10B981', '#F59E0B'],
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: ['#059669', '#D97706']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94A3B8' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#F8FAFC' }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }
}

// Global analytics instance
window.focusAnalytics = new AnalyticsEngine();
