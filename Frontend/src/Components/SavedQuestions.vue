<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const questions = ref([])
const loading = ref(true)
const error = ref(null)

// Fetch saved questions from backend
const fetchQuestions = async () => {
   try {
      loading.value = true
      const response = await fetch('http://localhost:3001/api/questions')
      
      if (!response.ok) {
         throw new Error('Failed to fetch questions')
      }
      
      const data = await response.json()
      questions.value = data.questions || []
   } catch (err) {
      error.value = err.message
      console.error('Error fetching questions:', err)
   } finally {
      loading.value = false
   }
}

// Format expression for display
const formatExpression = (expression) => {
   if (!expression || !expression.operands || !expression.operators) {
      return 'Invalid expression'
   }
   
   let expr = expression.operands[0]
   for (let i = 0; i < expression.operators.length; i++) {
      expr += ` ${expression.operators[i]} ${expression.operands[i + 1]}`
   }
   return expr
}

// Format date for display
const formatDate = (timestamp) => {
   const date = new Date(timestamp)
   return date.toLocaleString()
}

// Get status display
const getStatusDisplay = (question) => {
   if (question.timeUp) {
      return { text: 'Time Up', class: 'status-timeup' }
   }
   if (question.isCorrect === true) {
      return { text: 'Correct', class: 'status-correct' }
   }
   if (question.isCorrect === false) {
      return { text: 'Incorrect', class: 'status-incorrect' }
   }
   return { text: 'Unknown', class: 'status-unknown' }
}

// Get CSS class for question card based on status
const getStatusClass = (question) => {
   if (question.timeUp) {
      return 'timeup'
   }
   if (question.isCorrect === true) {
      return 'correct'
   }
   if (question.isCorrect === false) {
      return 'incorrect'
   }
   return ''
}

// Delete a question
const deleteQuestion = async (id) => {
   if (!confirm('Are you sure you want to delete this question?')) {
      return
   }
   
   try {
      const response = await fetch(`http://localhost:3001/api/questions/${id}`, {
         method: 'DELETE'
      })
      
      if (!response.ok) {
         throw new Error('Failed to delete question')
      }
      
      // Remove from local array
      questions.value = questions.value.filter(q => q._id !== id)
   } catch (err) {
      console.error('Error deleting question:', err)
      alert('Failed to delete question')
   }
}

// Refresh questions
const refreshQuestions = () => {
   fetchQuestions()
}

// Play a specific question on the practice page
const playQuestion = (question) => {
   // Store the question data in localStorage for the practice page to use
   localStorage.setItem('savedQuestionToPlay', JSON.stringify(question))
   router.push('/setting')
}

onMounted(() => {
   fetchQuestions()
})
</script>

<template>
   <div class="saved-questions-container">
      <div class="header">
         <h2>Saved Questions</h2>
         <button @click="refreshQuestions" class="refresh-btn" :disabled="loading">
         {{ loading ? 'Loading...' : 'Refresh' }}
         </button>
      </div>

      <!-- Statistics -->
      <div v-if="questions.length > 0" class="statistics">
         <h3>Statistics</h3>
         <div class="stats-grid">
         <div class="stat-item">
            <span class="stat-label">Total Questions:</span>
            <span class="stat-value">{{ questions.length }}</span>
         </div>
         <div class="stat-item">
            <span class="stat-label">Correct:</span>
            <span class="stat-value correct">
               {{ questions.filter(q => q.isCorrect === true).length }}
            </span>
         </div>
         <div class="stat-item">
            <span class="stat-label">Incorrect:</span>
            <span class="stat-value incorrect">
               {{ questions.filter(q => q.isCorrect === false).length }}
            </span>
         </div>
         <div class="stat-item">
            <span class="stat-label">Time Up:</span>
            <span class="stat-value timeup">
               {{ questions.filter(q => q.timeUp === true).length }}
            </span>
         </div>
         </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading">
         <p>Loading saved questions...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error">
         <p>Error: {{ error }}</p>
         <button @click="refreshQuestions" class="retry-btn">Retry</button>
      </div>

      <!-- Empty state -->
      <div v-else-if="questions.length === 0" class="empty">
         <p>No saved questions yet.</p>
         <p>Complete some practice questions and save them to see them here!</p>
      </div>

      <!-- Questions list -->
      <div v-else class="questions-list">
         <div v-for="question in questions" :key="question._id" :class="['question-card', getStatusClass(question)]">
         <div class="question-content">
            <div class="expression">
               {{ formatExpression(question.expression) }}
            </div>
            <div class="question-meta">
               <span class="date">{{ formatDate(question.timestamp) }}</span>
               <span :class="['status', getStatusDisplay(question).class]">
               {{ getStatusDisplay(question).text }}
               </span>
            </div>
         </div>
         <div class="question-actions">
            <button @click="playQuestion(question)" class="play-btn">
               Play
            </button>
            <button @click="deleteQuestion(question._id)" class="delete-btn">
               Delete
            </button>
         </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
