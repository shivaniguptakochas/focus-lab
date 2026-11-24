/**
 * FocusLab - Master Application Controller
 * Manages SPA routing across all 15 views, UI state, timers, audio, tasks,
 * daily goals, virtual tree, distraction tracking, detox, experiment workflow,
 * quizzes, research reports, settings, and modal dialogs.
 */

class FocusLabApp {
  constructor() {
    this.currentView = 'overview';
    this.activeSessionContext = null; // Stored when timer finishes to feed into post-assessment
  }

  init() {
    this.bindNavigation();
    this.bindTheme();
    this.bindTimerUI();
    this.bindAudioUI();
    this.bindTasksUI();
    this.bindGoalsUI();
    this.bindDistractionUI();
    this.bindDetoxUI();
    this.bindChallengeUI();
    this.bindVirtualTreeUI();
    this.bindLeaderboardUI();
    this.bindAssistantUI();
    this.bindSettingsUI();
    this.bindExperimentUI();
    this.bindModals();

    // Initial View from URL hash or default to overview
    const hash = window.location.hash.replace('#', '') || 'overview';
    this.switchView(hash);

    // Initial Dashboard Update
    this.refreshAllUI();

    // Setup periodic refresh for dashboard stats and active tab screen time
    setInterval(() => {
      this.updateScreenTimeDisplay();
    }, 15000);

    // Check if first-time user
    const hasVisited = localStorage.getItem('focuslab_visited');
    if (!hasVisited) {
      this.showModal('modal-onboarding');
      localStorage.setItem('focuslab_visited', 'true');
    }
  }

  // --- SPA Navigation ---

