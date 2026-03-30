<script setup>
import { useSessionStore } from '../stores/session'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const session = useSessionStore()
const router = useRouter()

const results = computed(() => session.results)
const totalQuestions = computed(() => session.totalQuestions)

const formatExpression = (expression) => {
   if (!expression || !expression.operands || !expression.operators) return '?'
   let expr = expression.operands[0]
   for (let i = 0; i < expression.operators.length; i++) {
      expr += ` ${expression.operators[i]} ${expression.operands[i + 1]}`
   }
   return expr
}

const playAgain = () => {
   // startSession will be called on PracticePage mount
   router.push('/practice')
}

const backToSettings = () => {
   router.push('/setting')
}

const getResultClass = (result) => {
   if (result.isTimeUp) return 'timeup'
   if (result.isCorrect) return 'correct'
   return 'incorrect'
}

const getResultLabel = (result) => {
   if (result.isTimeUp) return 'Time Up'
   if (result.isCorrect) return 'Correct'
   return 'Incorrect'
}

// Radial progress parameters
const radius = 52
const circumference = 2 * Math.PI * radius
const dashOffset = computed(() => {
   return circumference - (session.accuracy / 100) * circumference
})
</script>

<template>
   <div class="stats-page">
      <h1 class="page-title">Session Results</h1>

      <!-- Summary cards -->
      <div class="summary-grid">
         <!-- Accuracy ring -->
         <div class="summary-card accent-card">
            <div class="ring-wrapper">
               <svg class="ring-svg" viewBox="0 0 120 120">
                  <circle class="ring-track" cx="60" cy="60" r="52" />
                  <circle
                     class="ring-fill"
                     cx="60"
                     cy="60"
                     r="52"
                     :stroke-dasharray="circumference"
                     :stroke-dashoffset="dashOffset"
                  />
               </svg>
               <div class="ring-label">
                  <span class="ring-value">{{ session.accuracy }}%</span>
                  <span class="ring-desc">Accuracy</span>
               </div>
            </div>
         </div>

         <div class="summary-card">
            <span class="card-icon">📋</span>
            <span class="card-value">{{ totalQuestions }}</span>
            <span class="card-label">Total Questions</span>
         </div>

         <div class="summary-card correct-card">
            <span class="card-icon">✓</span>
            <span class="card-value">{{ session.correctCount }}</span>
            <span class="card-label">Correct</span>
         </div>

         <div class="summary-card incorrect-card">
            <span class="card-icon">✗</span>
            <span class="card-value">{{ session.incorrectCount }}</span>
            <span class="card-label">Incorrect</span>
         </div>

         <div class="summary-card timeup-card" v-if="session.timeUpCount > 0">
            <span class="card-icon">⏱</span>
            <span class="card-value">{{ session.timeUpCount }}</span>
            <span class="card-label">Time Up</span>
         </div>
      </div>

      <!-- Per-question breakdown -->
      <div class="breakdown-section">
         <h2 class="section-title">Question Breakdown</h2>
         <div class="question-list">
            <div
               v-for="(result, index) in results"
               :key="index"
               :class="['question-row', getResultClass(result)]"
            >
               <span class="q-index">#{{ index + 1 }}</span>
               <span class="q-expression">{{ formatExpression(result.expression) }}</span>
               <span class="q-answer">= {{ result.answer }}</span>
               <span :class="['q-status', getResultClass(result)]">{{ getResultLabel(result) }}</span>
            </div>
         </div>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
         <button @click="playAgain" class="btn btn-success">
            Play Again
         </button>
         <button @click="backToSettings" class="btn btn-secondary">
            Back to Settings
         </button>
      </div>
   </div>
</template>

<style scoped>
@import '../styles/practice.css';

