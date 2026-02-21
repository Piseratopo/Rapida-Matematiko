import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
   // Load settings from localStorage or use defaults
   const loadSettings = () => {
      const saved = localStorage.getItem('mathAppSettings')
      if (saved) {
         try {
            return JSON.parse(saved)
         } catch (e) {
            console.error('Failed to parse saved settings:', e)
            return null
         }
      }
      return null
   }

   const savedSettings = loadSettings()

   // State
   const operations = ref(savedSettings?.operations || {
      addition: true,
      subtraction: false,
      allowNegative: false
   })


   const minimum = ref(savedSettings?.minimum || '0')
   const maximum = ref(savedSettings?.maximum || '100')
   const length = ref(savedSettings?.length || 5)

   const timer = ref(savedSettings?.timer || {
      type: 'whole',
      value: 3
   })

   // Save settings to localStorage
   const saveSettings = () => {
      const settings = {
         operations: operations.value,
         minimum: minimum.value,
         maximum: maximum.value,
         length: length.value,
         timer: timer.value
      }
      localStorage.setItem('mathAppSettings', JSON.stringify(settings))
   }

   // Actions
   const updateOperations = (newOperations) => {
      operations.value = { ...operations.value, ...newOperations }
      saveSettings()
   }

   const updateRange = (min, max) => {
      minimum.value = min
      maximum.value = max
      saveSettings()
   }

   const updateLength = (newLength) => {
      length.value = newLength
      saveSettings()
   }

   const updateTimerType = (type) => {
      timer.value.type = type
      saveSettings()
   }

   const updateTimerValue = (value) => {
      timer.value.value = value
      saveSettings()
   }

   return {
      // State
      operations,
      minimum,
      maximum,
      length,
      timer,
      // Actions
      updateOperations,
      updateRange,
      updateLength,
      updateTimerType,
      updateTimerValue
   }
})
