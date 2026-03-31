<script setup>
import { useSettingsStore } from '../stores/settings'
import { useSessionStore } from '../stores/session'
import { onMounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import WholeTimer from './WholeTimer.vue'
import IndividualTimer from './IndividualTimer.vue'

const settings = useSettingsStore()
const session = useSessionStore()
const router = useRouter()

const countdownDisplay = ref('')
const userAnswer = ref('')
const correctAnswer = ref('')
const isAnswerCorrect = ref(false)
const isTimeUp = ref(false)
const expressionDisplay = ref('')
const questionAnswered = ref(false) // true once current question is done
let countdownInterval = null
let isCountingDown = ref(false)
let currentExpression = { operands: [], operators: [] }

// Timer component refs
const wholeTimerRef = ref(null)
const individualTimerRef = ref(null)

// Generate random integer between min and max (inclusive)
const generateRandomInteger = (min, max) => {
   const minBigInt = BigInt(min)
   const maxBigInt = BigInt(max)
   const range = maxBigInt - minBigInt + 1n
   const randomValue = BigInt(Math.floor(Math.random() * Number(range)))
   return (minBigInt + randomValue).toString()
}

// Calculate the correct answer for the expression
const calculateAnswer = (expression) => {
   try {
      const tokens = expression.trim().split(/\s+/)
      let result = BigInt(tokens[0])

      for (let i = 1; i < tokens.length; i += 2) {
         const operator = tokens[i]
         const operand = BigInt(tokens[i + 1])

         if (operator === '+') {
            result = result + operand
         } else if (operator === '-' || operator === '−') {
            result = result - operand
         }
      }

      return result.toString()
   } catch (error) {
      console.error('Error calculating answer:', error)
      return '0'
   }
}

// End the current question (time up or correct answer)
const endQuiz = (timeUp = false) => {
   isTimeUp.value = timeUp
   isAnswerCorrect.value = !timeUp
   questionAnswered.value = true
}

// Save the current question to MongoDB
const saveQuestion = async () => {
   try {
      // Get timing information from the appropriate timer component
      let timeAllowed = 0
      let timeTaken = 0
      
      if (settings.timer.type === 'whole' && wholeTimerRef.value) {
         timeAllowed = parseFloat(settings.timer.value)
         timeTaken = timeAllowed - wholeTimerRef.value.timeRemaining
      } else if (settings.timer.type === 'individual' && individualTimerRef.value) {
         // For individual timer, calculate total time allowed
         timeAllowed = (parseFloat(settings.timer.value) * settings.length) + 10
         timeTaken = timeAllowed - individualTimerRef.value.timeRemaining
      }

      const questionData = {
         expression: currentExpression,
         answer: correctAnswer.value,
         isCorrect: isAnswerCorrect.value,
         timeUp: isTimeUp.value,
         timeAllowed: Math.round(timeAllowed),
         timeTaken: Math.max(0, Math.round(timeTaken)),
         solvedAt: new Date().toISOString()
      }

      const apiURL = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiURL}/api/questions`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(questionData)
      })

      if (response.ok) {
         const result = await response.json()
         console.log('Question saved successfully:', result)
         alert('Question saved successfully!')
      } else {
         console.error('Failed to save question')
         alert('Failed to save question')
      }
   } catch (error) {
      console.error('Error saving question:', error)
      alert('Error saving question')
   }
}

// Advance to the next question in the session
const nextQuestion = () => {
   // Record in session store
   session.recordAnswer({
      expression: currentExpression,
      answer: correctAnswer.value,
      isCorrect: !isTimeUp.value,
      isTimeUp: isTimeUp.value
   })

   session.nextQuestion()
   userAnswer.value = ''
   isAnswerCorrect.value = false
   isTimeUp.value = false
   questionAnswered.value = false
   expressionDisplay.value = ''
   clearInterval(countdownInterval)

   // Reset timer components
   if (wholeTimerRef.value) {
      wholeTimerRef.value.endQuiz(false)
   }
   if (individualTimerRef.value) {
      individualTimerRef.value.reset()
   }

   startCountdown()
}

// Navigate to statistics page
const viewStatistics = () => {
   // Record in session store
   session.recordAnswer({
      expression: currentExpression,
      answer: correctAnswer.value,
      isCorrect: !isTimeUp.value,
      isTimeUp: isTimeUp.value
   })
   
   router.push('/statistics')
}

const generateExpression = (inputOperands, inputOperators) => {
   let operands
   let operators

   if (inputOperands && inputOperands.length > 0) {
      operands = [...inputOperands]
      operators = [...inputOperators]
   } else {
      operands = []
      for (let i = 0; i < settings.length; i++) {
         operands.push(generateRandomInteger(settings.minimum, settings.maximum))
      }

      const useAddition = settings.operations.addition
      const useSubtraction = settings.operations.subtraction

      operators = []
      let currentResult = BigInt(operands[0])
      const threshold = 0.6
      for (let i = 0; i < settings.length - 1; i++) {
         let operator
         if (useAddition && useSubtraction) {
            operator = Math.random() < threshold ? '+' : '−'
            if (!settings.operations.allowNegative && operator === '−') {
               if (currentResult < BigInt(operands[i + 1])) {
                  operator = '+'
               }
            }
         } else if (useAddition) {
            operator = '+'
         } else if (useSubtraction) {
            operator = '−'
            if (!settings.operations.allowNegative && currentResult < BigInt(operands[i + 1])) {
               operator = '+'
            }
         } else {
            operator = Math.random() < threshold ? '+' : '−'
            if (!settings.operations.allowNegative && operator === '−') {
               if (currentResult < BigInt(operands[i + 1])) {
                  operator = '+'
               }
            }
         }
         operators.push(operator)
         currentResult = operator === '+' ? currentResult + BigInt(operands[i + 1]) : currentResult - BigInt(operands[i + 1])
      }
   }

   currentExpression = { operands: [...operands], operators: [...operators] }

   let expression = operands[0]
   for (let i = 0; i < operators.length; i++) {
      expression += ` ${operators[i]} ${operands[i + 1]}`
   }

   return expression
}

// Start 2-second countdown before showing expression
const startCountdown = () => {
   isCountingDown.value = true
   userAnswer.value = ''
   isAnswerCorrect.value = false
   isTimeUp.value = false
   questionAnswered.value = false
   let countdown = 2

   countdownDisplay.value = countdown.toString()

   countdownInterval = setInterval(() => {
      countdown -= 1
      countdownDisplay.value = countdown.toString()

      if (countdown <= 0) {
         clearInterval(countdownInterval)
         isCountingDown.value = false
         countdownDisplay.value = ''

         // Check if there is a stored question (only for first question of session)
         const storedQuestion = localStorage.getItem('savedQuestionToPlay')
         if (storedQuestion && session.currentQuestionIndex === 0) {
            const question = JSON.parse(storedQuestion)
            const expression = generateExpression(question.expression.operands, question.expression.operators)
            expressionDisplay.value = expression
            correctAnswer.value = question.answer
            localStorage.removeItem('savedQuestionToPlay')
         } else {
            const expression = generateExpression()
            expressionDisplay.value = expression
            correctAnswer.value = calculateAnswer(expression)
         }

         // Start timer based on type
         if (settings.timer.type === 'whole') {
            nextTick(() => {
               if (wholeTimerRef.value) {
                  wholeTimerRef.value.startTimer()
                  wholeTimerRef.value.focusInput()
               }
            })
         } else {
            nextTick(() => {
               if (individualTimerRef.value) {
                  individualTimerRef.value.startTimer()
                  individualTimerRef.value.focusInput()
               }
            })
         }
      }
   }, 1000)
}

// Initialize the component — start a new session
onMounted(() => {
   session.startSession(settings.questionsPerSession)
   startCountdown()
})
</script>

<template>
   <div class="practice-container">
      <!-- Session progress bar -->
      <div class="session-progress" v-if="!isCountingDown">
         <div class="progress-header">
            <span class="progress-label">Question {{ session.currentQuestionIndex + 1 }} of {{ session.totalQuestions }}</span>
            <div class="progress-stats">
               <span class="stat correct-stat">✓ {{ session.correctCount }}</span>
               <span class="stat incorrect-stat">✗ {{ session.incorrectCount }}</span>
            </div>
         </div>
         <div class="progress-bar-track">
            <div
               class="progress-bar-fill"
               :style="{ width: ((session.currentQuestionIndex / session.totalQuestions) * 100) + '%' }"
            ></div>
         </div>
      </div>

      <!-- Show countdown during countdown phase -->
      <div v-if="isCountingDown" class="countdown-display">
         {{ countdownDisplay }}
      </div>

      <!-- Show expression and answer input after countdown -->
      <template v-else>
         <!-- Whole Timer Component -->
         <WholeTimer
            v-if="settings.timer.type === 'whole'"
            ref="wholeTimerRef"
            :settings="settings"
            :expression-display="expressionDisplay"
            :correct-answer="correctAnswer"
            :is-answer-correct="isAnswerCorrect"
            :is-time-up="isTimeUp"
            @time-up="endQuiz"
         />

         <!-- Individual Timer Component -->
         <IndividualTimer
            v-else
            ref="individualTimerRef"
            :settings="settings"
            :expression-display="expressionDisplay"
            :current-expression="currentExpression"
            :correct-answer="correctAnswer"
            :is-answer-correct="isAnswerCorrect"
            :is-time-up="isTimeUp"
            @time-up="endQuiz"
         />
      </template>

      <!-- Buttons (shown when question is completed) -->
      <div v-if="questionAnswered" class="button-container">
         <button @click="saveQuestion" class="save-button">
            Save Question
         </button>

         <!-- Not the last question: show Next -->
         <button
            v-if="!session.isLastQuestion"
            @click="nextQuestion"
            class="next-button btn-success"
         >
            Next Question →
         </button>

         <!-- Last question: show View Statistics -->
         <button
            v-else
            @click="viewStatistics"
            class="stats-button"
         >
            View Statistics 📊
         </button>
      </div>
   </div>
</template>

<style scoped>
@import url('../styles/practice.css');

.practice-container {
   padding: 2em;
}

/* ── Session Progress ─────────────────────── */
.session-progress {
   margin-bottom: 1.5em;
}

.progress-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 0.5em;
}

.progress-label {
   font-size: 0.95em;
   font-weight: 600;
   color: #555;
}

.progress-stats {
   display: flex;
   gap: 0.75em;
}

.stat {
   font-weight: 700;
   font-size: 0.9em;
   padding: 0.2em 0.6em;
   border-radius: 999px;
}

.correct-stat {
   background-color: #e6f9f1;
   color: #27ae60;
}

.incorrect-stat {
   background-color: #fdecea;
   color: #e74c3c;
}

.progress-bar-track {
   width: 100%;
   height: 6px;
   background: #e0e0e0;
   border-radius: 999px;
   overflow: hidden;
}

.progress-bar-fill {
   height: 100%;
   background: linear-gradient(90deg, #42b983, #27ae60);
   border-radius: 999px;
   transition: width 0.4s ease;
}

/* ── Countdown ────────────────────────────── */
.countdown-display {
   font-size: 4em;
   font-weight: bold;
   color: var(--color-green);
   text-align: center;
   margin: 2em 0;
   animation: pulse 1s ease-in-out infinite;
   overflow: hidden;
}

@keyframes pulse {
   0% { transform: scale(0.9); }
   50% { transform: scale(1); }
   100% { transform: scale(0.9); }
}

/* ── Action Buttons ───────────────────────── */
.button-container {
   display: flex;
   gap: 1em;
   justify-content: center;
   margin-top: 1.5em;
   flex-wrap: wrap;
}

.save-button {
   all: unset;
   padding: 0.8em 2em;
   font-size: 1.1em;
   border-radius: 8px;
   cursor: pointer;
   font-weight: 600;
   background-color: #2196F3;
   color: white;
   transition: background-color 0.3s ease, transform 0.15s ease;
}

.save-button:hover {
   background-color: #1976D2;
   transform: translateY(-2px);
}

.next-button {
   padding: 0.8em 2em;
   font-size: 1.1em;
   border-radius: 8px;
   cursor: pointer;
   font-weight: 600;
   color: white;
}

.stats-button {
   all: unset;
   padding: 0.8em 2em;
   font-size: 1.1em;
   border-radius: 8px;
   cursor: pointer;
   font-weight: 600;
   background: linear-gradient(135deg, #6c63ff, #4f46e5);
   color: white;
   box-shadow: 0 4px 14px rgba(108, 99, 255, 0.4);
   transition: opacity 0.3s ease, transform 0.15s ease;
}

.stats-button:hover {
   opacity: 0.9;
   transform: translateY(-2px);
}
</style>
