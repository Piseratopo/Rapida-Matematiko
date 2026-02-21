<script setup>
import { useSettingsStore } from '../stores/settings'
import { onMounted, ref, nextTick } from 'vue'
import WholeTimer from './WholeTimer.vue'
import IndividualTimer from './IndividualTimer.vue'

const settings = useSettingsStore()
const countdownDisplay = ref('')
const userAnswer = ref('')
const correctAnswer = ref('')
const isAnswerCorrect = ref(false)
const isTimeUp = ref(false)
const expressionDisplay = ref('')
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
   // Simple evaluation for basic arithmetic
   try {
      // Replace multiple spaces with single space and split
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


// End the quiz (time up or correct answer)
const endQuiz = (timeUp = false) => {
   isTimeUp.value = timeUp
   if (timeUp) {
      isAnswerCorrect.value = false
   } else {
      isAnswerCorrect.value = true
   }
}

// Restart the quiz
const restartQuiz = () => {
   userAnswer.value = ''
   isAnswerCorrect.value = false
   isTimeUp.value = false
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

const generateExpression = () => {
   const operands = []
   const operators = []

   // Generate operands
   for (let i = 0; i < settings.length; i++) {
      operands.push(generateRandomInteger(settings.minimum, settings.maximum))
   }

   // Determine which operators to use
   const useAddition = settings.operations.addition
   const useSubtraction = settings.operations.subtraction

   // Generate operators
   let currentResult = BigInt(operands[0])
   for (let i = 0; i < settings.length - 1; i++) {
      let operator
      if (useAddition && useSubtraction) {
         // Both allowed - randomly choose
         operator = Math.random() < 0.6 ? '+' : '−'

         // If negative results are not allowed and this is subtraction,
         // check if it would result in negative
         if (!settings.operations.allowNegative && operator === '−') {
            if (currentResult < BigInt(operands[i + 1])) {
               operator = '+' // Switch to addition to avoid negative result
            }
         }
      } else if (useAddition) {
         operator = '+'
      } else if (useSubtraction) {
         // Only subtraction allowed
         operator = '−'
         if (!settings.operations.allowNegative && currentResult < BigInt(operands[i + 1])) {
            operator = '+'
         }
      } else {
         // None selected - default to both (randomly choose)
         operator = Math.random() < 0.6 ? '+' : '−'

         if (!settings.operations.allowNegative && operator === '−') {
            if (currentResult < BigInt(operands[i + 1])) {
               operator = '+'
            }
         }
      }
      operators.push(operator)

      currentResult = operator === '+' ? currentResult + BigInt(operands[i + 1]) : currentResult - BigInt(operands[i + 1])
   }

   // Store expression for individual timer
   currentExpression = { operands: [...operands], operators: [...operators] }

   // Build expression string for display (for whole timer mode)
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
   let countdown = 2

   countdownDisplay.value = countdown.toString()

   countdownInterval = setInterval(() => {
      countdown -= 1
      countdownDisplay.value = countdown.toString()

      if (countdown <= 0) {
         clearInterval(countdownInterval)
         isCountingDown.value = false
         countdownDisplay.value = ''

         // Generate and display expression
         const expression = generateExpression()
         expressionDisplay.value = expression
         correctAnswer.value = calculateAnswer(expression)

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

// Initialize the component
onMounted(() => {
   startCountdown()
})
</script>

<template>
   <div class="add-and-sub-container">
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
            @check-answer="checkAnswer"
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
            @check-answer="checkAnswer"
         />
      </template>

      <!-- Restart button (shown when question is completed) -->
      <button
         v-if="isAnswerCorrect || isTimeUp"
         @click="restartQuiz"
         class="restart-button"
      >
         Restart
      </button>
   </div>
</template>

<style scoped>
.add-and-sub-container{
   padding: 2em;
}

.countdown-display {
   font-size: 4em;
   font-weight: bold;
   color: #42b983;
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

.restart-button {
   margin-top: 1em;
   padding: 0.8em 2em;
   font-size: 1.2em;
   background-color: #42b983;
   color: white;
   border: none;
   border-radius: 5px;
   cursor: pointer;
   transition: background-color 0.3s ease;
}

.restart-button:hover {
   background-color: #369870;
}
</style>
