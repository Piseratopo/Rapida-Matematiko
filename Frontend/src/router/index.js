import { createRouter, createWebHistory } from 'vue-router'
import Setting from '../Components/SettingPage.vue'
import AddAndSub from '../Components/AddAndSub.vue'

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
         path: '/add-and-sub',
         name: 'add-and-sub',
         component: AddAndSub
      }
   ]
})

export default router