.stats-page {
   margin: 0 auto;
   padding: 2em 1.5em;
   font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-title {
   text-align: center;
   font-size: 2em;
   font-weight: 800;
   color: #1a1a2e;
   margin-bottom: 1.5em;
   letter-spacing: -0.5px;
}

/* ── Summary Grid ──────────────────────────── */
.summary-grid {
   display: flex;
   flex-wrap: wrap;
   gap: 1em;
   justify-content: center;
   margin-bottom: 2.5em;
}

.summary-card {
   background: #fff;
   border-radius: 16px;
   padding: 1.4em 1.2em;
   min-width: 130px;
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 0.3em;
   box-shadow: 0 2px 16px rgba(0,0,0,0.07);
   transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
   transform: translateY(-3px);
   box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.card-icon {
   font-size: 1.6em;
}

.card-value {
   font-size: 2em;
   font-weight: 800;
   color: #1a1a2e;
   line-height: 1;
}

.card-label {
   font-size: 0.82em;
   color: #888;
   font-weight: 500;
   text-align: center;
}

.correct-card { border-top: 4px solid var(--color-green); }
.correct-card .card-value { color: var(--color-green); }

.incorrect-card { border-top: 4px solid var(--color-red); }
.incorrect-card .card-value { color: var(--color-red); }

.timeup-card { border-top: 4px solid var(--color-yellow); }
.timeup-card .card-value { color: var(--color-yellow); }

/* ── Accuracy Ring ─────────────────────────── */
.accent-card {
   border-top: 4px solid var(--color-emphasis-cyan);
   padding: 1.2em;
}

.ring-wrapper {
   position: relative;
   width: 120px;
   height: 120px;
}

.ring-svg {
   width: 120px;
   height: 120px;
   transform: rotate(-90deg);
}

.ring-track {
   fill: none;
   stroke: #e8f4ff;
   stroke-width: 10;
}

.ring-fill {
   fill: none;
   stroke: var(--color-emphasis-cyan);
   stroke-width: 10;
   stroke-linecap: round;
   transition: stroke-dashoffset 0.8s ease;
}

.ring-label {
   position: absolute;
   inset: 0;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
}

.ring-value {
   font-size: 1.4em;
   font-weight: 800;
   color: var(--color-emphasis-cyan);
   line-height: 1;
}

.ring-desc {
   font-size: 0.72em;
   color: #888;
   font-weight: 500;
}

/* ── Question Breakdown ────────────────────── */
.breakdown-section {
   margin-bottom: 2.5em;
}

.section-title {
   font-size: 1.15em;
   font-weight: 700;
   color: #333;
   margin-bottom: 1em;
}

.question-list {
   display: flex;
   flex-direction: column;
   gap: 0.6em;
}

.question-row {
   display: grid;
   grid-template-columns: 2em 1fr auto auto;
   align-items: center;
   gap: 0.8em;
   padding: 0.75em 1em;
   border-radius: 10px;
   background: #fafafa;
   border-left: 4px solid #ccc;
   font-size: 0.95em;
   transition: background 0.2s ease;
}

.question-row:hover {
   background: #f0f0f0;
}

.question-row.correct  { border-left-color: var(--color-green); }
.question-row.incorrect { border-left-color: var(--color-red); }
.question-row.timeup   { border-left-color: var(--color-yellow); }

.q-index {
   font-size: 0.8em;
   color: #aaa;
   font-weight: 600;
}

.q-expression {
   font-family: 'Courier New', monospace;
   font-weight: 600;
   color: #2c3e50;
   font-size: 1em;
   overflow: hidden;
   text-overflow: ellipsis;
   white-space: nowrap;
}

.q-answer {
   font-family: 'Courier New', monospace;
   color: #555;
   font-size: 0.9em;
}

.q-status {
   font-size: 0.78em;
   font-weight: 700;
   padding: 0.25em 0.7em;
   border-radius: 999px;
   white-space: nowrap;
}

.q-status.correct   { background: #e6f9f1; color: var(--color-green); }
.q-status.incorrect { background: #fdecea; color: var(--color-red); }
.q-status.timeup    { background: #fef9e7; color: var(--color-yellow); }

/* ── Action Buttons ────────────────────────── */
.action-buttons {
   display: flex;
   gap: 1em;
   justify-content: center;
   flex-wrap: wrap;
}

.btn {
   padding: 0.85em 2.2em;
   font-size: 1.05em;
   font-weight: 600;
   border: none;
   border-radius: 10px;
}


.btn-primary {
   background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
   color: white;
   box-shadow: 0 4px 14px rgba(66, 185, 131, 0.4);
}

.btn-secondary {
   background: #f0f0f0;
   color: #444;
}

.btn-secondary:hover {
   background: #e2e2e2;
}

/* ── Responsive ────────────────────────────── */
@media (max-width: 520px) {
   .question-row {
      grid-template-columns: 1.5em 1fr auto;
   }
   .q-answer { display: none; }
}
</style>
