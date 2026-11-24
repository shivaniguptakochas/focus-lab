/**
 * FocusLab - Timer Engine
 * High-precision countdown timer supporting Focus Room, Pomodoro cycles,
 * Digital Detox, 20-min Focus Challenge, and BU100 Experiment sessions.
 */

class FocusTimer {
  constructor() {
    this.mode = 'focus'; // 'focus', 'pomodoro', 'detox', 'challenge', 'experiment', 'break'
    this.state = 'idle'; // 'idle', 'running', 'paused', 'completed'
    this.totalSeconds = 25 * 60;
    this.remainingSeconds = 25 * 60;
    this.timerInterval = null;
    this.startTimestamp = null;
    this.sessionDistractions = [];
    this.pomodoroCycles = 0; // Completed pomodoros
    this.pomodoroPhase = 'work'; // 'work', 'shortBreak', 'longBreak'
    this.customWorkMins = 25;
    this.customBreakMins = 5;
    this.customLongBreakMins = 15;
    
    // Callbacks
    this.onTickCallback = null;
    this.onStateChangeCallback = null;
    this.onCompleteCallback = null;
  }

  setMode(mode, customMinutes = null) {
    if (this.state === 'running') {
      this.pause();
    }
    this.mode = mode;

    if (customMinutes) {
      this.totalSeconds = customMinutes * 60;
    } else {
      switch (mode) {
        case 'focus':
          this.totalSeconds = 25 * 60;
          break;
        case 'pomodoro':
          this.pomodoroPhase = 'work';
          this.totalSeconds = this.customWorkMins * 60;
          break;
        case 'detox':
          this.totalSeconds = 30 * 60;
          break;
        case 'challenge':
          this.totalSeconds = 20 * 60;
          break;
        case 'experiment':
          this.totalSeconds = 20 * 60;
          break;
        default:
          this.totalSeconds = 25 * 60;
      }
    }

    this.remainingSeconds = this.totalSeconds;
    this.state = 'idle';
    this.sessionDistractions = [];
    this.triggerTick();
    this.triggerStateChange();
  }

  setCustomDuration(minutes) {
    if (this.state === 'running') return;
    this.totalSeconds = Math.max(1, Math.min(180, minutes)) * 60;
    this.remainingSeconds = this.totalSeconds;
    this.triggerTick();
  }

  start() {
    if (this.state === 'running') return;

    if (this.state === 'idle') {
      this.startTimestamp = Date.now();
      this.sessionDistractions = [];
    }

    this.state = 'running';
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);

    if (window.focusAudio) {
      window.focusAudio.playChime('click');
    }

    this.triggerStateChange();
    this.triggerTick();
  }

  pause() {
    if (this.state !== 'running') return;

    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.state = 'paused';

    if (window.focusAudio) {
      window.focusAudio.playChime('click');
    }

    this.triggerStateChange();
  }

  resume() {
    if (this.state !== 'paused') return;
    this.start();
  }

  reset() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.state = 'idle';
    this.remainingSeconds = this.totalSeconds;
    this.sessionDistractions = [];

    if (window.focusAudio) {
      window.focusAudio.playChime('click');
    }

    this.triggerTick();
    this.triggerStateChange();
  }

  tick() {
    if (this.remainingSeconds > 0) {
      this.remainingSeconds--;
      this.triggerTick();
    }

    if (this.remainingSeconds <= 0) {
      this.complete();
    }
  }

  complete() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.state = 'completed';

    // Play chime
    if (window.focusAudio) {
      window.focusAudio.playChime('complete');
    }

    const elapsedMinutes = Math.round(this.totalSeconds / 60);
    const score = this.calculateFocusScore(elapsedMinutes, elapsedMinutes, this.sessionDistractions.length);

    const sessionSummary = {
      mode: this.mode,
      phase: this.pomodoroPhase,
      duration: elapsedMinutes,
      plannedDuration: elapsedMinutes,
      distractions: [...this.sessionDistractions],
      distractionCount: this.sessionDistractions.length,
      focusScore: score,
      completed: true,
      timestamp: Date.now()
    };

    // Pomodoro phase rotation
    if (this.mode === 'pomodoro') {
      if (this.pomodoroPhase === 'work') {
        this.pomodoroCycles++;
        if (this.pomodoroCycles % 4 === 0) {
          this.pomodoroPhase = 'longBreak';
          this.totalSeconds = this.customLongBreakMins * 60;
        } else {
          this.pomodoroPhase = 'shortBreak';
          this.totalSeconds = this.customBreakMins * 60;
        }
      } else {
        this.pomodoroPhase = 'work';
        this.totalSeconds = this.customWorkMins * 60;
      }
      this.remainingSeconds = this.totalSeconds;
    }

    this.triggerStateChange();
    this.triggerTick();

    if (this.onCompleteCallback) {
      this.onCompleteCallback(sessionSummary);
    }
  }

  logDistraction(category, note = '') {
    const distraction = {
      id: 'dist-' + Date.now(),
      category: category,
      note: note,
      timeRemaining: this.remainingSeconds,
      timestamp: Date.now()
    };
    this.sessionDistractions.push(distraction);
    
    // Also log to global storage if available
    if (window.focusStorage) {
      window.focusStorage.logDistraction(category, note);
    }

    return distraction;
  }

  /**
   * Focus Score Calculation Formula:
   * Base = (Actual Study Duration / Planned Duration) * 100
   * Penalty = Distraction Count * 6 (scaled to reflect interruption cost)
   * Completion Bonus = +5 (for finishing full session without abandoning)
   * Clamped strictly between 0 and 100.
   * Disclaimer: Operational heuristic, not a clinically validated psychological measure.
   */
  calculateFocusScore(actualMinutes, plannedMinutes, distractionCount) {
    if (!plannedMinutes || plannedMinutes <= 0) return 100;
    const durationRatio = Math.min(1, actualMinutes / plannedMinutes);
    const baseScore = durationRatio * 100;
    const distractionPenalty = distractionCount * 6;
    const completionBonus = (actualMinutes >= plannedMinutes) ? 5 : 0;
    const rawScore = baseScore - distractionPenalty + completionBonus;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  getFormattedTime() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getProgressFraction() {
    if (this.totalSeconds <= 0) return 0;
    return 1 - (this.remainingSeconds / this.totalSeconds);
  }

  triggerTick() {
    if (this.onTickCallback) {
      this.onTickCallback({
        formatted: this.getFormattedTime(),
        remainingSeconds: this.remainingSeconds,
        totalSeconds: this.totalSeconds,
        progress: this.getProgressFraction(),
        distractionCount: this.sessionDistractions.length,
        mode: this.mode,
        pomodoroPhase: this.pomodoroPhase,
        pomodoroCycles: this.pomodoroCycles
      });
    }
  }

  triggerStateChange() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        state: this.state,
        mode: this.mode,
        pomodoroPhase: this.pomodoroPhase
      });
    }
  }
}

// Global timer instance
window.focusTimer = new FocusTimer();
