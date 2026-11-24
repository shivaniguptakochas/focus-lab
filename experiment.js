/**
 * FocusLab - Experimental Research Module
 * University-level within-subject experimental research engine for BU100 SDG Action Lab.
 * Implements counterbalancing, 2 standardized reading passages, 2 ten-question quizzes,
 * 12-step research workflow, paired statistical comparisons, and CSV export.
 */

// Standardized Reading Passage 1: Cognitive Load Theory and Working Memory
const PASSAGE_1 = {
  title: "Cognitive Load and Working Memory Architecture in Learning Environments",
  category: "Cognitive Psychology & Educational Science",
  readTime: "12-15 minutes (approx. 1,050 words)",
  text: `
### 1. Introduction to Cognitive Load Theory
Cognitive Load Theory (CLT), originally formulated by John Sweller in the late 1980s, provides an empirical framework for understanding how instructional materials interact with the human cognitive architecture. At the center of CLT is the distinction between working memory—which has severely limited processing capacity and temporal duration—and long-term memory, which functions as an effectively limitless repository of schemas.

According to Sweller, cognitive load can be partitioned into three distinct categories:
1. **Intrinsic Cognitive Load**: The inherent difficulty associated with the specific information being processed. This is determined by the number of interacting elements that must be processed simultaneously in working memory (element interactivity).
2. **Extraneous Cognitive Load**: The mental effort imposed by the manner in which information is presented or by irrelevant environmental stimuli that do not contribute to schema acquisition.
3. **Germane Cognitive Load**: The mental resources directly devoted to processing, organizing, and integrating new knowledge into existing schemas in long-term memory.

### 2. The Multicomponent Working Memory Model
Alan Baddeley and Graham Hitch (1974) replaced the unitary short-term memory store with a multicomponent working memory model consisting of:
- **The Central Executive**: An attentional control system responsible for focusing, dividing, and switching attention, as well as binding information from disparate modalities.
- **The Phonological Loop**: A verbal rehearsal mechanism that retains speech-based representations for approximately 1.5 to 2 seconds unless refreshed by subvocal rehearsal.
- **The Visuospatial Sketchpad**: A workspace dedicated to maintaining and manipulating visual and spatial information.
- **The Episodic Buffer**: A multidimensional storage system capable of integrating phonological, visual, and spatial codes with long-term memory traces into coherent episodic representations.

Working memory capacity is strictly bounded. Classic studies by George Miller (1956) proposed the "magical number seven, plus or minus two" chunks of information, while modern cognitive research by Nelson Cowan (2001) suggests that pure working memory capacity is closer to four items when chunking and rehearsal strategies are eliminated.

### 3. Attentional Fragmentation and the "Attentional Blink"
When an individual is engaged in deep intellectual processing, cognitive control is sustained through prefrontal cortex activation, particularly the dorsolateral prefrontal cortex (DLPFC). This neural structure maintains task-relevant goals against distracting environmental cues.

However, when an external interruption occurs—such as a visual notification, a vibration, or the mere anticipation of a smartphone prompt—the central executive must rapidly shift focus. This shift incurs a measurable "resumption lag" or task-switching penalty. During context switching, mental representations of the primary task undergo decay in working memory. Reconstructing this mental state requires re-activating schemas, which demands excessive extraneous cognitive load at the expense of germane processing.

Furthermore, cognitive neuroscientists describe the "attentional blink"—a brief temporal window (approximately 200–500 milliseconds) following the detection of a stimulus during which the brain is unable to perceive or register a subsequent target. In high-frequency notification environments, recurring attentional blinks and rapid task switching lead to continuous partial attention, permanently degrading deep semantic encoding.

### 4. Educational Implications and Schema Construction
Meaningful learning relies on schema construction—the process of categorizing individual pieces of information into cohesive cognitive structures that can later be treated as single conceptual units. When working memory is overloaded by extraneous distractions, insufficient cognitive capacity remains to construct complex schemas. Consequently, students may superficially recognize vocabulary terms or isolated definitions without establishing deep conceptual networks, leading to rapid decay of learned material and impaired performance on analytical assessments.
`
};