.saved-questions-container {
   margin: 0 auto;
   padding: 2em;
}

.header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: 2em;
}

.header h2 {
   margin: 0;
   color: #2c3e50;
}

.refresh-btn, .retry-btn {
  padding: 0.5em 1em;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.refresh-btn:hover, .retry-btn:hover {
  background-color: #369870;
}

.refresh-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3em;
  color: #666;
}

.error {
  color: #e74c3c;
}

.questions-list {
   margin-top: 2rem;
}

.question-card {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 1.5em;
   margin-bottom: 1em;
   background-color: #f8f9fa;
   border-radius: 8px;
   border-left: 4px solid var(--color-green);
   transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.question-card.incorrect,
.question-card.timeup {
  border-left-color: var(--color-red);
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.question-content {
  flex: 1;
}

.expression {
   font-size: 1.3em;
   font-weight: 600;
   color: #2c3e50;
   margin-bottom: 0.5em;
   font-family: 'Courier New', monospace;
}

.question-meta {
   display: flex;
   gap: 1em;
   align-items: center;
   font-size: 0.9em;
}

.date {
  color: #666;
}

.status {
  padding: 0.2em 0.6em;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.85em;
}

.status-correct {
  background-color: var(--color-green);
  color: white;
}

.status-incorrect {
  background-color: var(--color-red);
  color: white;
}

.status-timeup {
  background-color: var(--color-red);
  color: white;
}

.status-unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.question-actions {
  margin-left: 1em;
  display: flex;
  gap: 0.5em;
}

.play-btn {
  padding: 0.4em 0.8em;
  background-color: var(--color-green);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  transition: background-color 0.3s ease;
}

.play-btn:hover {
  background-color: #369870;
}

.delete-btn {
  padding: 0.4em 0.8em;
  background-color: var(--color-red);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: red;
}

.statistics {
  background-color: #f8f9fa;
  padding: 1.5em;
  border-radius: 8px;
  margin-top: 2em;
}

.statistics h3 {
  margin-top: 0;
  margin-bottom: 1em;
  color: #2c3e50;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1em;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;
  background-color: white;
  border-radius: 4px;
}

.stat-label {
  color: #666;
  font-size: 0.9em;
}

.stat-value {
  font-weight: 600;
  font-size: 1.1em;
}

.stat-value.correct {
  color: var(--color-green);
}

.stat-value.incorrect {
  color: var(--color-red);
}

.stat-value.timeup {
  color: var(--color-yellow);
}

@media (max-width: 768px) {
   .saved-questions-container {
      padding: 1em;
   }
   
   .header {
      flex-direction: column;
      gap: 1em;
      align-items: flex-start;
   }
   
   .question-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 1em;
   }
   
   .question-actions {
      margin-left: 0;
      align-self: flex-end;
   }
   
   .question-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5em;
   }
}
</style>
