<script setup>
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'

const router = useRouter()
const settings = useSettingsStore()

const navigateToPractice = () => {
   router.push('/practice')
}

// Validate and update operations
const updateOperations = () => {
   const checkboxes = document.querySelectorAll('input[type="checkbox"]')
   settings.updateOperations({
      addition: checkboxes[0].checked,
      subtraction: checkboxes[1].checked
   })
}

const isValidBigInt = (str) => {
   return /^[0-9]+$/.test(str) && str.length > 0
}

const isValidDecimal = (str) => {
   return /^[0-9]*\.?[0-9]+$/.test(str) && str.length > 0 && parseFloat(str) > 0
}

// Validate and update range during input (no swapping)
const updateRangeInput = () => {
   const minInput = document.getElementById('minimum')
   const maxInput = document.getElementById('maximum')

   // Validate inputs
   const minStr = minInput.value.trim()
   const maxStr = maxInput.value.trim()

   if (isValidBigInt(minStr) && isValidBigInt(maxStr)) {
      // Convert to BigInt for comparison
      const min = BigInt(minStr)
      const max = BigInt(maxStr)

      // Only update settings if min <= max, don't swap during input
      if (min <= max) {
         settings.updateRange(minStr, maxStr)
      }
   } else if (minStr === '' || maxStr === '') {
      // Allow empty strings but don't reset during input
   }
   // Don't reset to defaults during input - let user finish typing
}

// Final validation and swapping when user finishes input
const updateRangeFinal = () => {
   const minInput = document.getElementById('minimum')
   const maxInput = document.getElementById('maximum')

   // Validate inputs
   const minStr = minInput.value.trim()
   const maxStr = maxInput.value.trim()

   if (isValidBigInt(minStr) && isValidBigInt(maxStr)) {
      // Convert to BigInt for comparison
      const min = BigInt(minStr)
      const max = BigInt(maxStr)

      // Ensure minimum is not greater than maximum
      if (min <= max) {
         settings.updateRange(minStr, maxStr)
      } else {
         // Swap if min > max
         settings.updateRange(maxStr, minStr)
         minInput.value = maxStr
         maxInput.value = minStr
      }
   } else if (minStr === '' || maxStr === '') {
      // Handle empty strings
      if (minStr === '') {
         minInput.value = 0
         settings.updateRange('0', maxStr || '100')
      }
      if (maxStr === '') {
         maxInput.value = 100
         settings.updateRange(minStr || '0', '100')
      }
   } else {
      // Invalid input - reset to defaults
      minInput.value = settings.minimum
      maxInput.value = settings.maximum
   }

   // Also run validation for visual feedback
   validateInput({ target: minInput })
   validateInput({ target: maxInput })
}

const updateTimerValue = () => {
   const timerInput = document.getElementById('timer-value')
   const value = timerInput.value.trim()

   if (isValidDecimal(value)) {
      settings.updateTimerValue(value)
   } else if (value === '') {
      timerInput.value = settings.timer.value
   } else {
      // Invalid input - reset to default
      timerInput.value = 3
      settings.updateTimerValue(3)
   }

   validateInput({ target: timerInput })
}

const updateLength = (event) => {
   const input = event.target
   // Remove all non-digit characters
   const digitsOnly = input.value.replace(/[^0-9]/g, '')

   // Update the input value with digits only
   input.value = digitsOnly

   // Update settings if the value is valid
   if (digitsOnly === '' || /^[0-9]+$/.test(digitsOnly)) {
      settings.updateLength(digitsOnly)
   }
}

const validateInput = (event) => {
   const input = event.target
   const value = input.value.trim()
   const isTimerInput = input.id === 'timer-value'

   // Check if valid number (big integer or decimal for timer)
   if (value === '' || (isTimerInput ? isValidDecimal(value) : /^[0-9]+$/.test(value))) {
      input.style.borderColor = '#ddd'
   } else {
      input.style.borderColor = '#e74c3c'
   }
}
</script>

<template>
   <div class="setting-container">
      <h1>Settings</h1>
      <div class="settings-content">
         <div class="setting-item">
            <label for="operations">Operations:</label>
            <div class="checkbox-group">
               <label>
                  <input
                     type="checkbox"
                     :checked="settings.operations.addition"
                     @change="updateOperations"
                  > Addition
               </label>
               <label>
                  <input
                     type="checkbox"
                     :checked="settings.operations.subtraction"
                     @change="updateOperations"
                  > Subtraction
               </label>
            </div>
         </div>

         <div class="setting-item">
            <label for="allow-negative">Allow Negative Results:</label>
            <input
               id="allow-negative"
               type="checkbox"
               v-model="settings.operations.allowNegative"
            >
         </div>

         <div class="setting-item">
            <label for="minimum">Minimum:</label>
            <input
               id="minimum"
               type="text"
               :value="settings.minimum"
               @input="updateRangeInput"
               @blur="updateRangeFinal"
               placeholder="Enter minimum value"
            >
            <label for="maximum">Maximum:</label>
            <input
               id="maximum"
               type="text"
               :value="settings.maximum"
               @input="updateRangeInput"
               @blur="updateRangeFinal"
               placeholder="Enter maximum value"
            >
         </div>

         <div class="setting-item">
            <label for="length">Number of operands:</label>
            <input
               id="length"
               type="text"
               :value="settings.length"
               @blur="validateInput"
               @input="updateLength"
            >
         </div>

         <div class="setting-item">
            <label for="timer">Timer type:</label>
            <div class="radio-group">
               <label>
                  <input
                     type="radio"
                     name="timer-type"
                     value="whole"
                     v-model="settings.timer.type"
                     @change="settings.updateTimerType('whole')"
                  > Whole expression
               </label>
               <label>
                  <input
                     type="radio"
                     name="timer-type"
                     value="individual"
                     v-model="settings.timer.type"
                     @change="settings.updateTimerType('individual')"
                  > Per operand
               </label>
            </div>
         </div>

         <div class="setting-item">
            <label for="timer-value">Timer value (seconds):</label>
            <input
               id="timer-value"
               type="text"
               :value="settings.timer.value"
               @blur="updateTimerValue"
               @input="validateInput"
               placeholder="Enter timer value"
            >
         </div>
      </div>

      <button @click="navigateToPractice" class="start-button">
         Start Practice
      </button>
   </div>
</template>

<style scoped>
.setting-container {
   max-width: 600px;
   margin: 0 auto;
   padding: 2em;
   text-align: center;
}

h1 {
   color: #2c3e50;
   margin-bottom: 2em;
}

.settings-content {
   text-align: left;
   margin-bottom: 2em;
}

.setting-item {
   margin-bottom: 1.5em;
   display: flex;
   gap: 0.5em;
   align-items: center;
}

label {
   display: block;
   font-weight: bold;
   color: #34495e;
}

select, input {
   width: 100%;
   padding: 0.5em;
   border: 1px solid #ddd;
   border-radius: 4px;
}

.checkbox-group {
   display: flex;
   gap: 1em;
}

.checkbox-group label {
   display: flex;
   align-items: center;
   gap: 0.5em;
   font-weight: normal;
}

.radio-group {
   display: flex;
   align-items: center;
   gap: 1em;
}

.radio-group label {
   display: flex;
   align-items: center;
   gap: 0.5em;
   font-weight: normal;
}

.start-button {
   background-color: #42b983;
   color: white;
   border: none;
   padding: 1em 2em;
   font-size: 1.1em;
   border-radius: 6px;
   cursor: pointer;
   transition: background-color 0.3s;
}

.start-button:hover {
   background-color: #369870;
}
</style>