// Standardized Reading Passage 2: Neurobiology of Habit Loops and Attentional Capture
const PASSAGE_2 = {
  title: "Neurobiology of Habit Loops, Dopaminergic Salience, and Digital Distraction",
  category: "Neuroscience & Behavioral Psychology",
  readTime: "12-15 minutes (approx. 1,020 words)",
  text: `
### 1. The Anatomy of the Behavioral Habit Loop
Habitual behaviors are automated behavioral routines encoded within the basal ganglia, particularly the striatum. In behavioral psychology, habit formation operates via a tripartite loop initially categorized by Ann Graybiel and popularized by Charles Duhigg:
1. **The Cue (Trigger)**: An internal or external stimulus that alerts the brain to initiate a behavioral sequence. In digital environments, cues include auditory rings, tactile vibrations, visual lock-screen banners, or internal psychological states such as boredom and anxiety.
2. **The Routine**: The automated behavioral action executed in response to the cue—specifically unlocking a device, swiping down to refresh, or opening social media feeds.
3. **The Reward**: The positive physiological or neurochemical reinforcement that signals to the brain that this loop is worth remembering.

Over repeated iterations, the cue and the routine become neurologically linked, transferring behavioral control from the conscious prefrontal cortex to the automated basal ganglia circuits.

### 2. Mesolimbic Dopaminergic Pathways and Incentive Salience
Contrary to popular misconceptions, dopamine is not a chemical of pure sensory pleasure; rather, it is a neurotransmitter of anticipation, motivational drive, and "incentive salience." Wolfram Schultz's groundbreaking neurophysiological studies demonstrated that midbrain dopamine neurons in the ventral tegmental area (VTA) and substantia nigra fire in patterns known as **Reward Prediction Errors (RPE)**.

When an unexpected reward is encountered, dopamine neurons exhibit a burst of firing. Over time, as an environmental cue reliably predicts the reward, this dopaminergic burst shifts from the moment of reward consumption to the presentation of the cue itself. If an expected reward fails to materialize, dopamine firing drops below baseline, inducing a state of mild dysphoria or cognitive craving.

Digital applications leverage **Variable Ratio Reinforcement Schedules**, the exact psychological mechanism identified by B.F. Skinner in operant conditioning chambers. Because a user does not know whether checking their phone will reveal an urgent message, a social endorsement, or mundane spam, each notification serves as an unpredictable lottery ticket. This unpredictable schedule produces the highest rates of response and the greatest resistance to behavioral extinction.

### 3. Cognitive Depletion and the Cost of "Phone Salience"
Recent research in applied cognitive psychology by Ward, Duke, Gneezy, and Bos (2017) introduced the concept of the "Brain Drain Hypothesis." Their experimental findings revealed that the mere physical presence of a smartphone on a desk—even when powered off, face-down, and silent—imposes an extraneous drain on cognitive resources.

This phenomenon occurs because resisting the reflexive urge to check an accessible device requires active executive control. The prefrontal cortex must continuously expend metabolic glucose and attentional bandwidth to inhibit the automated habit loop encoded in the striatum. Consequently, fewer executive resources remain available for complex problem-solving, reading comprehension, and working memory tasks.

### 4. Attention Restoration and Environmental Control
To mitigate the cognitive fragmentation caused by smartphone salience, behavioral researchers advocate for **choice architecture** and environmental modification. Rather than relying solely on finite self-regulatory willpower, altering the physical study environment—such as placing the smartphone in another room or out of arm's reach—eliminates the continuous perceptual cues that trigger the dopamine prediction loop. By silencing both the cue and the necessity for active inhibition, students preserve their full working memory capacity for high-order learning and conceptual synthesis.
`
};

