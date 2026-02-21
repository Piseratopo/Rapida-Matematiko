<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
   settings: {
      type: Object,
      required: true
   },
   currentExpression: {
      type: Object,
      required: true
   },
   expressionDisplay: {
      type: String,
      required: true
   },
   correctAnswer: {
      type: String,
      required: true
   },
   isAnswerCorrect: {
      type: Boolean,
      required: true
   },
   isTimeUp: {
      type: Boolean,
      required: true
   }
})

const emit = defineEmits(['timeUp', 'checkAnswer'])

const timeRemaining = ref(0)
const currentNumber = ref('')
const isShowingNumber = ref(false)
const userAnswer = ref('')
const answerInput = ref(null)
let timerInterval = null
let individualTimerInterval = null
let currentOperandIndex = 0

const startTimer = () => {
   // Calculate total time: (timer value * number of operands) + 10 seconds for answer
   const totalTime = (parseFloat(props.settings.timer.value) * props.settings.length) + 10
   timeRemaining.value = totalTime

   currentOperandIndex = 0
   showNextNumber()

   if (timerInterval) {
      clearInterval(timerInterval)
   }

   timerInterval = setInterval(() => {
      timeRemaining.value -= 0.01

      if (timeRemaining.value <= 0) {
         endQuiz(true) // Time up
      }
   }, 10)
}

const showNextNumber = () => {
   if (currentOperandIndex >= props.currentExpression.operands.length) {
      // All numbers shown, show answer input
      isShowingNumber.value = false
      currentNumber.value = ''
      nextTick(() => {
         if (answerInput.value) {
            answerInput.value.focus()
         }
      })
      return
   }

   const operand = props.currentExpression.operands[currentOperandIndex]
   let displayNumber = operand

   // Add '−' sign for subtraction (except first operand)
   if (currentOperandIndex > 0 &&
      (props.currentExpression.operators[currentOperandIndex - 1] === '-' ||
       props.currentExpression.operators[currentOperandIndex - 1] === '−')
   ) {
      displayNumber = '−' + operand
   }

   currentNumber.value = displayNumber
   isShowingNumber.value = true

   // Show number for timer duration, then hide for 0.1s
   individualTimerInterval = setTimeout(() => {
      isShowingNumber.value = false
      currentNumber.value = ''

      // 0.1s pause before next number
      setTimeout(() => {
         currentOperandIndex++
         showNextNumber()
      }, 100)
   }, parseFloat(props.settings.timer.value) * 1000)
}

const endQuiz = (timeUp = false) => {
   clearInterval(timerInterval)
   clearTimeout(individualTimerInterval)
   emit('timeUp', timeUp)
}

const checkAnswer = () => {
   if (!userAnswer.value || props.isAnswerCorrect || props.isTimeUp) return

   const normalizedUserAnswer = userAnswer.value.trim()
   if (normalizedUserAnswer === props.correctAnswer) {
      endQuiz(false) // Correct answer
   }
}

// Expose methods to parent
defineExpose({
   startTimer,
   endQuiz,
   reset: () => {
      currentNumber.value = ''
      isShowingNumber.value = false
      currentOperandIndex = 0
      userAnswer.value = ''
      clearInterval(timerInterval)
      clearTimeout(individualTimerInterval)
   },
   focusInput: () => {
      if (answerInput.value) {
         answerInput.value.focus()
      }
   }
})
</script>

<template>
   <div class="individual-timer">
      <!-- Timer bar -->
      <div class="timer-container">
         <div class="timer-bar">
            <div
               class="timer-fill"
               :style="timeRemaining > 0 ? {
                  width: (timeRemaining / ((parseFloat(settings.timer.value) * settings.length) + 10) * 100) + '%'
               } : {width: '0%'}"
            ></div>
         </div>
         <div class="timer-text">{{ timeRemaining.toFixed(1) }}s</div>
      </div>

      <!-- Individual timer: show numbers one by one -->
      <div class="expression-display">
         <div v-if="isShowingNumber" class="number-display">
            {{ currentNumber }}
         </div>
         <div v-else-if="currentNumber === ''" class="waiting-display">
            <!-- Show expression when the quiz is finished -->
            <span v-if="isAnswerCorrect || isTimeUp" class="expression-text">
               {{ expressionDisplay }}
            </span>
         </div>
         <!-- Show correct answer when done for individual timer -->
         <div v-if="isAnswerCorrect || isTimeUp" class="answer-result">
            <span class="equals-sign">=</span>
            <span :class="['answer-value', { 'correct': isAnswerCorrect, 'time-up': isTimeUp }]">
               {{ correctAnswer }}
            </span>
         </div>
      </div>

      <input
         ref="answerInput"
         v-model="userAnswer"
         @input="checkAnswer"
         :class="[
            'answer-input',
            { 'correct': isAnswerCorrect },
            { 'time-up': isTimeUp }
         ]"
         :disabled="isAnswerCorrect || isTimeUp"
      />
   </div>
</template>

<style scoped>
.number-display {
   font-size: 2rem;
   font-weight: bold;
   text-align: center;
   animation: fadeInOut 0.3s ease-in-out;
}

@keyframes fadeInOut {
   0% { opacity: 0; transform: scale(0.8); }
   50% { opacity: 1; transform: scale(1); }
   100% { opacity: 1; transform: scale(1); }
}
</style>