  bindNavigation() {
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.getAttribute('data-view');
        if (viewId) {
          window.location.hash = viewId;
          this.switchView(viewId);
        }
      });
    });

    // Mobile Hamburger Toggle
    const mobileMenuBtn = document.getElementById('btn-mobile-menu');
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Listen to hashchange
    window.addEventListener('hashchange', () => {
      const viewId = window.location.hash.replace('#', '') || 'overview';
      this.switchView(viewId);
    });

    // Global quick action buttons
    document.querySelectorAll('[data-action="start-focus"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView('focus-room');
        if (window.focusTimer && window.focusTimer.state === 'idle') {
          window.focusTimer.start();
        }
      });
    });
    document.querySelectorAll('[data-action="start-pomodoro"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView('pomodoro');
        if (window.focusTimer) {
          window.focusTimer.setMode('pomodoro');
        }
      });
    });
    document.querySelectorAll('[data-action="open-experiment"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView('experiment');
      });
    });
  }

  switchView(viewId) {
    const validViews = [
      'overview', 'focus-room', 'pomodoro', 'tasks', 'goals',
      'distractions', 'detox', 'tree', 'analytics', 'history',
      'experiment', 'challenge', 'leaderboard', 'assistant', 'settings'
    ];

    if (!validViews.includes(viewId)) {
      viewId = 'overview';
    }

    this.currentView = viewId;

    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update views
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `view-${viewId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');

    // View specific updates
    if (viewId === 'overview') this.updateOverview();
    if (viewId === 'analytics') {
      this.updateAnalyticsView();
      setTimeout(() => {
        if (window.focusAnalytics) window.focusAnalytics.renderCharts();
      }, 100);
    }
    if (viewId === 'tree') this.updateVirtualTreeUI();
    if (viewId === 'history') this.renderHistoryTable();
    if (viewId === 'experiment') this.refreshExperimentView();
    if (viewId === 'leaderboard') this.renderLeaderboard();
  }

  // --- Theme Controller ---

  bindTheme() {
    const themeToggleBtn = document.getElementById('btn-theme-toggle');
    const settings = window.focusStorage ? window.focusStorage.getSettings() : { theme: 'dark' };

    if (settings.theme === 'light') {
      document.body.classList.add('light-theme');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '🌙 Dark Mode';
    } else {
      document.body.classList.remove('light-theme');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '☀️ Light Mode';
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeToggleBtn.innerHTML = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
        if (window.focusStorage) {
          window.focusStorage.saveSettings({ theme: isLight ? 'light' : 'dark' });
        }
        // Re-render charts with new theme colors if in analytics
        if (window.focusAnalytics) {
          setTimeout(() => window.focusAnalytics.renderCharts(), 150);
        }
      });
    }
  }

  // --- Timer UI Bindings ---

  bindTimerUI() {
    const timer = window.focusTimer;
    if (!timer) return;

    // Timer display elements
    const timeDisplay = document.getElementById('timer-time');
    const modeBadge = document.getElementById('timer-mode-badge');
    const btnStart = document.getElementById('btn-timer-start');
    const btnPause = document.getElementById('btn-timer-pause');
    const btnReset = document.getElementById('btn-timer-reset');
    const circleRing = document.getElementById('timer-progress-ring');

    // Preset duration buttons
    document.querySelectorAll('.btn-preset-time').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-mins'));
        if (mins) {
          document.querySelectorAll('.btn-preset-time').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          timer.setCustomDuration(mins);
        }
      });
    });

    // Custom duration input
    const customTimeInput = document.getElementById('input-custom-time');
    const btnApplyCustomTime = document.getElementById('btn-apply-custom-time');
    if (btnApplyCustomTime && customTimeInput) {
      btnApplyCustomTime.addEventListener('click', () => {
        const val = parseInt(customTimeInput.value);
        if (val && val > 0 && val <= 180) {
          timer.setCustomDuration(val);
          this.showToast(`Timer set to ${val} minutes`, 'info');
        }
      });
    }

    // Play, Pause, Reset
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        if (timer.state === 'idle') {
          // Open Pre-Study Assessment before starting first session
          this.showModal('modal-pre-assessment');
        } else if (timer.state === 'paused') {
          timer.resume();
        }
      });
    }

    if (btnPause) {
      btnPause.addEventListener('click', () => {
        timer.pause();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        timer.reset();
      });
    }

    // Timer Callback: onTick
    timer.onTickCallback = (data) => {
      if (timeDisplay) timeDisplay.textContent = data.formatted;
      
      // Update SVG ring
      if (circleRing) {
        const circumference = 2 * Math.PI * 130; // Radius = 130
        const strokeDashoffset = circumference - (data.progress * circumference);
        circleRing.style.strokeDashoffset = strokeDashoffset;
      }

      // Update document title for background productivity
      if (timer.state === 'running') {
        document.title = `(${data.formatted}) FocusLab`;
      } else {
        document.title = 'FocusLab - Study Smarter. Stay Focused.';
      }
    };

    // Timer Callback: onStateChange
    timer.onStateChangeCallback = (data) => {
      if (btnStart && btnPause) {
        if (data.state === 'running') {
          btnStart.style.display = 'none';
          btnPause.style.display = 'inline-flex';
        } else {
          btnStart.style.display = 'inline-flex';
          btnPause.style.display = 'none';
        }
      }

      if (modeBadge) {
        let label = 'Focus Mode';
        if (data.mode === 'pomodoro') {
          label = data.pomodoroPhase === 'work' ? 'Pomodoro Work' : (data.pomodoroPhase === 'shortBreak' ? 'Short Break' : 'Long Break');
        } else if (data.mode === 'detox') {
          label = 'Digital Detox';
        } else if (data.mode === 'challenge') {
          label = 'Focus Challenge';
        }
        modeBadge.textContent = label;
      }
    };

    // Timer Callback: onComplete
    timer.onCompleteCallback = (summary) => {
      this.activeSessionContext = summary;
      this.showToast(`🎉 Focus Session completed! Focus Score: ${summary.focusScore}`, 'success');
      
      // Prompt Post-Study Assessment
      this.showModal('modal-post-assessment');
      this.refreshAllUI();
    };

    // Pomodoro custom duration adjustments
    const inputPomoWork = document.getElementById('input-pomo-work');
    const inputPomoBreak = document.getElementById('input-pomo-break');
    const inputPomoLong = document.getElementById('input-pomo-long');
    const btnSavePomoSettings = document.getElementById('btn-save-pomo-settings');

    if (btnSavePomoSettings) {
      btnSavePomoSettings.addEventListener('click', () => {
        const w = parseInt(inputPomoWork.value) || 25;
        const b = parseInt(inputPomoBreak.value) || 5;
        const lb = parseInt(inputPomoLong.value) || 15;
        timer.customWorkMins = w;
        timer.customBreakMins = b;
        timer.customLongBreakMins = lb;
        if (timer.mode === 'pomodoro' && timer.state === 'idle') {
          timer.setMode('pomodoro');
        }
        this.showToast(`Pomodoro durations updated: ${w}m / ${b}m / ${lb}m`, 'success');
      });
    }

    // Pomodoro mode switch buttons
    const btnPomoStart = document.getElementById('btn-pomo-start');
    const btnPomoPause = document.getElementById('btn-pomo-pause');
    const btnPomoReset = document.getElementById('btn-pomo-reset');
    const pomoTimeDisplay = document.getElementById('pomo-timer-time');
    const pomoPhaseBadge = document.getElementById('pomo-phase-badge');
    const pomoCyclesDisplay = document.getElementById('pomo-cycles-count');

    if (btnPomoStart) {
      btnPomoStart.addEventListener('click', () => {
        timer.setMode('pomodoro');
        timer.start();
      });
    }
    if (btnPomoPause) {
      btnPomoPause.addEventListener('click', () => timer.pause());
    }
    if (btnPomoReset) {
      btnPomoReset.addEventListener('click', () => {
        timer.setMode('pomodoro');
        timer.reset();
      });
    }
  }

  // --- Audio UI Bindings ---

  bindAudioUI() {
    const audio = window.focusAudio;
    if (!audio) return;

    const ambientSelect = document.getElementById('select-ambient-sound');
    const btnToggleAmbient = document.getElementById('btn-toggle-ambient');
    const volumeSlider = document.getElementById('slider-ambient-volume');

    if (btnToggleAmbient && ambientSelect) {
      btnToggleAmbient.addEventListener('click', () => {
        if (audio.isPlayingAmbient) {
          audio.stopAmbient();
          btnToggleAmbient.innerHTML = '▶ Play';
          btnToggleAmbient.classList.remove('btn-active');
        } else {
          const type = ambientSelect.value;
          if (type !== 'none') {
            audio.startAmbient(type);
            btnToggleAmbient.innerHTML = '⏸ Pause';
            btnToggleAmbient.classList.add('btn-active');
            this.showToast(`Playing ambient ${type}`, 'info');
          } else {
            this.showToast('Please select a sound type first', 'warning');
          }
        }
      });

      ambientSelect.addEventListener('change', () => {
        if (audio.isPlayingAmbient) {
          audio.startAmbient(ambientSelect.value);
        }
      });
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        audio.setVolume(val);
      });
    }
  }

  // --- Task Manager UI Bindings ---

  bindTasksUI() {
    const btnAddTask = document.getElementById('btn-add-task');
    const taskInput = document.getElementById('input-new-task-title');
    const prioritySelect = document.getElementById('select-task-priority');
    const deadlineInput = document.getElementById('input-task-deadline');
    const categoryInput = document.getElementById('input-task-category');

    if (btnAddTask && taskInput) {
      btnAddTask.addEventListener('click', () => {
        const title = taskInput.value.trim();
        if (!title) {
          this.showToast('Please enter a task title', 'warning');
          return;
        }

        const priority = prioritySelect ? prioritySelect.value : 'medium';
        const deadline = deadlineInput && deadlineInput.value ? deadlineInput.value : 'Today';
        const category = categoryInput && categoryInput.value ? categoryInput.value : 'Study';

        window.focusStorage.addTask({
          title,
          priority,
          deadline,
          category
        });

        taskInput.value = '';
        this.renderTasks();
        this.updateOverview();
        this.showToast('Task added successfully', 'success');
      });
    }

    // Filter Buttons
    document.querySelectorAll('.btn-filter-task').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-filter-task').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        this.renderTasks(filter);
      });
    });

    this.renderTasks();
  }

  renderTasks(filter = 'all') {
    const container = document.getElementById('tasks-list-container');
    if (!container || !window.focusStorage) return;

    let tasks = window.focusStorage.getTasks();

    if (filter === 'active') tasks = tasks.filter(t => !t.completed);
    if (filter === 'completed') tasks = tasks.filter(t => t.completed);

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h4>No tasks found</h4>
          <p>You're all caught up! Add a new study task or reading assignment above.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(t => `
      <div class="task-card ${t.completed ? 'completed' : ''}" data-task-id="${t.id}">
        <div class="task-left">
          <input type="checkbox" class="task-check" ${t.completed ? 'checked' : ''} data-id="${t.id}">
          <div class="task-details">
            <span class="task-title ${t.completed ? 'strike' : ''}">${this.escapeHtml(t.title)}</span>
            <div class="task-meta">
              <span class="badge badge-priority-${t.priority}">${t.priority.toUpperCase()}</span>
              <span class="task-deadline">📅 ${this.escapeHtml(t.deadline)}</span>
              <span class="task-category">🏷️ ${this.escapeHtml(t.category || 'Study')}</span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-icon btn-delete-task" data-id="${t.id}" title="Delete Task">🗑️</button>
        </div>
      </div>
    `).join('');

    // Event listeners on checkboxes and delete buttons
    container.querySelectorAll('.task-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const isCompleted = e.target.checked;
        window.focusStorage.updateTask(id, { completed: isCompleted });
        this.renderTasks(filter);
        this.updateOverview();
        if (window.focusAudio) window.focusAudio.playChime('click');
      });
    });

    container.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        window.focusStorage.deleteTask(id);
        this.renderTasks(filter);
        this.updateOverview();
        this.showToast('Task removed', 'info');
      });
    });
  }

  // --- Daily Goals UI Bindings ---

  bindGoalsUI() {
    const targetInput = document.getElementById('input-daily-target-minutes');
    const btnSaveTarget = document.getElementById('btn-save-daily-target');

    if (btnSaveTarget && targetInput) {
      btnSaveTarget.addEventListener('click', () => {
        const mins = parseInt(targetInput.value);
        if (mins && mins >= 10 && mins <= 600) {
          window.focusStorage.setDailyTarget(mins);
          this.updateOverview();
          this.updateGoalsView();
          this.showToast(`Daily target set to ${mins} minutes`, 'success');
        } else {
          this.showToast('Target must be between 10 and 600 minutes', 'warning');
        }
      });
    }

    this.updateGoalsView();
  }

  updateGoalsView() {
    if (!window.focusAnalytics) return;
    const agg = window.focusAnalytics.getAggregates();

    const progressPercent = document.getElementById('goals-progress-percent');
    const progressBar = document.getElementById('goals-progress-bar');
    const completedText = document.getElementById('goals-completed-text');
    const remainingText = document.getElementById('goals-remaining-text');
    const targetDisplay = document.getElementById('goals-target-display');

    if (progressPercent) progressPercent.textContent = `${agg.todayGoalProgress}%`;
    if (progressBar) progressBar.style.width = `${agg.todayGoalProgress}%`;
    if (completedText) completedText.textContent = `${agg.todayMinutes} mins`;
    if (remainingText) remainingText.textContent = `${agg.remainingMinutes} mins`;
    if (targetDisplay) targetDisplay.textContent = `${agg.dailyTarget} mins`;
  }

  // --- Distraction Tracker UI Bindings ---

  bindDistractionUI() {
    // Quick log buttons
    document.querySelectorAll('.btn-log-distraction').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category');
        const note = prompt(`Add a note for this ${cat} interruption (optional):`, '');
        if (note !== null) {
          if (window.focusTimer && window.focusTimer.state === 'running') {
            window.focusTimer.logDistraction(cat, note);
          } else {
            window.focusStorage.logDistraction(cat, note);
          }
          this.renderDistractionList();
          this.showToast(`Logged distraction: ${cat}`, 'info');
          if (window.focusAudio) window.focusAudio.playChime('alert');
        }
      });
    });

    const btnClearDistractions = document.getElementById('btn-clear-distractions');
    if (btnClearDistractions) {
      btnClearDistractions.addEventListener('click', () => {
        if (confirm('Clear all distraction logs?')) {
          window.focusStorage.clearDistractions();
          this.renderDistractionList();
          this.showToast('Distraction history cleared', 'info');
        }
      });
    }

    this.renderDistractionList();
  }

  renderDistractionList() {
    const listContainer = document.getElementById('distractions-history-list');
    const counterBadge = document.getElementById('distraction-total-count');
    if (!listContainer || !window.focusStorage) return;

    const list = window.focusStorage.getDistractions();
    if (counterBadge) counterBadge.textContent = list.length;

    if (list.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛡️</div>
          <h4>No Distractions Recorded</h4>
          <p>Great job staying focused! When an interruption occurs, click any button above to log it.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = list.slice(0, 20).map(d => `
      <div class="distraction-item-row">
        <span class="badge badge-distraction-${d.category ? d.category.toLowerCase().replace(/\s+/g, '-') : 'other'}">${d.category}</span>
        <span class="distraction-note">${d.note ? this.escapeHtml(d.note) : 'No note provided'}</span>
        <span class="distraction-time">${d.timeFormatted || new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    `).join('');
  }

  // --- Digital Detox UI Bindings ---

  bindDetoxUI() {
    const btnStartDetox = document.getElementById('btn-start-detox');
    const detoxReminderModal = document.getElementById('modal-detox-active');
    const btnExitDetox = document.getElementById('btn-exit-detox');

    if (btnStartDetox) {
      btnStartDetox.addEventListener('click', () => {
        if (window.focusTimer) {
          window.focusTimer.setMode('detox');
          window.focusTimer.start();
          this.showModal('modal-detox-active');
          this.showToast('Digital Detox Mode Activated: Keep smartphone out of sight!', 'info');
        }
      });
    }

    if (btnExitDetox) {
      btnExitDetox.addEventListener('click', () => {
        this.hideModal('modal-detox-active');
        this.showToast('Detox session ended', 'info');
      });
    }
  }

  // --- Focus Challenge UI Bindings ---

  bindChallengeUI() {
    const btnStartChallenge = document.getElementById('btn-start-challenge');
    if (btnStartChallenge) {
      btnStartChallenge.addEventListener('click', () => {
        if (window.focusTimer) {
          this.switchView('focus-room');
          window.focusTimer.setMode('challenge');
          window.focusTimer.start();
          this.showToast('20-Minute Focus Challenge Started! Can you finish without checking your phone?', 'info');
        }
      });
    }
  }

  // --- Virtual Tree UI Bindings ---

  bindVirtualTreeUI() {
    this.updateVirtualTreeUI();
  }

  updateVirtualTreeUI() {
    if (!window.focusStorage) return;
    const tree = window.focusStorage.getTreeState();

    const stageNames = ['', 'Seed in Soil', 'Sprouting Seedling', 'Young Sapling', 'Growing Tree', 'Flourishing Oak'];
    const stageIcons = ['', '🌱', '🌿', '🪴', '🌳', '🌲'];

    const treeStageName = document.getElementById('tree-stage-name');
    const treeProgressVal = document.getElementById('tree-progress-val');
    const treeProgressBar = document.getElementById('tree-progress-bar');
    const treeTotalMins = document.getElementById('tree-total-minutes');
    const treeCountGrown = document.getElementById('tree-count-grown');
    const treeVisual = document.getElementById('tree-stage-visual');

    if (treeStageName) treeStageName.textContent = stageNames[tree.currentStage] || 'Sprout';
    if (treeProgressVal) treeProgressVal.textContent = `${tree.currentStageProgress}% to next stage`;
    if (treeProgressBar) treeProgressBar.style.width = `${tree.currentStageProgress}%`;
    if (treeTotalMins) treeTotalMins.textContent = `${tree.totalMinutes} min`;
    if (treeCountGrown) treeCountGrown.textContent = tree.treesGrown || 0;

    // SVG / Canvas rendering of tree
    if (treeVisual) {
      treeVisual.innerHTML = this.generateTreeSVG(tree.currentStage, tree.currentStageProgress);
    }
  }

  generateTreeSVG(stage, progress) {
    // Dynamic procedural SVG representing the 5 biological growth phases
    if (stage === 1) {
      return `
        <svg viewBox="0 0 200 200" class="tree-svg">
          <ellipse cx="100" cy="170" rx="60" ry="15" fill="#4B382A" />
          <circle cx="100" cy="155" r="14" fill="#D97706" />
          <path d="M100 141 Q 100 125 108 120" stroke="#10B981" stroke-width="4" fill="none" stroke-linecap="round" />
          <circle cx="108" cy="118" r="5" fill="#34D399" />
        </svg>
      `;
    } else if (stage === 2) {
      return `
        <svg viewBox="0 0 200 200" class="tree-svg">
          <ellipse cx="100" cy="170" rx="65" ry="16" fill="#3E2C1E" />
          <path d="M100 170 Q 100 130 100 100" stroke="#059669" stroke-width="6" fill="none" stroke-linecap="round" />
          <path d="M100 120 Q 80 105 75 95 Q 90 95 100 115" fill="#10B981" />
          <path d="M100 110 Q 120 95 125 85 Q 110 85 100 105" fill="#34D399" />
        </svg>
      `;
    } else if (stage === 3) {
      return `
        <svg viewBox="0 0 200 200" class="tree-svg">
          <ellipse cx="100" cy="175" rx="70" ry="16" fill="#2E2015" />
          <path d="M96 175 L98 90 L102 90 L104 175 Z" fill="#78350F" />
          <circle cx="100" cy="80" r="32" fill="#10B981" />
          <circle cx="82" cy="75" r="22" fill="#059669" />
          <circle cx="118" cy="75" r="22" fill="#34D399" />
        </svg>
      `;
    } else if (stage === 4) {
      return `
        <svg viewBox="0 0 200 200" class="tree-svg">
          <ellipse cx="100" cy="175" rx="75" ry="18" fill="#1E140D" />
          <path d="M93 175 L96 75 L104 75 L107 175 Z" fill="#78350F" />
          <path d="M97 105 Q 75 90 65 80" stroke="#78350F" stroke-width="5" fill="none" stroke-linecap="round" />
          <path d="M103 95 Q 125 80 135 70" stroke="#78350F" stroke-width="5" fill="none" stroke-linecap="round" />
          <circle cx="100" cy="60" r="40" fill="#10B981" />
          <circle cx="68" cy="75" r="26" fill="#059669" />
          <circle cx="132" cy="65" r="28" fill="#34D399" />
        </svg>
      `;
    } else {
      // Stage 5: Flourishing Mature Oak
      return `
        <svg viewBox="0 0 200 200" class="tree-svg flourishing">
          <ellipse cx="100" cy="180" rx="80" ry="18" fill="#150E09" />
          <path d="M90 180 Q 94 110 96 65 L 104 65 Q 106 110 110 180 Z" fill="#58240C" />
          <path d="M95 110 Q 60 90 50 75" stroke="#58240C" stroke-width="6" fill="none" stroke-linecap="round" />
          <path d="M105 100 Q 140 85 150 70" stroke="#58240C" stroke-width="6" fill="none" stroke-linecap="round" />
          <circle cx="100" cy="45" r="45" fill="#10B981" />
          <circle cx="60" cy="65" r="35" fill="#059669" />
          <circle cx="140" cy="55" r="35" fill="#34D399" />
          <circle cx="100" cy="75" r="30" fill="#047857" />
          <!-- Fruit / Leaves Sparkles -->
          <circle cx="85" cy="40" r="4" fill="#FBBF24" />
          <circle cx="120" cy="50" r="4" fill="#FBBF24" />
          <circle cx="65" cy="75" r="4" fill="#FBBF24" />
        </svg>
      `;
    }
  }

  // --- Leaderboard UI Bindings ---

  bindLeaderboardUI() {
    this.renderLeaderboard();
  }

  renderLeaderboard() {
    const tableBody = document.getElementById('leaderboard-table-body');
    if (!tableBody || !window.focusStorage) return;

    const list = window.focusStorage.get(STORAGE_KEYS.LEADERBOARD_DEMO, DEFAULT_LEADERBOARD);
    const agg = window.focusAnalytics ? window.focusAnalytics.getAggregates() : { totalMinutes: 0, completedSessions: 0 };

    // Inject current user into ranking dynamically
    const fullCohort = [...list];
    fullCohort.push({
      rank: 0,
      handle: 'You (Anonymous Student)',
      totalMinutes: agg.totalMinutes || 55,
      sessions: agg.completedSessions || 2,
      streak: agg.streak || 1,
      avatar: '🌟',
      isSelf: true
    });

    fullCohort.sort((a, b) => b.totalMinutes - a.totalMinutes);

    tableBody.innerHTML = fullCohort.map((u, idx) => `
      <tr class="${u.isSelf ? 'leaderboard-self-row' : ''}">
        <td class="rank-col"><strong>#${idx + 1}</strong></td>
        <td>
          <div class="user-handle-cell">
            <span class="user-avatar">${u.avatar}</span>
            <span class="handle-name">${this.escapeHtml(u.handle)}</span>
            ${u.isSelf ? '<span class="badge badge-self">YOU</span>' : ''}
          </div>
        </td>
        <td><strong>${u.totalMinutes}</strong> min</td>
        <td>${u.sessions} sessions</td>
        <td>🔥 ${u.streak} days</td>
      </tr>
    `).join('');
  }

  // --- AI Study Assistant UI Bindings ---

  bindAssistantUI() {
    const inputQuestion = document.getElementById('input-assistant-query');
    const btnSend = document.getElementById('btn-send-assistant-query');
    const chatContainer = document.getElementById('assistant-chat-messages');

    const handleSend = () => {
      const q = inputQuestion.value.trim();
      if (!q) return;

      this.appendAssistantMessage('user', q);
      inputQuestion.value = '';

      setTimeout(() => {
        const result = window.focusAssistant ? window.focusAssistant.ask(q) : null;
        if (result && result.response) {
          this.appendAssistantMessage('assistant', result.response.content, result.response.badge, result.response.title);
        }
      }, 300);
    };

    if (btnSend && inputQuestion) {
      btnSend.addEventListener('click', handleSend);
      inputQuestion.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    // Quick prompt pills
    document.querySelectorAll('.btn-prompt-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const promptText = pill.getAttribute('data-prompt');
        if (promptText && inputQuestion) {
          inputQuestion.value = promptText;
          handleSend();
        }
      });
    });

    // Timetable Generator
    const btnGenerateSchedule = document.getElementById('btn-generate-schedule');
    const inputSubjects = document.getElementById('input-schedule-subjects');
    const selectScheduleHours = document.getElementById('select-schedule-hours');
    const selectPeakTime = document.getElementById('select-schedule-peak');
    const scheduleResultBox = document.getElementById('schedule-result-box');

    if (btnGenerateSchedule && inputSubjects && scheduleResultBox) {
      btnGenerateSchedule.addEventListener('click', () => {
        const subjects = inputSubjects.value.trim() || 'Core Subject, Research, Problem Solving';
        const hours = selectScheduleHours ? selectScheduleHours.value : 4;
        const peak = selectPeakTime ? selectPeakTime.value : 'morning';

        const timetable = window.focusAssistant.generateTimetable(subjects, hours, peak);
        scheduleResultBox.innerHTML = `
          <div class="generated-schedule-card">
            <h4>📋 Optimized University Study Schedule (${timetable.totalHours} Hours)</h4>
            <div class="schedule-timeline">
              ${timetable.schedule.map(slot => `
                <div class="schedule-slot ${slot.type.toLowerCase()}">
                  <div class="slot-time">${slot.timeSlot}</div>
                  <div class="slot-content">
                    <strong>${this.escapeHtml(slot.activity)}</strong>
                    <p>${slot.tip}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        scheduleResultBox.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  appendAssistantMessage(sender, text, badge = null, title = null) {
    const container = document.getElementById('assistant-chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `chat-bubble chat-bubble-${sender}`;

    if (sender === 'assistant') {
      div.innerHTML = `
        <div class="assistant-header">
          <span class="bot-icon">🤖</span>
          <strong>${title || 'FocusLab Academic Assistant'}</strong>
          ${badge ? `<span class="badge badge-assistant">${badge}</span>` : ''}
        </div>
        <div class="assistant-body">${this.renderMarkdown(text)}</div>
      `;
    } else {
      div.innerHTML = `
        <div class="user-query">${this.escapeHtml(text)}</div>
      `;
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  // --- Settings UI Bindings ---

  bindSettingsUI() {
    const settings = window.focusStorage ? window.focusStorage.getSettings() : {};

    const toggleSound = document.getElementById('setting-sound-enabled');
    const toggleBreakAlerts = document.getElementById('setting-break-alerts');
    const toggleGoalAlerts = document.getElementById('setting-goal-alerts');
    const toggleDetoxReminders = document.getElementById('setting-detox-reminders');
    const btnClearAllData = document.getElementById('btn-clear-all-data');
    const btnExportDataJSON = document.getElementById('btn-export-all-data');

    if (toggleSound) {
      toggleSound.checked = settings.soundEnabled !== false;
      toggleSound.addEventListener('change', (e) => {
        window.focusStorage.saveSettings({ soundEnabled: e.target.checked });
        if (window.focusAudio) window.focusAudio.setEnabled(e.target.checked);
      });
    }

    if (toggleBreakAlerts) {
      toggleBreakAlerts.checked = settings.breakAlerts !== false;
      toggleBreakAlerts.addEventListener('change', (e) => {
        window.focusStorage.saveSettings({ breakAlerts: e.target.checked });
      });
    }

    if (toggleGoalAlerts) {
      toggleGoalAlerts.checked = settings.goalAlerts !== false;
      toggleGoalAlerts.addEventListener('change', (e) => {
        window.focusStorage.saveSettings({ goalAlerts: e.target.checked });
      });
    }

    if (toggleDetoxReminders) {
      toggleDetoxReminders.checked = settings.detoxReminders !== false;
      toggleDetoxReminders.addEventListener('change', (e) => {
        window.focusStorage.saveSettings({ detoxReminders: e.target.checked });
      });
    }

    if (btnClearAllData) {
      btnClearAllData.addEventListener('click', () => {
        if (confirm('⚠️ Are you sure you want to delete all FocusLab history, tasks, and research data? This cannot be undone.')) {
          window.focusStorage.clearAll();
          alert('Local storage reset to factory state.');
          window.location.reload();
        }
      });
    }

    if (btnExportDataJSON) {
      btnExportDataJSON.addEventListener('click', () => {
        const fullBackup = {
          sessions: window.focusStorage.getSessions(),
          tasks: window.focusStorage.getTasks(),
          goals: window.focusStorage.getGoalData(),
          distractions: window.focusStorage.getDistractions(),
          participants: window.focusStorage.getExperimentParticipants(),
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focuslab-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  // --- EXPERIMENTAL RESEARCH MODULE UI ---

  bindExperimentUI() {
    const exp = window.focusExperiment;
    if (!exp) return;

    // Participant Select Dropdown
    const selectParticipant = document.getElementById('select-exp-participant');
    if (selectParticipant) {
      selectParticipant.addEventListener('change', (e) => {
        exp.setParticipant(e.target.value);
        this.refreshExperimentView();
      });
    }

    // Consent Button
    const btnConsent = document.getElementById('btn-give-consent');
    if (btnConsent) {
      btnConsent.addEventListener('click', () => {
        exp.grantConsent();
        this.refreshExperimentView();
        this.showToast('Participant consent recorded voluntarily under BU100 ethics protocol', 'success');
      });
    }

    // Condition Switchers (A: Phone Free vs B: Normal Access)
    const btnSelectCondA = document.getElementById('btn-select-cond-a');
    const btnSelectCondB = document.getElementById('btn-select-cond-b');

    if (btnSelectCondA) {
      btnSelectCondA.addEventListener('click', () => {
        exp.currentCondition = 'A';
        exp.updatePassageForParticipant();
        this.refreshExperimentView();
      });
    }

    if (btnSelectCondB) {
      btnSelectCondB.addEventListener('click', () => {
        exp.currentCondition = 'B';
        exp.updatePassageForParticipant();
        this.refreshExperimentView();
      });
    }

    // Step 3 Pre-Assessment Trigger
    const btnExpPreAssessment = document.getElementById('btn-exp-pre-assessment');
    if (btnExpPreAssessment) {
      btnExpPreAssessment.addEventListener('click', () => {
        this.showModal('modal-exp-pre-assessment');
      });
    }

    // Step 5 Start 20-Minute Study Timer
    const btnStartExpStudy = document.getElementById('btn-start-exp-study');
    if (btnStartExpStudy) {
      btnStartExpStudy.addEventListener('click', () => {
        if (window.focusTimer) {
          window.focusTimer.setMode('experiment', 20);
          window.focusTimer.start();
          this.showModal('modal-exp-reading-session');
          this.renderReadingPassageInModal();
        }
      });
    }

    // Phone Check Observer Clicker
    const btnPhoneCheckPlus = document.getElementById('btn-phone-check-plus');
    const btnPhoneCheckMinus = document.getElementById('btn-phone-check-minus');
    const phoneCheckDisplay = document.getElementById('phone-check-count-display');

    if (btnPhoneCheckPlus && phoneCheckDisplay) {
      btnPhoneCheckPlus.addEventListener('click', () => {
        const count = exp.incrementPhoneCheck();
        phoneCheckDisplay.textContent = count;
        if (window.focusAudio) window.focusAudio.playChime('alert');
      });
    }

    if (btnPhoneCheckMinus && phoneCheckDisplay) {
      btnPhoneCheckMinus.addEventListener('click', () => {
        const count = exp.decrementPhoneCheck();
        phoneCheckDisplay.textContent = count;
      });
    }

    // Step 7 Launch Quiz Modal
    const btnLaunchQuiz = document.getElementById('btn-launch-exp-quiz');
    if (btnLaunchQuiz) {
      btnLaunchQuiz.addEventListener('click', () => {
        this.renderQuizModal();
        this.showModal('modal-exp-quiz');
      });
    }

    // Step 9 10-Minute Break Interval Timer
    const btnStartExpBreak = document.getElementById('btn-start-exp-break');
    if (btnStartExpBreak) {
      btnStartExpBreak.addEventListener('click', () => {
        if (window.focusTimer) {
          window.focusTimer.setMode('focus', 10);
          window.focusTimer.start();
          this.showToast('10-Minute Washout Break Started. Participant steps away before next condition.', 'info');
        }
      });
    }

    // CSV Export Button
    const btnExportCSV = document.getElementById('btn-export-exp-csv');
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', () => {
        const csv = window.focusStorage.exportExperimentCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FocusLab-BU100-Experiment-Data-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Experimental Data exported as CSV', 'success');
      });
    }

    // Demo Data Seeder Button
    const btnLoadDemoExp = document.getElementById('btn-load-demo-exp-data');
    if (btnLoadDemoExp) {
      btnLoadDemoExp.addEventListener('click', () => {
        if (confirm('Load verified BU100 Demonstration Cohort (10 Participants) for presentation?')) {
          window.focusStorage.loadDemoExperimentData();
          this.refreshExperimentView();
          this.showToast('BU100 Demonstration Dataset loaded (10 participants)', 'success');
        }
      });
    }

    const btnResetExpData = document.getElementById('btn-reset-exp-data');
    if (btnResetExpData) {
      btnResetExpData.addEventListener('click', () => {
        if (confirm('Reset Experiment Lab to fresh, unpopulated state?')) {
          window.focusStorage.resetExperimentParticipants();
          this.refreshExperimentView();
          this.showToast('Experiment data reset to empty state', 'info');
        }
      });
    }

    this.refreshExperimentView();
  }

  refreshExperimentView() {
    const exp = window.focusExperiment;
    if (!exp) return;

    const p = exp.getParticipant();
    if (!p) return;

    // Participant metadata
    const participantLabel = document.getElementById('exp-participant-label');
    const orderBadge = document.getElementById('exp-order-badge');
    const consentStatus = document.getElementById('exp-consent-status');
    const btnConsent = document.getElementById('btn-give-consent');
    const passageLabel = document.getElementById('exp-passage-label');

    if (participantLabel) participantLabel.textContent = `${p.id} (${p.assignedOrder === 'AB' ? 'Order: Phone-Free First' : 'Order: Normal-Access First'})`;
    if (orderBadge) orderBadge.textContent = `Condition Order: ${p.assignedOrder} | Passage: ${p.passageOrder}`;
    
    if (consentStatus && btnConsent) {
      if (p.consented) {
        consentStatus.innerHTML = '<span class="status-pill status-success">✓ Informed Consent Verified</span>';
        btnConsent.style.display = 'none';
      } else {
        consentStatus.innerHTML = '<span class="status-pill status-warning">⚠️ Awaiting Consent</span>';
        btnConsent.style.display = 'inline-block';
      }
    }

    if (passageLabel) {
      passageLabel.textContent = `${exp.activePassage.title} (${exp.activePassage.readTime})`;
    }

    // Condition button highlights
    const btnA = document.getElementById('btn-select-cond-a');
    const btnB = document.getElementById('btn-select-cond-b');
    if (btnA && btnB) {
      if (exp.currentCondition === 'A') {
        btnA.classList.add('btn-active');
        btnB.classList.remove('btn-active');
      } else {
        btnB.classList.add('btn-active');
        btnA.classList.remove('btn-active');
      }
    }

    // Condition status badges
    const statusCondA = document.getElementById('status-cond-a');
    const statusCondB = document.getElementById('status-cond-b');
    if (statusCondA) {
      statusCondA.innerHTML = p.conditionA && p.conditionA.completed 
        ? `<span class="badge badge-success">Done: Score ${p.conditionA.quizScore}/10 | Conc: ${p.conditionA.concentrationRating}/5</span>`
        : '<span class="badge badge-pending">Not Completed</span>';
    }
    if (statusCondB) {
      statusCondB.innerHTML = p.conditionB && p.conditionB.completed 
        ? `<span class="badge badge-success">Done: Score ${p.conditionB.quizScore}/10 | Conc: ${p.conditionB.concentrationRating}/5 | Checks: ${p.conditionB.phoneChecks}</span>`
        : '<span class="badge badge-pending">Not Completed</span>';
    }

    // Update Report & Statistical Comparison Table
    this.renderExperimentReport();
  }

  renderReadingPassageInModal() {
    const modalPassageContainer = document.getElementById('modal-passage-content');
    const modalPassageTitle = document.getElementById('modal-passage-title');
    const exp = window.focusExperiment;
    if (!exp || !modalPassageContainer) return;

    if (modalPassageTitle) modalPassageTitle.textContent = exp.activePassage.title;
    modalPassageContainer.innerHTML = this.renderMarkdown(exp.activePassage.text);
  }

  renderQuizModal() {
    const exp = window.focusExperiment;
    const container = document.getElementById('exp-quiz-questions-container');
    const title = document.getElementById('exp-quiz-modal-title');
    if (!exp || !container) return;

    if (title) title.textContent = `10-Question Knowledge Assessment (${exp.activePassage.category})`;

    container.innerHTML = exp.activeQuiz.map((q, qIndex) => `
      <div class="quiz-question-block" data-qid="${q.id}">
        <p class="quiz-q-title"><strong>Q${qIndex + 1}.</strong> ${this.escapeHtml(q.question)}</p>
        <div class="quiz-options-group">
          ${q.options.map((opt, optIndex) => `
            <label class="quiz-option-label">
              <input type="radio" name="quiz_q_${q.id}" value="${optIndex}" class="quiz-radio" data-qid="${q.id}" data-opt="${optIndex}">
              <span class="quiz-option-text">${this.escapeHtml(opt)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Attach change handlers
    container.querySelectorAll('.quiz-radio').forEach(r => {
      r.addEventListener('change', (e) => {
        const qid = parseInt(e.target.getAttribute('data-qid'));
        const opt = parseInt(e.target.getAttribute('data-opt'));
        exp.setQuizAnswer(qid, opt);
      });
    });

    // Submit button in quiz modal
    const btnSubmitQuiz = document.getElementById('btn-submit-exp-quiz');
    if (btnSubmitQuiz) {
      btnSubmitQuiz.onclick = () => {
        const answeredCount = Object.keys(exp.quizAnswers).length;
        if (answeredCount < 10) {
          if (!confirm(`You have answered ${answeredCount} of 10 questions. Submit anyway?`)) {
            return;
          }
        }
        this.hideModal('modal-exp-quiz');
        this.showModal('modal-exp-post-assessment');
      };
    }
  }

  renderExperimentReport() {
    const exp = window.focusExperiment;
    if (!exp) return;

    const stats = exp.calculateStatistics();
    const reportContainer = document.getElementById('exp-report-summary-cards');
    const tableBody = document.getElementById('exp-results-table-body');
    const interpretationBox = document.getElementById('exp-report-interpretation');

    if (!stats.hasData) {
      if (reportContainer) {
        reportContainer.innerHTML = `
          <div class="empty-state full-width">
            <div class="empty-icon">🔬</div>
            <h4>No Paired Experimental Data Available</h4>
            <p>To generate honest paired comparisons, participants must complete both Condition A (Phone-Free) and Condition B (Normal-Access). Click <strong>"Load BU100 Demonstration Cohort"</strong> above to inspect sample experimental records or run a live participant trial.</p>
          </div>
        `;
      }
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No experimental records completed yet.</td></tr>`;
      }
      if (interpretationBox) {
        interpretationBox.innerHTML = `
          <div class="alert alert-info">
            <strong>Scout Mindset & Calling Bullshit Notice:</strong> Awaiting trial data. We adhere to Julia Galef's Scout Mindset by refusing to extrapolate or fabricate conclusions before empirical observation is recorded.
          </div>
        `;
      }
      return;
    }

    // We have data! Render report summary cards
    if (reportContainer) {
      reportContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-label">Paired Participants</div>
          <div class="stat-value">${stats.pairedCount} <span class="stat-sub">/ 10 Enrolled</span></div>
          <div class="stat-footer text-muted">Within-Subject Counterbalanced</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Quiz: Phone-Free (A)</div>
          <div class="stat-value text-success">${stats.avgQuizA} <span class="stat-sub">/ 10</span></div>
          <div class="stat-footer">SD estimated across trials</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Quiz: Normal Access (B)</div>
          <div class="stat-value text-warning">${stats.avgQuizB} <span class="stat-sub">/ 10</span></div>
          <div class="stat-footer">Smartphone on desk</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Quiz Score Difference</div>
          <div class="stat-value ${stats.quizDiff >= 0 ? 'text-indigo' : 'text-danger'}">${stats.quizDiff >= 0 ? '+' : ''}${stats.quizDiff} pts</div>
          <div class="stat-footer">${stats.quizDiff >= 0 ? 'Phone-Free scored higher' : 'Normal Access scored higher'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Concentration Diff</div>
          <div class="stat-value text-emerald">${stats.concDiff >= 0 ? '+' : ''}${stats.concDiff} / 5</div>
          <div class="stat-footer">Self-reported focus rating</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Phone Checks (B)</div>
          <div class="stat-value text-rose">${stats.avgPhoneChecksB}</div>
          <div class="stat-footer">Observed interruptions per 20 min</div>
        </div>
      `;
    }

    // Render Paired Data Table
    if (tableBody) {
      tableBody.innerHTML = stats.pairedList.map(p => `
        <tr>
          <td><strong>${p.id}</strong></td>
          <td><span class="badge badge-neutral">${p.assignedOrder}</span></td>
          <td><strong class="text-success">${p.quizA}/10</strong></td>
          <td><strong class="text-warning">${p.quizB}/10</strong></td>
          <td><strong class="${parseFloat(p.quizDiff) >= 0 ? 'text-indigo' : 'text-danger'}">${parseFloat(p.quizDiff) >= 0 ? '+' : ''}${p.quizDiff}</strong></td>
          <td>${p.concA} vs ${p.concB} (${parseFloat(p.concDiff) >= 0 ? '+' : ''}${p.concDiff})</td>
          <td><span class="badge badge-distraction-calls">${p.checksB} checks</span></td>
        </tr>
      `).join('');
    }

    // Render Scientific Analysis & Book Alignments
    if (interpretationBox) {
      interpretationBox.innerHTML = `
        <div class="research-interpretation-card">
          <h4>📑 BU100 Project Research Interpretation & Methodological Discussion</h4>
          <p>
            Across our $N=${stats.pairedCount}$ paired participants, the phone-free study condition produced an average quiz score of <strong>${stats.avgQuizA}/10</strong> compared to <strong>${stats.avgQuizB}/10</strong> under normal smartphone access (a mean difference of <strong>${stats.quizDiff >= 0 ? '+' : ''}${stats.quizDiff} points</strong>). Self-reported concentration was similarly higher under the phone-free condition (+${stats.concDiff} on a 5-point scale).
          </p>
          <div class="book-alignment-grid">
            <div class="book-box">
              <h5>🔭 Scout Mindset (Julia Galef)</h5>
              <p>We actively sought to counter researcher confirmation bias. Notice that not every single participant exhibited a massive penalty in Condition B (e.g. some students managed 8/10 even with 3 phone checks). Accepting variance rather than cherry-picking only extreme examples embodies genuine scout inquiry.</p>
            </div>
            <div class="book-box">
              <h5>🐂 Calling Bullshit (Bergstrom & West)</h5>
              <p>With an experimental sample of $N=${stats.pairedCount}$, we cannot claim population-wide statistical generalizability. We emphasize that these results represent an exploratory educational trial subject to individual differences in baseline knowledge, motivation, and sleep fatigue.</p>
            </div>
            <div class="book-box">
              <h5>🧠 Thinking, Fast and Slow (Daniel Kahneman)</h5>
              <p>Observed phone checks averaged <strong>${stats.avgPhoneChecksB}</strong> in Condition B. This directly reflects System 1's automatic habit response to visual and auditory triggers, repeatedly draining the finite executive stamina of System 2 during academic comprehension.</p>
            </div>
          </div>
        </div>
      `;
    }

    // Refresh Experiment Charts
    if (window.focusAnalytics) {
      setTimeout(() => window.focusAnalytics.renderExperimentCharts(), 100);
    }
  }

  // --- Modals Controller ---

  bindModals() {
    // Modal Close Buttons
    document.querySelectorAll('.modal-close-btn, [data-dismiss="modal"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Pre-Study Assessment Submit
    const btnSubmitPreAssessment = document.getElementById('btn-submit-pre-assessment');
    if (btnSubmitPreAssessment) {
      btnSubmitPreAssessment.addEventListener('click', () => {
        const conc = document.querySelector('input[name="pre_concentration"]:checked');
        const dist = document.querySelector('input[name="pre_distraction"]:checked');
        this.hideModal('modal-pre-assessment');
        if (window.focusTimer) {
          window.focusTimer.start();
          this.showToast('Pre-study assessment recorded. Focus session active!', 'success');
        }
      });
    }

    // Post-Study Assessment Submit
    const btnSubmitPostAssessment = document.getElementById('btn-submit-post-assessment');
    if (btnSubmitPostAssessment) {
      btnSubmitPostAssessment.addEventListener('click', () => {
        const conc = document.querySelector('input[name="post_concentration"]:checked');
        const fatigue = document.querySelector('input[name="post_fatigue"]:checked');
        const feedbackInput = document.getElementById('post-session-feedback');

        const postConc = conc ? parseFloat(conc.value) : 4;
        const postFatigue = fatigue ? parseInt(fatigue.value) : 2;
        const feedback = feedbackInput ? feedbackInput.value : '';

        // Save into global storage
        if (this.activeSessionContext && window.focusStorage) {
          window.focusStorage.saveSession({
            ...this.activeSessionContext,
            postConcentration: postConc,
            mentalFatigue: postFatigue,
            feedback: feedback
          });
        }

        this.hideModal('modal-post-assessment');
        this.refreshAllUI();
        this.showToast('Post-study session recorded successfully!', 'success');
      });
    }

    // Experiment Pre-Assessment Submit
    const btnSubmitExpPre = document.getElementById('btn-submit-exp-pre');
    if (btnSubmitExpPre) {
      btnSubmitExpPre.addEventListener('click', () => {
        const conc = document.querySelector('input[name="exp_pre_conc"]:checked');
        const dist = document.querySelector('input[name="exp_pre_dist"]:checked');
        const energy = document.querySelector('input[name="exp_pre_energy"]:checked');

        if (window.focusExperiment) {
          window.focusExperiment.recordPreAssessment(
            conc ? conc.value : 3,
            dist ? dist.value : 2,
            energy ? energy.value : 3
          );
        }
        this.hideModal('modal-exp-pre-assessment');
        this.showToast('Step 3: Pre-study assessment saved for participant', 'success');
      });
    }

    // Experiment Post-Assessment Submit & Finalize Trial
    const btnSubmitExpPost = document.getElementById('btn-submit-exp-post');
    if (btnSubmitExpPost) {
      btnSubmitExpPost.addEventListener('click', () => {
        const conc = document.querySelector('input[name="exp_post_conc"]:checked');
        const fatigue = document.querySelector('input[name="exp_post_fatigue"]:checked');
        const perceived = document.getElementById('input-exp-perceived-distractions');
        const feedback = document.getElementById('input-exp-feedback');
        const manualQuizOverride = document.getElementById('input-manual-quiz-score');

        if (window.focusExperiment) {
          window.focusExperiment.recordPostAssessment(
            conc ? conc.value : 4,
            fatigue ? fatigue.value : 2,
            perceived ? perceived.value : 0,
            feedback ? feedback.value : ''
          );

          const overrideVal = manualQuizOverride && manualQuizOverride.value !== '' ? manualQuizOverride.value : null;
          window.focusExperiment.saveTrialResults(overrideVal);
        }

        this.hideModal('modal-exp-post-assessment');
        this.refreshExperimentView();
        this.refreshAllUI();
        this.showToast('Step 11: Experimental trial results verified and saved!', 'success');
      });
    }

    // Methodology & FAQ trigger links in header
    const btnOpenMethodology = document.getElementById('btn-open-methodology');
    if (btnOpenMethodology) {
      btnOpenMethodology.addEventListener('click', () => {
        this.showModal('modal-methodology');
      });
    }

    const btnOpenHelp = document.getElementById('btn-open-help');
    if (btnOpenHelp) {
      btnOpenHelp.addEventListener('click', () => {
        this.showModal('modal-help-faq');
      });
    }
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : (type === 'warning' ? '⚠️' : 'ℹ️')}</span>
      <span class="toast-text">${this.escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // --- Dashboard Data Refresh ---

  refreshAllUI() {
    this.updateOverview();
    this.updateGoalsView();
    this.updateVirtualTreeUI();
    this.renderTasks();
    this.renderDistractionList();
    this.renderLeaderboard();
    this.renderHistoryTable();
    this.updateScreenTimeDisplay();
  }

  updateOverview() {
    if (!window.focusAnalytics) return;
    const agg = window.focusAnalytics.getAggregates();

    const elTotalHours = document.getElementById('stat-total-hours');
    const elCompletedSessions = document.getElementById('stat-completed-sessions');
    const elAvgFocusScore = document.getElementById('stat-avg-focus-score');
    const elCurrentStreak = document.getElementById('stat-current-streak');
    const elTodayGoal = document.getElementById('stat-today-goal');
    const elActiveScreenTime = document.getElementById('stat-active-screen-time');

    if (elTotalHours) elTotalHours.textContent = `${agg.totalHours} hrs`;
    if (elCompletedSessions) elCompletedSessions.textContent = agg.completedSessions;
    if (elAvgFocusScore) elAvgFocusScore.textContent = `${agg.avgFocusScore}%`;
    if (elCurrentStreak) elCurrentStreak.textContent = `${agg.streak} days`;
    if (elTodayGoal) elTodayGoal.textContent = `${agg.todayMinutes} / ${agg.dailyTarget} m (${agg.todayGoalProgress}%)`;
    if (elActiveScreenTime) elActiveScreenTime.textContent = `${agg.activeAppMinutes} min`;

    // Overview Quick Task Preview
    const taskPreview = document.getElementById('overview-tasks-preview');
    if (taskPreview && window.focusStorage) {
      const activeTasks = window.focusStorage.getTasks().filter(t => !t.completed).slice(0, 4);
      if (activeTasks.length === 0) {
        taskPreview.innerHTML = '<p class="text-muted">No pending tasks. You are all caught up!</p>';
      } else {
        taskPreview.innerHTML = activeTasks.map(t => `
          <div class="overview-task-item">
            <span class="badge badge-priority-${t.priority}">${t.priority}</span>
            <span class="overview-task-title">${this.escapeHtml(t.title)}</span>
            <span class="overview-task-due">${this.escapeHtml(t.deadline)}</span>
          </div>
        `).join('');
      }
    }

    // Overview Recommendations
    const recsContainer = document.getElementById('overview-recommendations');
    if (recsContainer) {
      const recs = window.focusAnalytics.generateRecommendations();
      recsContainer.innerHTML = recs.slice(0, 3).map(r => `
        <div class="recommendation-mini-card">
          <div class="rec-icon">${r.icon}</div>
          <div class="rec-info">
            <strong>${r.title}</strong>
            <p>${r.description}</p>
          </div>
        </div>
      `).join('');
    }
  }

  updateAnalyticsView() {
    if (!window.focusAnalytics) return;
    const agg = window.focusAnalytics.getAggregates();
    const recs = window.focusAnalytics.generateRecommendations();

    const recsList = document.getElementById('analytics-recommendations-list');
    if (recsList) {
      recsList.innerHTML = recs.map(r => `
        <div class="recommendation-full-card">
          <div class="rec-icon-large">${r.icon}</div>
          <div class="rec-content">
            <h4>${r.title}</h4>
            <p>${r.description}</p>
          </div>
        </div>
      `).join('');
    }
  }

  renderHistoryTable() {
    const tableBody = document.getElementById('history-table-body');
    if (!tableBody || !window.focusStorage) return;

    const sessions = window.focusStorage.getSessions();
    if (sessions.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No study sessions recorded yet. Start a session in the Focus Room.</td></tr>`;
      return;
    }

    tableBody.innerHTML = sessions.map(s => `
      <tr>
        <td><strong>${s.date}</strong> <span class="text-muted">${new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
        <td><span class="badge badge-mode">${s.mode || 'Focus Room'}</span></td>
        <td>${s.duration || 0} min</td>
        <td>${s.distractions ? s.distractions.length : (s.distractionCount || 0)}</td>
        <td><strong class="text-indigo">${s.focusScore || 85} / 100</strong></td>
        <td><span class="badge badge-success">Completed</span></td>
        <td>
          <button class="btn-icon btn-delete-session" data-id="${s.id}" title="Delete Record">🗑️</button>
        </td>
      </tr>
    `).join('');

    tableBody.querySelectorAll('.btn-delete-session').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this study session record?')) {
          window.focusStorage.deleteSession(id);
          this.renderHistoryTable();
          this.updateOverview();
          this.showToast('Session record deleted', 'info');
        }
      });
    });
  }

  updateScreenTimeDisplay() {
    if (!window.focusStorage) return;
    const data = window.focusStorage.get('focuslab_screen_time', { todayActiveMinutes: 0 });
    const screenBadge = document.getElementById('header-screen-time');
    if (screenBadge) {
      screenBadge.textContent = `⏱️ In-App: ${data.todayActiveMinutes}m`;
    }
  }

  // --- Utility Helpers ---

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  renderMarkdown(md) {
    if (!md) return '';
    let html = md
      .replace(/^### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^## (.*$)/gim, '<h3>$1</h3>')
      .replace(/^# (.*$)/gim, '<h2>$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/gim, '</p><p>');

    return `<p>${html}</p>`;
  }
}

// Global App Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.focusLabApp = new FocusLabApp();
  window.focusLabApp.init();
});