// 10-Question Multiple Choice Quiz for Passage 1
const QUIZ_PASSAGE_1 = [
  {
    id: 1,
    question: "According to John Sweller's Cognitive Load Theory, which category of cognitive load is imposed by irrelevant environmental stimuli or poor presentation?",
    options: ["Intrinsic cognitive load", "Extraneous cognitive load", "Germane cognitive load", "Episodic cognitive load"],
    correctIndex: 1,
    explanation: "Extraneous cognitive load is caused by unnecessary environmental distractions or inefficient instructional delivery."
  },
  {
    id: 2,
    question: "In Baddeley and Hitch's working memory model, which component is responsible for focusing, dividing, and switching attentional resources?",
    options: ["The Phonological Loop", "The Visuospatial Sketchpad", "The Central Executive", "The Episodic Buffer"],
    correctIndex: 2,
    explanation: "The Central Executive oversees attentional allocation, context switching, and coordination across modalities."
  },
  {
    id: 3,
    question: "Modern cognitive research by Nelson Cowan estimates that pure working memory capacity (without rehearsal or chunking) is approximately:",
    options: ["7 to 9 items", "12 items", "4 items", "1 to 2 items"],
    correctIndex: 2,
    explanation: "Cowan's research demonstrates that pure working memory capacity is strictly bounded around four distinct items."
  },
  {
    id: 4,
    question: "What is 'Intrinsic Cognitive Load' primarily determined by?",
    options: ["The brightness of ambient study lighting", "The number of interacting elements in the material", "The volume of background music", "The duration of the study break"],
    correctIndex: 1,
    explanation: "Intrinsic load is dictated by the conceptual complexity and element interactivity inherent to the subject matter."
  },
  {
    id: 5,
    question: "Which brain region sustains task-relevant goals against distracting environmental cues during focused concentration?",
    options: ["Dorsolateral Prefrontal Cortex (DLPFC)", "Occipital Cortex", "Cerebellum", "Pons"],
    correctIndex: 0,
    explanation: "The DLPFC is the primary prefrontal structure maintaining top-down attentional control and goal preservation."
  },
  {
    id: 6,
    question: "What term describes the brief window (200–500 ms) after perceiving a stimulus during which the brain cannot register a second target?",
    options: ["Cognitive Dissonance", "Attentional Blink", "Sensory Gating", "Neural Plasticity"],
    correctIndex: 1,
    explanation: "The attentional blink is a well-documented temporal bottleneck in human attentional processing."
  },
  {
    id: 7,
    question: "What is 'resumption lag' in the context of task switching and digital interruptions?",
    options: ["The time it takes a computer to reboot", "The delay in re-activating decaying working memory schemas after an interruption", "The time required to fall asleep after studying", "The physical time taken to pick up a smartphone"],
    correctIndex: 1,
    explanation: "Resumption lag represents the cognitive penalty required to reconstruct previous mental representations in working memory."
  },
  {
    id: 8,
    question: "According to CLT, what happens when working memory is saturated with extraneous cognitive load?",
    options: ["Long-term memory expands proportionally", "Insufficient mental resources remain for germane schema construction", "Intrinsic difficulty decreases automatically", "Cognitive stamina becomes infinite"],
    correctIndex: 1,
    explanation: "Extraneous load steals finite cognitive resources away from germane processing and schema consolidation."
  },
  {
    id: 9,
    question: "What is the primary function of the 'Episodic Buffer' in Baddeley's updated multicomponent model?",
    options: ["To store motor habits permanently", "To integrate visual, phonological, and spatial codes with long-term memory into cohesive episodes", "To filter out auditory noise completely", "To automate autonomic reflexes"],
    correctIndex: 1,
    explanation: "The episodic buffer acts as a temporary multimodal workspace binding disparate sensory inputs with prior knowledge."
  },
  {
    id: 10,
    question: "What educational outcome occurs when students study under chronic high extraneous cognitive load?",
    options: ["They master conceptual synthesis faster", "They retain superficial definitions but fail to build interconnected conceptual networks", "Their working memory expands permanently", "They become immune to distractions"],
    correctIndex: 1,
    explanation: "High extraneous load impedes deep schema formation, resulting in fragile and isolated rote memorization."
  }
];

