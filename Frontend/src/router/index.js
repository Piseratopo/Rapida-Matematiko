import { createRouter, createWebHistory } from 'vue-router'
import Setting from '../Components/SettingPage.vue'
import PracticePage from '../Components/PracticePage.vue'

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
      }
   ]
})

export default router
