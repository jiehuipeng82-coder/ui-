import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import VideoTask from '@/views/VideoTask.vue'
import ImageTask from '@/views/ImageTask.vue'
import HistoryView from '@/views/HistoryView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
          meta: { title: '仪表盘' }
        },
        {
          path: 'video-task',
          name: 'video-task',
          component: VideoTask,
          meta: { title: '视频生成' }
        },
        {
          path: 'image-task',
          name: 'image-task',
          component: ImageTask,
          meta: { title: '图片生成' }
        },
        {
          path: 'history',
          name: 'history',
          component: HistoryView,
          meta: { title: '历史记录' }
        },
        {
          path: 'generation',
          name: 'generation',
          component: HomeView,
          meta: { title: '图像生成' }
        }
      ]
    }
  ]
})

export default router