// 10-Question Multiple Choice Quiz for Passage 2
const QUIZ_PASSAGE_2 = [
  {
    id: 1,
    question: "In the tripartite behavioral habit loop, which component alerts the brain to initiate an automated routine?",
    options: ["The Reward", "The Cue (Trigger)", "The Feedback loop", "The Homeostatic baseline"],
    correctIndex: 1,
    explanation: "The Cue is the contextual stimulus (auditory alert, notification banner, or emotional state) that prompts the routine."
  },
  {
    id: 2,
    question: "Which subcortical brain structure is primarily responsible for encoding automated habit sequences?",
    options: ["Basal Ganglia (Striatum)", "Auditory Cortex", "Medulla Oblongata", "Corpus Callosum"],
    correctIndex: 0,
    explanation: "The basal ganglia (specifically the striatum) automates procedural routines and habit loops."
  },
  {
    id: 3,
    question: "According to Wolfram Schultz's neurophysiological findings, what do midbrain dopamine neurons compute?",
    options: ["Caloric value of food", "Reward Prediction Errors (RPE)", "Oxygen saturation levels", "Lactic acid accumulation"],
    correctIndex: 1,
    explanation: "Dopamine neurons signal Reward Prediction Errors—the difference between expected and received outcomes."
  },
  {
    id: 4,
    question: "Which reinforcement schedule produces the highest behavioral response rates and greatest resistance to extinction?",
    options: ["Fixed Interval Schedule", "Variable Ratio Reinforcement Schedule", "Continuous Reinforcement Schedule", "Fixed Ratio Schedule"],
    correctIndex: 1,
    explanation: "Variable ratio schedules (like slot machines and digital notifications) deliver intermittent unpredictability."
  },
  {
    id: 5,
    question: "What does the 'Brain Drain Hypothesis' by Ward et al. (2017) demonstrate?",
    options: ["Smartphone batteries drain faster under heavy usage", "The physical presence of a phone on a desk consumes cognitive capacity even when turned off and silent", "Students forget 90% of information within 1 hour", "Drinking water eliminates cognitive fatigue"],
    correctIndex: 1,
    explanation: "The mere presence of a smartphone demands executive control to suppress checking impulses, draining working memory."
  },
  {
    id: 6,
    question: "Why does an environmental cue shift dopamine neuron firing before the actual reward is consumed?",
    options: ["Dopamine mediates sensory fatigue", "Dopamine encodes anticipation, drive, and incentive salience once an association is learned", "The body runs out of dopamine after eating", "Cues destroy dopaminergic receptors"],
    correctIndex: 1,
    explanation: "With learning, dopamine bursts fire upon encountering the predictive cue, driving motivational pursuit."
  },
  {
    id: 7,
    question: "What neurochemical state occurs when an expected reward fails to appear after a predictive cue has fired?",
    options: ["Dopamine firing surges to maximum", "Dopamine firing drops below baseline, generating cognitive craving or dysphoria", "Serotonin replaces dopamine instantly", "GABA ceases all neural activity"],
    correctIndex: 1,
    explanation: "A negative prediction error causes dopamine to dip below baseline, producing tension and compulsive re-checking."
  },
  {
    id: 8,
    question: "Which cognitive process is continuously active when a student attempts to ignore a visible smartphone during study?",
    options: ["Prefrontal executive inhibition", "Subconscious dreaming", "Vestibular balancing", "Autonomic respiration"],
    correctIndex: 0,
    explanation: "Active executive inhibition in the prefrontal cortex is continuously required to suppress the basal ganglia's impulse."
  },
  {
    id: 9,
    question: "Why does environmental control (e.g. putting a phone in another room) preserve more cognitive stamina than willpower alone?",
    options: ["It recharges the phone battery", "It removes the perceptual cue and the need for continuous prefrontal inhibition", "It prevents Wi-Fi signals from reaching the brain", "It makes studying completely effortless"],
    correctIndex: 1,
    explanation: "Removing the trigger eliminates the cue-driven dopamine surge and conserves executive resources."
  },
  {
    id: 10,
    question: "What happens to learned habits as behavioral control transfers from the prefrontal cortex to the basal ganglia?",
    options: ["They require greater conscious attention", "They become automated routines executed with minimal conscious deliberation", "They are erased from long-term memory", "They double reaction time"],
    correctIndex: 1,
    explanation: "Basal ganglia encoding transforms effortful conscious actions into frictionless, automatic behavioral loops."
  }
];

class ExperimentLab {
  constructor() {
    this.currentParticipantId = 'P01';
    this.currentCondition = 'A'; // 'A' (Phone-Free) or 'B' (Normal Access)
    this.workflowStep = 1;
    this.activePassage = PASSAGE_1;
    this.activeQuiz = QUIZ_PASSAGE_1;
    this.quizAnswers = {};
    this.preAssessment = { concentration: 4, distractionLevel: 2, energy: 4 };
    this.postAssessment = { concentration: 4, mentalFatigue: 2, perceivedDistractions: 0, feedback: '' };
    this.phoneCheckCount = 0;
    this.observerNotes = '';
  }

  getParticipant() {
    return window.focusStorage ? window.focusStorage.getParticipant(this.currentParticipantId) : null;
  }

