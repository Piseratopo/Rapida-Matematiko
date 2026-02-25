import { createRouter, createWebHistory } from 'vue-router'
import Setting from '../Components/SettingPage.vue'
import PracticePage from '../Components/PracticePage.vue'
import SavedQuestions from '../Components/SavedQuestions.vue'

const router = createRouter({
   history: createWebHistory(),
   routes: [
      {
         path: '/',
         redirect: '/setting'
      },
      {
         path: '/setting',
         name: 'setting',
         component: Setting
      },
      {
         path: '/practice',
         name: 'practice',
         component: PracticePage
      },
      {
         path: '/saved',
         name: 'saved',
         component: SavedQuestions
      }
   ]
})

export default router
