/**
 * FocusLab - Storage and State Management Layer
 * Handles local persistence, default initialization, session history,
 * task management, experimental research records, and CSV exports.
 */

const STORAGE_KEYS = {
  SESSIONS: 'focuslab_sessions',
  TASKS: 'focuslab_tasks',
  GOALS: 'focuslab_goals',
  DISTRACTIONS: 'focuslab_distractions',
  TREE: 'focuslab_tree',
  SETTINGS: 'focuslab_settings',
  SCREEN_TIME: 'focuslab_screen_time',
  EXPERIMENT_PARTICIPANTS: 'focuslab_exp_participants',
  EXPERIMENT_SETTINGS: 'focuslab_exp_settings',
  ACTIVE_SESSION: 'focuslab_active_session',
  LEADERBOARD_DEMO: 'focuslab_leaderboard_demo'
};

// Default Settings
const DEFAULT_SETTINGS = {
  theme: 'dark',
  soundEnabled: true,
  soundVolume: 0.6,
  breakAlerts: true,
  goalAlerts: true,
  detoxReminders: true,
  pomodoroWork: 25,
  pomodoroBreak: 5,
  pomodoroLongBreak: 15,
  autoStartBreaks: false,
  dailyGoalMinutes: 120
};

// 10 BU100 Participant Template with Counterbalanced Ordering
const DEFAULT_PARTICIPANTS = [
  { id: 'P01', assignedOrder: 'AB', passageOrder: 'P1-P2', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P02', assignedOrder: 'BA', passageOrder: 'P2-P1', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P03', assignedOrder: 'AB', passageOrder: 'P2-P1', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P04', assignedOrder: 'BA', passageOrder: 'P1-P2', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P05', assignedOrder: 'AB', passageOrder: 'P1-P2', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P06', assignedOrder: 'BA', passageOrder: 'P2-P1', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P07', assignedOrder: 'AB', passageOrder: 'P2-P1', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P08', assignedOrder: 'BA', passageOrder: 'P1-P2', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P09', assignedOrder: 'AB', passageOrder: 'P1-P2', consented: false, notes: '', conditionA: null, conditionB: null },
  { id: 'P10', assignedOrder: 'BA', passageOrder: 'P2-P1', consented: false, notes: '', conditionA: null, conditionB: null }
];

// Sample Initial Tasks for Student Experience
const DEFAULT_TASKS = [
  { id: 'task-1', title: 'BU100 Reading: Scout Mindset (Ch 1-3)', priority: 'high', deadline: 'Today', completed: false, category: 'BU100', createdAt: Date.now() - 3600000 * 24 },
  { id: 'task-2', title: 'Prepare Questionnaires for 10 Study Participants', priority: 'high', deadline: 'Tomorrow', completed: true, category: 'Research', createdAt: Date.now() - 3600000 * 48 },
  { id: 'task-3', title: 'Review Cognitive Load Working Memory Passage', priority: 'medium', deadline: 'In 2 days', completed: false, category: 'Study', createdAt: Date.now() - 3600000 * 12 },
  { id: 'task-4', title: 'Compile Experimental Trial Data into CSV', priority: 'medium', deadline: 'In 3 days', completed: false, category: 'Analytics', createdAt: Date.now() - 3600000 * 6 }
];

// Demo Peer Leaderboard Cohort
const DEFAULT_LEADERBOARD = [
  { rank: 1, handle: 'FocusScholar#42', totalMinutes: 340, sessions: 14, streak: 6, avatar: '🎓' },
  { rank: 2, handle: 'BennettBrain#19', totalMinutes: 295, sessions: 12, streak: 5, avatar: '⚡' },
  { rank: 3, handle: 'DeepWorkDev#07', totalMinutes: 260, sessions: 10, streak: 4, avatar: '🧠' },
  { rank: 4, handle: 'QuietMind#88', totalMinutes: 215, sessions: 9, streak: 3, avatar: '🌿' },
  { rank: 5, handle: 'ZenResearcher#31', totalMinutes: 180, sessions: 8, streak: 3, avatar: '📚' }
];

class StorageManager {
  constructor() {
    this.initDefaults();
  }

  initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      this.set(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPERIMENT_PARTICIPANTS)) {
      this.set(STORAGE_KEYS.EXPERIMENT_PARTICIPANTS, DEFAULT_PARTICIPANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      // Seed a couple of realistic demo sessions so dashboard has initial life
      const demoSessions = [
        {
          id: 'sess-seed-1',
          timestamp: Date.now() - 86400000,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          duration: 25,
          mode: 'Pomodoro',
          distractions: [{ category: 'Social Media', timestamp: Date.now() - 85000000 }],
          focusScore: 92,
          completed: true,
          preConcentration: 4,
          postConcentration: 4
        },
        {
          id: 'sess-seed-2',
          timestamp: Date.now() - 43200000,
          date: new Date(Date.now() - 43200000).toISOString().split('T')[0],
          duration: 30,
          mode: 'Focus Room',
          distractions: [{ category: 'Messaging', timestamp: Date.now() - 42000000 }, { category: 'Social Media', timestamp: Date.now() - 41000000 }],
          focusScore: 84,
          completed: true,
          preConcentration: 3,
          postConcentration: 4
        }
      ];
      this.set(STORAGE_KEYS.SESSIONS, demoSessions);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TREE)) {
      this.set(STORAGE_KEYS.TREE, {
        totalMinutes: 55,
        treesGrown: 0,
        currentStage: 2, // Sprout
        currentStageProgress: 55 // % towards next stage
      });
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      this.set(STORAGE_KEYS.GOALS, {
        dailyTargetMinutes: 120,
        history: {}
      });
    }
    if (!localStorage.getItem(STORAGE_KEYS.DISTRACTIONS)) {
      this.set(STORAGE_KEYS.DISTRACTIONS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCREEN_TIME)) {
      this.set(STORAGE_KEYS.SCREEN_TIME, {
        totalActiveMinutes: 0,
        todayActiveMinutes: 0,
        lastDate: new Date().toISOString().split('T')[0]
      });
    }
  }

  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Error writing ${key} to localStorage`, e);
      return false;
    }
  }

  // Session Methods
  getSessions() {
    return this.get(STORAGE_KEYS.SESSIONS, []);
  }

  saveSession(sessionData) {
    const sessions = this.getSessions();
    const newSession = {
      id: 'sess-' + Date.now(),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...sessionData
    };
    sessions.unshift(newSession);
    this.set(STORAGE_KEYS.SESSIONS, sessions);

    // Update Virtual Tree
    this.updateTreeGrowth(sessionData.duration || 0);

    // Update Goals
    this.recordGoalProgress(sessionData.duration || 0);

    return newSession;
  }

  deleteSession(id) {
    const sessions = this.getSessions().filter(s => s.id !== id);
    this.set(STORAGE_KEYS.SESSIONS, sessions);
    return sessions;
  }

  // Task Methods
  getTasks() {
    return this.get(STORAGE_KEYS.TASKS, []);
  }

  addTask(task) {
    const tasks = this.getTasks();
    const newTask = {
      id: 'task-' + Date.now(),
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      deadline: task.deadline || 'No deadline',
      category: task.category || 'General',
      completed: false,
      createdAt: Date.now()
    };
    tasks.unshift(newTask);
    this.set(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }

  updateTask(id, updates) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates };
      this.set(STORAGE_KEYS.TASKS, tasks);
      return tasks[idx];
    }
    return null;
  }

  deleteTask(id) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.set(STORAGE_KEYS.TASKS, tasks);
    return tasks;
  }

  // Distraction Methods
  getDistractions() {
    return this.get(STORAGE_KEYS.DISTRACTIONS, []);
  }

  logDistraction(category, note = '', sessionId = null) {
    const distractions = this.getDistractions();
    const entry = {
      id: 'dist-' + Date.now(),
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      category: category,
      note: note,
      sessionId: sessionId
    };
    distractions.unshift(entry);
    this.set(STORAGE_KEYS.DISTRACTIONS, distractions);
    return entry;
  }

  clearDistractions() {
    this.set(STORAGE_KEYS.DISTRACTIONS, []);
  }

  // Virtual Tree Growth Logic
  getTreeState() {
    return this.get(STORAGE_KEYS.TREE, {
      totalMinutes: 0,
      treesGrown: 0,
      currentStage: 1,
      currentStageProgress: 0
    });
  }

  updateTreeGrowth(addedMinutes) {
    const tree = this.getTreeState();
    tree.totalMinutes = (tree.totalMinutes || 0) + addedMinutes;

    // A full tree requires 120 focus minutes across 5 stages:
    // Stage 1: Seed (0 - 24 min)
    // Stage 2: Sprout (25 - 49 min)
    // Stage 3: Sapling (50 - 74 min)
    // Stage 4: Young Tree (75 - 99 min)
    // Stage 5: Mature Oak (100 - 120 min)
    const minutesInCurrentCycle = tree.totalMinutes % 120;
    tree.treesGrown = Math.floor(tree.totalMinutes / 120);

    if (minutesInCurrentCycle < 25) {
      tree.currentStage = 1;
      tree.currentStageProgress = Math.round((minutesInCurrentCycle / 25) * 100);
    } else if (minutesInCurrentCycle < 50) {
      tree.currentStage = 2;
      tree.currentStageProgress = Math.round(((minutesInCurrentCycle - 25) / 25) * 100);
    } else if (minutesInCurrentCycle < 75) {
      tree.currentStage = 3;
      tree.currentStageProgress = Math.round(((minutesInCurrentCycle - 50) / 25) * 100);
    } else if (minutesInCurrentCycle < 100) {
      tree.currentStage = 4;
      tree.currentStageProgress = Math.round(((minutesInCurrentCycle - 75) / 25) * 100);
    } else {
      tree.currentStage = 5;
      tree.currentStageProgress = Math.round(((minutesInCurrentCycle - 100) / 20) * 100);
    }

    this.set(STORAGE_KEYS.TREE, tree);
    return tree;
  }

  // Daily Goal Progress
  getGoalData() {
    return this.get(STORAGE_KEYS.GOALS, {
      dailyTargetMinutes: 120,
      history: {}
    });
  }

  recordGoalProgress(minutes) {
    const goalData = this.getGoalData();
    const today = new Date().toISOString().split('T')[0];
    if (!goalData.history[today]) {
      goalData.history[today] = 0;
    }
    goalData.history[today] += minutes;
    this.set(STORAGE_KEYS.GOALS, goalData);
    return goalData;
  }

  setDailyTarget(targetMinutes) {
    const goalData = this.getGoalData();
    goalData.dailyTargetMinutes = targetMinutes;
    this.set(STORAGE_KEYS.GOALS, goalData);
    return goalData;
  }

  // Streak Calculation
  getStreakInfo() {
    const sessions = this.getSessions().filter(s => s.completed);
    if (!sessions.length) {
      return { currentStreak: 0, longestStreak: 0, activeToday: false };
    }

    const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const activeToday = uniqueDates.includes(today);
    let currentStreak = 0;
    let checkDate = activeToday ? new Date(today) : new Date(yesterday);

    if (activeToday || uniqueDates.includes(yesterday)) {
      for (const d of uniqueDates) {
        const expectedStr = checkDate.toISOString().split('T')[0];
        if (d === expectedStr) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (d < expectedStr) {
          break;
        }
      }
    }

    // Longest streak calculation
    let longestStreak = currentStreak;
    let tempStreak = 1;
    const sortedAsc = [...uniqueDates].sort();
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1]);
      const curr = new Date(sortedAsc[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
    }

    return { currentStreak, longestStreak, activeToday };
  }

  // Screen Time Tracker (FocusLab in-app active tab only)
  recordScreenTimeMinute() {
    const data = this.get(STORAGE_KEYS.SCREEN_TIME, {
      totalActiveMinutes: 0,
      todayActiveMinutes: 0,
      lastDate: new Date().toISOString().split('T')[0]
    });
    const today = new Date().toISOString().split('T')[0];
    if (data.lastDate !== today) {
      data.todayActiveMinutes = 0;
      data.lastDate = today;
    }
    data.todayActiveMinutes += 1;
    data.totalActiveMinutes += 1;
    this.set(STORAGE_KEYS.SCREEN_TIME, data);
    return data;
  }

  // Settings
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    this.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // EXPERIMENTAL MODULE DATA MANAGEMENT
  getExperimentParticipants() {
    return this.get(STORAGE_KEYS.EXPERIMENT_PARTICIPANTS, DEFAULT_PARTICIPANTS);
  }

  getParticipant(id) {
    const list = this.getExperimentParticipants();
    return list.find(p => p.id === id) || null;
  }

  saveParticipant(participantData) {
    const list = this.getExperimentParticipants();
    const idx = list.findIndex(p => p.id === participantData.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...participantData };
    } else {
      list.push(participantData);
    }
    this.set(STORAGE_KEYS.EXPERIMENT_PARTICIPANTS, list);
    return list[idx];
  }

  updateParticipantCondition(participantId, conditionKey, conditionData) {
    const list = this.getExperimentParticipants();
    const idx = list.findIndex(p => p.id === participantId);
    if (idx !== -1) {
      list[idx][conditionKey] = {
        ...conditionData,
        completedAt: Date.now(),
        dateStr: new Date().toISOString()
      };
      this.set(STORAGE_KEYS.EXPERIMENT_PARTICIPANTS, list);
      return list[idx];
    }
    return null;
  }

  resetExperimentParticipants() {
    this.set(STORAGE_KEYS.EXPERIMENT_PARTICIPANTS, DEFAULT_PARTICIPANTS);
    return DEFAULT_PARTICIPANTS;
  }

  // Export Experiment Data as CSV
  exportExperimentCSV() {
    const participants = this.getExperimentParticipants();
    const headers = [
      'Participant_ID',
      'Assigned_Order',
      'Passage_Order',
      'Consent_Obtained',
      // Condition A (Phone-Free)
      'CondA_Completed',
      'CondA_Passage_Num',
      'CondA_Duration_Min',
      'CondA_Quiz_Score_10',
      'CondA_Concentration_5',
      'CondA_Pre_Concentration_5',
      'CondA_Pre_Distraction_5',
      'CondA_Mental_Fatigue_5',
      'CondA_Phone_Checks_Observed',
      'CondA_Notes',
      // Condition B (Normal Phone Access)
      'CondB_Completed',
      'CondB_Passage_Num',
      'CondB_Duration_Min',
      'CondB_Quiz_Score_10',
      'CondB_Concentration_5',
      'CondB_Pre_Concentration_5',
      'CondB_Pre_Distraction_5',
      'CondB_Mental_Fatigue_5',
      'CondB_Phone_Checks_Observed',
      'CondB_Notes',
      // Paired Differences
      'Quiz_Difference_A_minus_B',
      'Concentration_Difference_A_minus_B'
    ];

    const rows = participants.map(p => {
      const a = p.conditionA || {};
      const b = p.conditionB || {};
      const quizDiff = (a.quizScore !== null && a.quizScore !== undefined && b.quizScore !== null && b.quizScore !== undefined) 
        ? (a.quizScore - b.quizScore).toFixed(1) : 'NA';
      const concDiff = (a.concentrationRating !== null && a.concentrationRating !== undefined && b.concentrationRating !== null && b.concentrationRating !== undefined)
        ? (a.concentrationRating - b.concentrationRating).toFixed(1) : 'NA';

      return [
        p.id,
        p.assignedOrder,
        p.passageOrder,
        p.consented ? 'Yes' : 'No',
        a.completed ? 'Yes' : 'No',
        a.passageNum || 'NA',
        a.durationMinutes || 'NA',
        a.quizScore !== null && a.quizScore !== undefined ? a.quizScore : 'NA',
        a.concentrationRating || 'NA',
        a.preAssessment ? a.preAssessment.concentration : 'NA',
        a.preAssessment ? a.preAssessment.distractionLevel : 'NA',
        a.postAssessment ? a.postAssessment.mentalFatigue : 'NA',
        a.phoneChecks !== undefined ? a.phoneChecks : 0,
        `"${(a.notes || '').replace(/"/g, '""')}"`,
        b.completed ? 'Yes' : 'No',
        b.passageNum || 'NA',
        b.durationMinutes || 'NA',
        b.quizScore !== null && b.quizScore !== undefined ? b.quizScore : 'NA',
        b.concentrationRating || 'NA',
        b.preAssessment ? b.preAssessment.concentration : 'NA',
        b.preAssessment ? b.preAssessment.distractionLevel : 'NA',
        b.postAssessment ? b.postAssessment.mentalFatigue : 'NA',
        b.phoneChecks !== undefined ? b.phoneChecks : 0,
        `"${(b.notes || '').replace(/"/g, '""')}"`,
        quizDiff,
        concDiff
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    return csvContent;
  }

  // Load Seed Demonstration Data for Testing & Presentation
  loadDemoExperimentData() {
    const demoParticipants = [
      {
        id: 'P01', assignedOrder: 'AB', passageOrder: 'P1-P2', consented: true, notes: 'Compliant with protocol. Engaged reading.',
        conditionA: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 9, concentrationRating: 4.5, phoneChecks: 0, preAssessment: { concentration: 4, distractionLevel: 2 }, postAssessment: { mentalFatigue: 2, perceivedDistractions: 0 }, notes: 'Smooth session' },
        conditionB: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 7, concentrationRating: 3.0, phoneChecks: 5, preAssessment: { concentration: 3, distractionLevel: 3 }, postAssessment: { mentalFatigue: 4, perceivedDistractions: 6 }, notes: 'Checked Instagram notifications twice' }
      },
      {
        id: 'P02', assignedOrder: 'BA', passageOrder: 'P2-P1', consented: true, notes: 'Started with Condition B.',
        conditionA: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 8, concentrationRating: 4.0, phoneChecks: 0, preAssessment: { concentration: 4, distractionLevel: 2 }, postAssessment: { mentalFatigue: 3, perceivedDistractions: 0 }, notes: 'High focus' },
        conditionB: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 6, concentrationRating: 2.5, phoneChecks: 7, preAssessment: { concentration: 3, distractionLevel: 4 }, postAssessment: { mentalFatigue: 4, perceivedDistractions: 8 }, notes: 'Multiple WhatsApp vibrations' }
      },
      {
        id: 'P03', assignedOrder: 'AB', passageOrder: 'P2-P1', consented: true, notes: 'Participant reported feeling rested.',
        conditionA: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 8, concentrationRating: 4.5, phoneChecks: 0, preAssessment: { concentration: 4, distractionLevel: 1 }, postAssessment: { mentalFatigue: 2, perceivedDistractions: 0 }, notes: 'No distractions observed' },
        conditionB: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 7, concentrationRating: 3.5, phoneChecks: 4, preAssessment: { concentration: 4, distractionLevel: 2 }, postAssessment: { mentalFatigue: 3, perceivedDistractions: 3 }, notes: 'Glanced at screen during passage reading' }
      },
      {
        id: 'P04', assignedOrder: 'BA', passageOrder: 'P1-P2', consented: true, notes: 'Phone kept on silent during Condition B, but visible on desk.',
        conditionA: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 9, concentrationRating: 5.0, phoneChecks: 0, preAssessment: { concentration: 5, distractionLevel: 1 }, postAssessment: { mentalFatigue: 2, perceivedDistractions: 0 }, notes: 'Deep immersion' },
        conditionB: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 8, concentrationRating: 3.5, phoneChecks: 3, preAssessment: { concentration: 4, distractionLevel: 3 }, postAssessment: { mentalFatigue: 3, perceivedDistractions: 4 }, notes: 'Unlocked phone once for 45s' }
      },
      {
        id: 'P05', assignedOrder: 'AB', passageOrder: 'P1-P2', consented: true, notes: 'Within-subject trial completed in quiet lab room.',
        conditionA: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 7, concentrationRating: 4.0, phoneChecks: 0, preAssessment: { concentration: 3, distractionLevel: 2 }, postAssessment: { mentalFatigue: 3, perceivedDistractions: 1 }, notes: 'Good attention retention' },
        conditionB: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 6, concentrationRating: 2.5, phoneChecks: 6, preAssessment: { concentration: 3, distractionLevel: 4 }, postAssessment: { mentalFatigue: 4, perceivedDistractions: 5 }, notes: 'Scrolled Reddit during transition' }
      },
      {
        id: 'P06', assignedOrder: 'BA', passageOrder: 'P2-P1', consented: true, notes: 'Reported slight afternoon fatigue.',
        conditionA: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 8, concentrationRating: 3.5, phoneChecks: 0, preAssessment: { concentration: 3, distractionLevel: 2 }, postAssessment: { mentalFatigue: 3, perceivedDistractions: 0 }, notes: 'Consistent pacing' },
        conditionB: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 7, concentrationRating: 3.0, phoneChecks: 4, preAssessment: { concentration: 3, distractionLevel: 3 }, postAssessment: { mentalFatigue: 4, perceivedDistractions: 4 }, notes: 'Checked news alerts' }
      },
      {
        id: 'P07', assignedOrder: 'AB', passageOrder: 'P2-P1', consented: true, notes: 'Regular Pomodoro user outside experiment.',
        conditionA: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 10, concentrationRating: 5.0, phoneChecks: 0, preAssessment: { concentration: 5, distractionLevel: 1 }, postAssessment: { mentalFatigue: 1, perceivedDistractions: 0 }, notes: 'Perfect score on Passage 2' },
        conditionB: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 8, concentrationRating: 3.5, phoneChecks: 5, preAssessment: { concentration: 4, distractionLevel: 2 }, postAssessment: { mentalFatigue: 3, perceivedDistractions: 5 }, notes: 'Re-read sections after checking phone' }
      },
      {
        id: 'P08', assignedOrder: 'BA', passageOrder: 'P1-P2', consented: true, notes: 'Noticed attention fragmentation during condition B.',
        conditionA: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 8, concentrationRating: 4.0, phoneChecks: 0, preAssessment: { concentration: 4, distractionLevel: 2 }, postAssessment: { mentalFatigue: 2, perceivedDistractions: 0 }, notes: 'Attentive reading' },
        conditionB: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 6, concentrationRating: 2.0, phoneChecks: 8, preAssessment: { concentration: 3, distractionLevel: 4 }, postAssessment: { mentalFatigue: 5, perceivedDistractions: 9 }, notes: 'Frequent screen light-ups' }
      },
      {
        id: 'P09', assignedOrder: 'AB', passageOrder: 'P1-P2', consented: true, notes: 'Steady reader with good note-taking habits.',
        conditionA: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 9, concentrationRating: 4.5, phoneChecks: 0, preAssessment: { concentration: 4, distractionLevel: 1 }, postAssessment: { mentalFatigue: 2, perceivedDistractions: 0 }, notes: 'Completed reading in 14 min' },
        conditionB: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 8, concentrationRating: 3.5, phoneChecks: 3, preAssessment: { concentration: 4, distractionLevel: 2 }, postAssessment: { mentalFatigue: 3, perceivedDistractions: 3 }, notes: 'Resisted checking until minute 12' }
      },
      {
        id: 'P10', assignedOrder: 'BA', passageOrder: 'P2-P1', consented: true, notes: 'Participant expressed curiosity about BU100 research questions.',
        conditionA: { completed: true, passageNum: 1, durationMinutes: 20, quizScore: 8, concentrationRating: 4.0, phoneChecks: 0, preAssessment: { concentration: 4, distractionLevel: 2 }, postAssessment: { mentalFatigue: 2, perceivedDistractions: 0 }, notes: 'Stable attention' },
        conditionB: { completed: true, passageNum: 2, durationMinutes: 20, quizScore: 7, concentrationRating: 3.0, phoneChecks: 5, preAssessment: { concentration: 3, distractionLevel: 3 }, postAssessment: { mentalFatigue: 4, perceivedDistractions: 5 }, notes: 'Phone vibrated twice with incoming calls' }
      }
    ];

    this.set(STORAGE_KEYS.EXPERIMENT_PARTICIPANTS, demoParticipants);
    return demoParticipants;
  }

  // Clear Entire Platform Data (with safety confirmation)
  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.DISTRACTIONS);
    localStorage.removeItem(STORAGE_KEYS.TREE);
    localStorage.removeItem(STORAGE_KEYS.EXPERIMENT_PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.SCREEN_TIME);
    this.initDefaults();
    return true;
  }
}

// Global instance
window.focusStorage = new StorageManager();