  setParticipant(id) {
    this.currentParticipantId = id;
    const p = this.getParticipant();
    if (p) {
      // Recommend initial condition based on counterbalancing order
      const firstCondition = p.assignedOrder ? p.assignedOrder[0] : 'A';
      if (!p.conditionA && !p.conditionB) {
        this.currentCondition = firstCondition;
      } else if (p.conditionA && !p.conditionB) {
        this.currentCondition = 'B';
      } else if (!p.conditionA && p.conditionB) {
        this.currentCondition = 'A';
      }
      this.updatePassageForParticipant();
    }
    return p;
  }

  updatePassageForParticipant() {
    const p = this.getParticipant();
    if (!p) return;

    // Counterbalanced Passage Selection
    // If passageOrder is 'P1-P2', condition 1 gets Passage 1, condition 2 gets Passage 2
    let passageNum = 1;
    if (p.passageOrder === 'P1-P2') {
      passageNum = (this.currentCondition === 'A' && p.assignedOrder.startsWith('A')) || (this.currentCondition === 'B' && p.assignedOrder.startsWith('B')) ? 1 : 2;
    } else {
      passageNum = (this.currentCondition === 'A' && p.assignedOrder.startsWith('A')) || (this.currentCondition === 'B' && p.assignedOrder.startsWith('B')) ? 2 : 1;
    }

    if (passageNum === 1) {
      this.activePassage = PASSAGE_1;
      this.activeQuiz = QUIZ_PASSAGE_1;
    } else {
      this.activePassage = PASSAGE_2;
      this.activeQuiz = QUIZ_PASSAGE_2;
    }
  }

  grantConsent() {
    const p = this.getParticipant();
    if (p && window.focusStorage) {
      p.consented = true;
      window.focusStorage.saveParticipant(p);
      return true;
    }
    return false;
  }

  recordPreAssessment(concentration, distractionLevel, energy) {
    this.preAssessment = {
      concentration: parseInt(concentration) || 3,
      distractionLevel: parseInt(distractionLevel) || 2,
      energy: parseInt(energy) || 3,
      timestamp: Date.now()
    };
  }

  recordPostAssessment(concentration, mentalFatigue, perceivedDistractions, feedback = '') {
    this.postAssessment = {
      concentration: parseFloat(concentration) || 3,
      mentalFatigue: parseInt(mentalFatigue) || 3,
      perceivedDistractions: parseInt(perceivedDistractions) || 0,
      feedback: feedback,
      timestamp: Date.now()
    };
  }

  incrementPhoneCheck() {
    this.phoneCheckCount++;
    return this.phoneCheckCount;
  }

  decrementPhoneCheck() {
    if (this.phoneCheckCount > 0) this.phoneCheckCount--;
    return this.phoneCheckCount;
  }

  setQuizAnswer(questionId, selectedChoiceIndex) {
    this.quizAnswers[questionId] = parseInt(selectedChoiceIndex);
  }

  gradeQuiz() {
    let score = 0;
    const results = [];
    this.activeQuiz.forEach(q => {
      const selected = this.quizAnswers[q.id];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) score++;
      results.push({
        questionId: q.id,
        question: q.question,
        selected: selected,
        correctIndex: q.correctIndex,
        isCorrect: isCorrect,
        explanation: q.explanation
      });
    });

