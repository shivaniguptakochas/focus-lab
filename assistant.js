/**
 * FocusLab - AI Study Assistant & Strategy Generator
 * Deterministic, rule-based academic advisory engine providing personalized study
 * routines, evidence-backed productivity techniques, and BU100 research alignment.
 * Note: Clearly discloses it is a predefined rule-based model, not a live LLM API.
 */

const ASSISTANT_KNOWLEDGE_BASE = [
  {
    keywords: ['routine', 'schedule', 'timetable', 'plan', 'daily routine'],
    title: 'Optimizing Your Daily Study Routine',
    badge: 'Study Planning',
    answer: `Here is an evidence-backed study routine framework tailored for university students:
1. **Morning Cognitive Block (09:00 - 11:30)**: Dedicate this window to your most cognitively demanding subject (e.g., analytical problem-solving, math, or complex theory). Executive function is highest prior to decision fatigue.
2. **Pomodoro Cycling (11:30 - 13:00)**: Two 25-minute Pomodoro sprints with 5-minute physical breaks (stretching, hydration, no phone screens).
3. **Rest & Consolidation (13:00 - 14:30)**: Lunch and mental downtime. Physical movement helps clear adenosine and consolidates working memory schemas.
4. **Active Recall & Synthesis (15:00 - 17:30)**: Practice retrieval with flashcards, self-testing, and past examination problems.
5. **Evening Review (19:30 - 20:30)**: Low-intensity review of notes taken today to trigger nocturnal memory consolidation.`
  },
  {
    keywords: ['spaced repetition', 'ebbinghaus', 'forgetting curve', 'memorize', 'retention'],
    title: 'Spaced Repetition: Defeating the Ebbinghaus Curve',
    badge: 'Cognitive Science',
    answer: `Hermann Ebbinghaus discovered that without rehearsal, humans forget approximately 50% of new information within 24 hours and up to 75% within a week.
**How to implement Spaced Repetition in FocusLab**:
- **Day 1**: Learn the material in a 25-minute Focus Session. Write a 3-bullet summary.
- **Day 2 (24 Hours later)**: Spend 10 minutes recalling key concepts without looking at your notes (Active Recall).
- **Day 4**: Rapid flashcard review or practice test.
- **Day 7**: Solve an applied problem.
- **Day 14 & Day 30**: Quick 5-minute refresher.
Each retrieval resets the forgetting curve, flattening its decay slope into permanent long-term memory.`
  },
  {
    keywords: ['active recall', 'feynman', 'feynman technique', 'understanding', 'deep work'],
    title: 'The Feynman Technique & Active Retrieval',
    badge: 'Mastery Method',
    answer: `The Feynman Technique, developed by Nobel laureate Richard Feynman, exposes illusions of explanatory competence:
1. **Choose a concept**: Write the concept title at the top of a blank page.
2. **Explain it to a 10-year-old**: Use plain, jargon-free language and analogies. If you have to use technical jargon to explain it, you do not deeply understand it.
3. **Identify the friction points**: Whenever you hesitate or reach for notes, mark that knowledge gap.
4. **Targeted review**: Return to the source text specifically to clarify that single bottleneck.
5. **Simplify and connect**: Re-write the explanation until it flows effortlessly.`
  },
  {
    keywords: ['phone', 'distraction', 'social media', 'instagram', 'whatsapp', 'detox', 'notifications'],
    title: 'Eliminating Phone Distraction via Choice Architecture',
    badge: 'Digital Wellbeing',
    answer: `Relying on willpower to ignore a phone on your desk triggers continuous prefrontal cortex drain (Ward et al., 2017).
**Actionable Protocol**:
1. **Physical Distance**: Place your smartphone in another room or inside a backpack behind your chair during 25-minute Focus sprints.
2. **Friction Insertion**: Turn off non-essential notifications (social media, promotions, badges) and switch your display to Grayscale mode (Settings > Accessibility > Color Filters) to strip away the hyper-stimulative visual cues.
3. **Designated Check Windows**: Allocate 10 scheduled minutes at 13:00 and 18:00 for messaging rather than continuous partial attention.`
  },
  {
    keywords: ['scout mindset', 'galef', 'bias', 'bu100', 'research mindset'],
    title: 'The Scout Mindset (Julia Galef) in Student Research',
    badge: 'BU100 Reading',
    answer: `In *The Scout Mindset*, Julia Galef contrasts the 'Soldier Mindset' (defending our preconceived beliefs like a fortress) with the 'Scout Mindset' (seeking an accurate map of reality, even when the terrain is inconvenient).
**Application in FocusLab**:
- A researcher with a soldier mindset desperately wants to prove that phone-free study *must* produce higher scores, potentially overlooking experimental flaws or counter-evidence.
- A researcher with a scout mindset treats our $N=10$ experiment with objective curiosity: we record observed phone checks, note where individual variations occur, and accept whatever the data reveals without fabricating confirmation.`
  },
  {
    keywords: ['calling bullshit', 'bergstrom', 'west', 'data', 'charts', 'correlation'],
    title: 'Calling Bullshit (Bergstrom & West) on Educational Claims',
    badge: 'BU100 Reading',
    answer: `Carl T. Bergstrom and Jevin D. West emphasize in *Calling Bullshit* that numbers and charts can be weaponized to give an illusion of scientific authority.
**Core Principles applied in FocusLab**:
1. **Sample Size Awareness**: An experimental sample of $N=10$ students cannot support sweeping population claims. We clearly label findings as exploratory within-subject observations.
2. **Honest Visualizations**: Our charts feature baseline axes starting from zero to prevent exaggerated visual differences.
3. **Distinguishing Correlation from Causation**: While phone checks correlate with lower quiz scores, individual prior familiarity, sleep deprivation, or text difficulty also contribute.`
  },
  {
    keywords: ['thinking fast and slow', 'kahneman', 'system 1', 'system 2', 'attention'],
    title: 'Thinking, Fast and Slow (Daniel Kahneman) in Attention Economics',
    badge: 'BU100 Reading',
    answer: `Daniel Kahneman outlines two modes of cognitive processing:
- **System 1 (Fast, Automatic, Effortless)**: The reflexive impulse to touch a buzzing smartphone, tap notifications, or refresh an app feed. It operates instinctively via basal ganglia habit loops.
- **System 2 (Slow, Deliberate, High-Effort)**: The conscious concentration required to parse dense academic passages, solve equations, and synthesize arguments.
When System 1 is bombarded with notification triggers, System 2's finite cognitive stamina is quickly exhausted by repeated impulse suppression. Environmental control protects System 2 from depletion.`
  },
  {
    keywords: ['pomodoro', 'intervals', 'breaks', '25 minutes', 'burnout'],
    title: 'Maximizing the Pomodoro Technique',
    badge: 'Productivity Science',
    answer: `The Pomodoro Technique works by bounding focus into discrete, low-friction commitments:
- **Rule 1**: A 25-minute Pomodoro is indivisible. If an urgent thought arrives, jot it on your scratchpad and return immediately to the task.
- **Rule 2**: Breaks are strictly cognitive rests. Do not switch to high-dopamine stimulation (TikTok, Reels, intense gaming) during a 5-minute break; instead, look away into the distance, hydrate, and stretch.
- **Rule 3**: After 4 completed pomodoros, take a restorative 15-20 minute long break.`
  },
  {
    keywords: ['exam', 'anxiety', 'sleep', 'stress', 'cramming'],
    title: 'Managing Exam Pressure & Sleep Architecture',
    badge: 'Peak Performance',
    answer: `Cramming through all-nighters severely impairs hippocampal consolidation:
1. **Sleep Architecture**: During slow-wave sleep and REM sleep, the hippocampus replays synaptic patterns from daytime study, transferring them to the neocortex for permanent retention.
2. **Stress Inversion**: High cortisol levels inhibit prefrontal access to working memory, causing sudden "exam freeze."
3. **Protocol**: Prioritize 7.5 to 8 hours of sleep before an exam. Review key formulas 60 minutes before bed, then power off all digital screens.`
  }
];

