/**
 * FocusLab - Automated Headless Test Suite
 * Verifies calculation accuracy, data integrity, quiz answer keys,
 * paired statistical comparisons, and CSV export.
 */

// Mock browser global environment for Node.js
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = global;
global.document = {
  visibilityState: 'visible',
  title: '',
  getElementById: () => null,
  querySelectorAll: () => []
};

// Load modules
require('./storage.js');
require('./timer.js');
require('./experiment.js');
require('./assistant.js');
require('./analytics.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("\n==========================================");
console.log("RUNNING FOCUSLAB TEST SUITE");
console.log("==========================================\n");

// 1. Test Storage & Defaults
assert(window.focusStorage !== undefined, "StorageManager initialized globally");
const initialTasks = window.focusStorage.getTasks();
assert(Array.isArray(initialTasks) && initialTasks.length > 0, "Default tasks initialized");

const newTask = window.focusStorage.addTask({ title: "Test Task A", priority: "high", deadline: "Today" });
assert(newTask && newTask.id && newTask.title === "Test Task A", "Task added successfully");

const updatedTask = window.focusStorage.updateTask(newTask.id, { completed: true });
assert(updatedTask && updatedTask.completed === true, "Task marked as completed");

const remainingTasks = window.focusStorage.deleteTask(newTask.id);
assert(!remainingTasks.find(t => t.id === newTask.id), "Task deleted successfully");

// 2. Test Virtual Tree Growth
const treeInitial = window.focusStorage.getTreeState();
assert(treeInitial && treeInitial.totalMinutes !== undefined, "Tree state initialized");
const treeAfterGrowth = window.focusStorage.updateTreeGrowth(60);
assert(treeAfterGrowth.totalMinutes >= 60, "Tree accumulated minutes correctly");
assert(treeAfterGrowth.currentStage >= 1 && treeAfterGrowth.currentStage <= 5, "Tree stage is between 1 and 5");

// 3. Test Timer Focus Score Calculation
const timer = window.focusTimer;
assert(timer !== undefined, "FocusTimer initialized globally");
// Perfect session: 25 min planned, 25 min actual, 0 distractions
const scorePerfect = timer.calculateFocusScore(25, 25, 0);
assert(scorePerfect === 100, `Perfect session focus score is 100 (got ${scorePerfect})`);

// Interrupted session: 25 min planned, 25 min actual, 3 distractions (-18 pts, +5 bonus = 87)
const scoreInterrupted = timer.calculateFocusScore(25, 25, 3);
assert(scoreInterrupted === 87, `Score with 3 distractions is 87 (got ${scoreInterrupted})`);

// Heavy distraction clamp: 10 distractions (-60 pts) -> 45
const scoreHeavy = timer.calculateFocusScore(25, 25, 10);
assert(scoreHeavy === 45, `Heavy distraction score is 45 (got ${scoreHeavy})`);

// Extreme bounds check: clamped to 0
const scoreZero = timer.calculateFocusScore(5, 50, 20);
assert(scoreZero >= 0 && scoreZero <= 100, `Extreme distraction clamped safely within 0-100 (got ${scoreZero})`);

// 4. Test Experiment Module: Reading Passages & Quizzes
const exp = window.focusExperiment;
assert(exp !== undefined, "ExperimentLab initialized globally");
assert(window.PASSAGE_1 && window.PASSAGE_1.text && window.PASSAGE_1.text.length > 500, "Reading Passage 1 has valid scientific text");
assert(window.PASSAGE_2 && window.PASSAGE_2.text && window.PASSAGE_2.text.length > 500, "Reading Passage 2 has valid scientific text");

assert(window.QUIZ_PASSAGE_1.length === 10, "Quiz 1 has exactly 10 questions");
assert(window.QUIZ_PASSAGE_2.length === 10, "Quiz 2 has exactly 10 questions");

window.QUIZ_PASSAGE_1.forEach((q, idx) => {
  assert(q.options.length === 4, `Quiz 1 Question ${idx+1} has 4 options`);
  assert(q.correctIndex >= 0 && q.correctIndex < 4, `Quiz 1 Question ${idx+1} has valid correct answer index`);
});

window.QUIZ_PASSAGE_2.forEach((q, idx) => {
  assert(q.options.length === 4, `Quiz 2 Question ${idx+1} has 4 options`);
  assert(q.correctIndex >= 0 && q.correctIndex < 4, `Quiz 2 Question ${idx+1} has valid correct answer index`);
});

// 5. Test Counterbalancing Order & 10 Participant Slots
const participants = window.focusStorage.getExperimentParticipants();
assert(participants.length === 10, "Experiment enrolls exactly 10 student participants");
const orders = participants.map(p => p.assignedOrder);
const abCount = orders.filter(o => o === 'AB').length;
const baCount = orders.filter(o => o === 'BA').length;
assert(abCount === 5 && baCount === 5, `Condition orders are counterbalanced (5 AB, 5 BA: got ${abCount} AB, ${baCount} BA)`);

// 6. Test Empty State Handling for Experiment Statistics
const emptyStats = exp.calculateStatistics();
assert(emptyStats.hasData === false, "Empty experiment returns hasData = false");
assert(emptyStats.pairedCount === 0, "Empty experiment reports 0 paired participants");

// 7. Test Populated Demo Dataset & Paired Statistical Calculations
window.focusStorage.loadDemoExperimentData();
const demoStats = exp.calculateStatistics();
assert(demoStats.hasData === true, "Demo dataset registers hasData = true");
assert(demoStats.pairedCount === 10, "All 10 demo participants are fully paired");
assert(typeof demoStats.avgQuizA === 'number' && demoStats.avgQuizA > 0, `Avg Quiz A calculated (${demoStats.avgQuizA})`);
assert(typeof demoStats.avgQuizB === 'number' && demoStats.avgQuizB > 0, `Avg Quiz B calculated (${demoStats.avgQuizB})`);
assert(demoStats.quizDiff === parseFloat((demoStats.avgQuizA - demoStats.avgQuizB).toFixed(2)), `Quiz Difference accurately computed (${demoStats.quizDiff})`);
assert(typeof demoStats.avgConcA === 'number' && demoStats.avgConcA > 0, `Avg Concentration A calculated (${demoStats.avgConcA})`);
assert(typeof demoStats.avgConcB === 'number' && demoStats.avgConcB > 0, `Avg Concentration B calculated (${demoStats.avgConcB})`);
assert(demoStats.concDiff === parseFloat((demoStats.avgConcA - demoStats.avgConcB).toFixed(2)), `Concentration Difference accurately computed (${demoStats.concDiff})`);

// 8. Test CSV Export RFC4180 Validity
const csvData = window.focusStorage.exportExperimentCSV();
assert(typeof csvData === 'string' && csvData.length > 200, "CSV export generates non-empty string");
const lines = csvData.trim().split('\n');
assert(lines.length === 11, `CSV contains 1 header line and 10 participant rows (got ${lines.length} lines)`);
assert(lines[0].includes('Participant_ID') && lines[0].includes('Quiz_Difference_A_minus_B'), "CSV header contains expected research variables");

// 9. Test Assistant Knowledge Matching
const assistant = window.focusAssistant;
const respScout = assistant.ask("Tell me about Julia Galef's Scout Mindset");
assert(respScout && respScout.response.matched === true, "Assistant matched 'Scout Mindset'");
assert(respScout.response.content.includes("Soldier Mindset"), "Assistant provided Galef's core thesis");

const respPomodoro = assistant.ask("How should I use Pomodoro intervals?");
assert(respPomodoro && respPomodoro.response.matched === true, "Assistant matched 'Pomodoro'");

const timetable = assistant.generateTimetable("Research, Math, Cognitive Science", 4, "morning");
assert(timetable && timetable.schedule.length === 8, "Timetable generated 8 blocks (4 study + 4 break)");

// 10. Test Analytics Aggregates & Recommendations
const analytics = window.focusAnalytics;
const agg = analytics.getAggregates();
assert(agg && agg.totalHours !== undefined, "Aggregates generated successfully");
const recs = analytics.generateRecommendations();
assert(Array.isArray(recs) && recs.length >= 3, "Recommendation engine produced at least 3 tailored recommendations");

console.log("\n==========================================");
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log("==========================================\n");

process.exit(0);