    return {
      scoreOutOf10: score,
      percentage: (score / 10) * 100,
      details: results
    };
  }

  saveTrialResults(overrideScore = null) {
    const p = this.getParticipant();
    if (!p || !window.focusStorage) return null;

    const quizResult = this.gradeQuiz();
    const finalScore = overrideScore !== null ? parseFloat(overrideScore) : quizResult.scoreOutOf10;

    const conditionKey = this.currentCondition === 'A' ? 'conditionA' : 'conditionB';
    const conditionPayload = {
      completed: true,
      conditionLabel: this.currentCondition === 'A' ? 'Condition A (Phone-Free Study)' : 'Condition B (Normal Phone Access)',
      passageNum: this.activePassage === PASSAGE_1 ? 1 : 2,
      passageTitle: this.activePassage.title,
      durationMinutes: 20,
      quizScore: finalScore,
      quizDetails: quizResult.details,
      concentrationRating: this.postAssessment.concentration,
      phoneChecks: this.currentCondition === 'A' ? 0 : this.phoneCheckCount,
      preAssessment: { ...this.preAssessment },
      postAssessment: { ...this.postAssessment },
      notes: this.observerNotes
    };

    window.focusStorage.updateParticipantCondition(this.currentParticipantId, conditionKey, conditionPayload);

    // Also record as a regular session so it reflects in global session history & tree
    window.focusStorage.saveSession({
      mode: `Experiment (${this.currentCondition === 'A' ? 'Phone-Free' : 'Normal Access'})`,
      duration: 20,
      focusScore: Math.round(finalScore * 10),
      distractions: this.phoneCheckCount > 0 ? Array(this.phoneCheckCount).fill({ category: 'Observed Phone Check' }) : [],
      completed: true,
      notes: `Participant ${this.currentParticipantId}`
    });

    // Reset temporary trial variables
    this.quizAnswers = {};
    this.phoneCheckCount = 0;
    this.observerNotes = '';

    return conditionPayload;
  }

  /**
   * Paired Experimental Statistical Calculations
   * Rigorous within-subject paired differences calculation
   */
  calculateStatistics() {
    const participants = window.focusStorage ? window.focusStorage.getExperimentParticipants() : [];
    
    // Filter to only paired participants (completed BOTH conditions A & B)
    const paired = participants.filter(p => 
      p.conditionA && p.conditionA.completed && 
      p.conditionB && p.conditionB.completed &&
      p.conditionA.quizScore !== null && p.conditionB.quizScore !== null
    );

    const conditionAOnly = participants.filter(p => p.conditionA && p.conditionA.completed);
    const conditionBOnly = participants.filter(p => p.conditionB && p.conditionB.completed);

    if (paired.length === 0) {
      return {
        hasData: false,
        totalEnrolled: participants.length,
        pairedCount: 0,
        condACompletedCount: conditionAOnly.length,
        condBCompletedCount: conditionBOnly.length,
        avgQuizA: null,
        avgQuizB: null,
        quizDiff: null,
        avgConcA: null,
        avgConcB: null,
        concDiff: null,
        avgPhoneChecksB: null,
        pairedList: []
      };
    }

    const sumQuizA = paired.reduce((acc, p) => acc + p.conditionA.quizScore, 0);
    const sumQuizB = paired.reduce((acc, p) => acc + p.conditionB.quizScore, 0);
    const avgQuizA = sumQuizA / paired.length;
    const avgQuizB = sumQuizB / paired.length;
    const quizDiff = avgQuizA - avgQuizB;

    const sumConcA = paired.reduce((acc, p) => acc + (p.conditionA.concentrationRating || 0), 0);
    const sumConcB = paired.reduce((acc, p) => acc + (p.conditionB.concentrationRating || 0), 0);
    const avgConcA = sumConcA / paired.length;
    const avgConcB = sumConcB / paired.length;
    const concDiff = avgConcA - avgConcB;

    const sumChecksB = paired.reduce((acc, p) => acc + (p.conditionB.phoneChecks || 0), 0);
    const avgChecksB = sumChecksB / paired.length;

    // Individual differences
    const pairedList = paired.map(p => ({
      id: p.id,
      assignedOrder: p.assignedOrder,
      quizA: p.conditionA.quizScore,
      quizB: p.conditionB.quizScore,
      quizDiff: (p.conditionA.quizScore - p.conditionB.quizScore).toFixed(1),
      concA: p.conditionA.concentrationRating,
      concB: p.conditionB.concentrationRating,
      concDiff: (p.conditionA.concentrationRating - p.conditionB.concentrationRating).toFixed(1),
      checksB: p.conditionB.phoneChecks || 0
    }));

    return {
      hasData: true,
      totalEnrolled: participants.length,
      pairedCount: paired.length,
      condACompletedCount: conditionAOnly.length,
      condBCompletedCount: conditionBOnly.length,
      avgQuizA: parseFloat(avgQuizA.toFixed(2)),
      avgQuizB: parseFloat(avgQuizB.toFixed(2)),
      quizDiff: parseFloat(quizDiff.toFixed(2)),
      avgConcA: parseFloat(avgConcA.toFixed(2)),
      avgConcB: parseFloat(avgConcB.toFixed(2)),
      concDiff: parseFloat(concDiff.toFixed(2)),
      avgPhoneChecksB: parseFloat(avgChecksB.toFixed(2)),
      pairedList: pairedList
    };
  }
}

// Global experiment instance
window.focusExperiment = new ExperimentLab();
window.PASSAGE_1 = PASSAGE_1;
window.PASSAGE_2 = PASSAGE_2;
window.QUIZ_PASSAGE_1 = QUIZ_PASSAGE_1;
window.QUIZ_PASSAGE_2 = QUIZ_PASSAGE_2;