class StudyAssistant {
  constructor() {
    this.history = [];
    this.disclaimer = "FocusLab Study Intelligence is a deterministic, rule-based academic advisory system developed for Bennett University BU100 research. It does not use external generative AI APIs.";
  }

  ask(question) {
    const qClean = question.trim().toLowerCase();
    if (!qClean) return null;

    let bestMatch = null;
    let highestScore = 0;

    for (const item of ASSISTANT_KNOWLEDGE_BASE) {
      let score = 0;
      item.keywords.forEach(kw => {
        if (qClean.includes(kw)) {
          score += kw.length;
        }
      });
      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }

    let responsePayload = null;

    if (bestMatch && highestScore > 0) {
      responsePayload = {
        title: bestMatch.title,
        badge: bestMatch.badge,
        content: bestMatch.answer,
        matched: true
      };
    } else {
      // Intelligent fallback advisory
      responsePayload = {
        title: 'General Study Guidance & Strategy',
        badge: 'Study Best Practice',
        content: `I don't have a specific pre-programmed module matching all those exact terms, but here is the foundational FocusLab advice:
- **Break your task down**: If the subject feels overwhelming, start a 10-minute low-friction Focus Session. Getting started breaks the psychological resistance barrier.
- **Remove phone cues**: Keep your device outside your visual field to preserve working memory capacity.
- **Use Active Recall**: Instead of passively re-reading, close your book and self-quiz.
- **Explore our specific topics**: Try asking about *Pomodoro*, *Spaced Repetition*, *Feynman Technique*, *Phone Distraction*, *Scout Mindset*, or *Kahneman*.`,
        matched: false
      };
    }

    const exchange = {
      id: 'msg-' + Date.now(),
      question: question,
      response: responsePayload,
      timestamp: Date.now()
    };

    this.history.push(exchange);
    return exchange;
  }

  generateTimetable(subjectsStr, dailyHours = 4, peakTime = 'morning') {
    const subjects = subjectsStr.split(',').map(s => s.trim()).filter(Boolean);
    if (!subjects.length) subjects.push('Core Subject', 'Research / Review');

    const blocks = [];
    const hours = Math.max(1, Math.min(10, parseInt(dailyHours) || 4));
    const startHour = peakTime === 'morning' ? 9 : (peakTime === 'afternoon' ? 14 : 18);

    let curTime = startHour;
    for (let i = 0; i < hours; i++) {
      const subject = subjects[i % subjects.length];
      const startStr = `${String(curTime).padStart(2, '0')}:00`;
      const studyEndStr = `${String(curTime).padStart(2, '0')}:50`;
      const breakEndStr = `${String(curTime + 1).padStart(2, '0')}:00`;

      blocks.push({
        timeSlot: `${startStr} - ${studyEndStr}`,
        activity: `Focus Sprint: ${subject}`,
        type: 'Study',
        focusMinutes: 50,
        tip: 'Eliminate phone notifications and practice Active Retrieval.'
      });

      blocks.push({
        timeSlot: `${studyEndStr} - ${breakEndStr}`,
        activity: 'Restorative Break',
        type: 'Break',
        focusMinutes: 10,
        tip: 'Step away from all screens. Hydrate and do gentle neck stretches.'
      });

      curTime++;
    }

    return {
      peakTime: peakTime,
      totalHours: hours,
      subjects: subjects,
      schedule: blocks
    };
  }
}

// Global assistant instance
window.focusAssistant = new StudyAssistant();
