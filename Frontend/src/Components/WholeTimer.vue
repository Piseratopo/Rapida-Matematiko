<script setup>
import { ref } from 'vue'

const props = defineProps({
   settings: {
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
const userAnswer = ref('')
const answerInput = ref(null)
let timerInterval = null

const startTimer = () => {
   timeRemaining.value = parseFloat(props.settings.timer.value)

   if (timerInterval) {
      clearInterval(timerInterval)
   }

   timerInterval = setInterval(() => {
      timeRemaining.value -= 0.01

      // Check answer continuously while timer runs
      emit('checkAnswer')

      if (timeRemaining.value <= 0) {
         endQuiz(true) // Time up
      }
   }, 10)
}

const endQuiz = (timeUp = false) => {
   clearInterval(timerInterval)
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
   focusInput: () => {
      setTimeout(() => {
         if (answerInput.value) {
            answerInput.value.focus()
         }
      }, 0)
   }
})
</script>

<template>
   <div class="whole-timer">
      <!-- Timer bar -->
      <div class="timer-container">
         <div class="timer-bar">
            <div
               class="timer-fill"
               :style="timeRemaining > 0 ? { width: (timeRemaining / parseFloat(settings.timer.value) * 100) + '%' } : {width: '0%'}"
            ></div>
         </div>
         <div class="timer-text">{{ timeRemaining.toFixed(1) }}s</div>
      </div>

      <!-- Expression display -->
      <div class="expression-display">
         <span>{{ expressionDisplay }}</span>
         <!-- Show correct answer when done -->
         <div v-if="isAnswerCorrect || isTimeUp" class="answer-result">
            <span class="equals-sign">=</span>
            <span :class="['answer-value', { 'correct': isAnswerCorrect, 'time-up': isTimeUp }]">
               {{ correctAnswer }}
            </span>
         </div>
      </div>

      <!-- Answer input -->
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

</style>
