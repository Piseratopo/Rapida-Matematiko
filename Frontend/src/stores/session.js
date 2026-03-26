import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSessionStore = defineStore('session', () => {
   const totalQuestions = ref(0)
   const currentQuestionIndex = ref(0)
   // Each entry: { expression, answer, isCorrect, isTimeUp }
   const results = ref([])

   const isSessionActive = computed(() => totalQuestions.value > 0)
   const isLastQuestion = computed(() => currentQuestionIndex.value >= totalQuestions.value - 1)
   const correctCount = computed(() => results.value.filter(r => r.isCorrect).length)
   const incorrectCount = computed(() => results.value.filter(r => !r.isCorrect).length)
   const timeUpCount = computed(() => results.value.filter(r => r.isTimeUp).length)
   const accuracy = computed(() => {
      if (results.value.length === 0) return 0
      return Math.round((correctCount.value / results.value.length) * 100)
   })

   const startSession = (numQuestions) => {
      totalQuestions.value = numQuestions
      currentQuestionIndex.value = 0
      results.value = []
   }

   const recordAnswer = ({ expression, answer, isCorrect, isTimeUp }) => {
      results.value.push({ expression, answer, isCorrect, isTimeUp })
   }

   const nextQuestion = () => {
      currentQuestionIndex.value++
   }

   const reset = () => {
      totalQuestions.value = 0
      currentQuestionIndex.value = 0
      results.value = []
   }

   return {
      // State
      totalQuestions,
      currentQuestionIndex,
      results,
      // Computed
      isSessionActive,
      isLastQuestion,
      correctCount,
      incorrectCount,
      timeUpCount,
      accuracy,
      // Actions
      startSession,
      recordAnswer,
      nextQuestion,
      reset
   }
})
