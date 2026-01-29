<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElContainer, ElAside, ElHeader, ElMain, ElMenu, ElMenuItem, ElBreadcrumb, ElBreadcrumbItem } from 'element-plus'
import { DataAnalysis, VideoPlay, Picture } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 侧边栏菜单项
const menuItems = [
  {
    index: '/dashboard',
    title: '仪表盘',
    icon: DataAnalysis,
    label: 'Dashboard'
  },
  {
    index: '/video-task',
    title: '视频生成',
    icon: VideoPlay,
    label: 'Video Generator'
  },
  {
    index: '/image-task',
    title: '图片生成',
    icon: Picture,
    label: 'Image Generator'
  }
]

// 当前选中的菜单
const activeMenu = computed(() => route.path)

// 面包屑数据
const breadcrumbs = computed(() => {
  const currentItem = menuItems.find(item => item.index === route.path)
  return [
    { label: '首页', path: '/dashboard' },
    { label: currentItem?.title || '页面', path: route.path }
  ]
})

// 菜单点击处理
const handleMenuSelect = (index: string) => {
  router.push(index)
}
</script>

<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside class="sidebar">
      <!-- Logo 区域 -->
      <div class="logo-area">
        <div class="logo-icon">📊</div>
        <div class="logo-text">AI Tools</div>
      </div>

      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.index"
          :index="item.index"
          class="menu-item"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>

      <!-- 底部用户信息 -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">👤</div>
          <div class="user-text">
            <div class="user-name">Admin</div>
            <div class="user-role">管理员</div>
          </div>
        </div>
      </div>
    </el-aside>

    <!-- 主容器 -->
    <el-container class="main-container">
      <!-- 顶部 Header -->
      <el-header class="main-header">
        <div class="header-left">
          <!-- 面包屑导航 -->
          <el-breadcrumb separator-icon="ArrowRight" class="breadcrumb">
            <el-breadcrumb-item
              v-for="item in breadcrumbs"
              :key="item.path"
              :to="item.path"
            >
              {{ item.label }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 可以添加其他 header 内容，如用户菜单、通知等 -->
          <div class="header-time">
            {{ new Date().toLocaleTimeString('zh-CN') }}
          </div>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  background: #f5f7fa;
}

/* 侧边栏样式 */
.sidebar {
  width: 220px;
  background: #304156;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #293040;
  overflow: hidden;
}

/* Logo 区域 */
.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 64px;
  background: linear-gradient(135deg, #304156 0%, #265576 100%);
  border-bottom: 1px solid #293040;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-area:hover {
  background: linear-gradient(135deg, #3a4d63 0%, #2a6588 100%);
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
}

/* 菜单样式 */
.sidebar-menu {
  flex: 1;
  border: none;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.menu-item {
  height: 48px !important;
  line-height: 48px !important;
  padding: 0 20px !important;
  border-left: 3px solid transparent;
  margin: 4px 8px;
  border-radius: 0 8px 8px 0;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
  border-left-color: #667eea !important;
}

/* 底部用户信息 */
.sidebar-footer {
  height: 80px;
  border-top: 1px solid #293040;
  padding: 12px 16px;
  background: #2d3e50;
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(64, 158, 255, 0.1);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.user-text {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-size: 12px;
  color: #bfcbd9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 主容器样式 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* Header 样式 */
.main-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: none;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px !important;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.breadcrumb {
  font-size: 14px;
}

.header-time {
  font-size: 14px;
  color: #909399;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f4f7fc;
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.content-wrapper {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  min-height: 100%;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }

  .logo-text {
    display: none;
  }

  .menu-item span {
    display: none;
  }

  .sidebar-footer {
    height: 64px;
    padding: 8px 12px;
  }

  .user-text {
    display: none;
  }

  .main-header {
    padding: 0 16px;
  }

  .main-content {
    padding: 16px;
  }

  .content-wrapper {
    padding: 16px;
  }

  .header-time {
    display: none;
  }
}

/* 深色主题调整 */
:deep(.el-menu) {
  background-color: #304156 !important;
}

:deep(.el-menu-item) {
  background-color: transparent !important;
}

:deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%) !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%) !important;
  border-left: 3px solid #667eea !important;
  color: #667eea !important;
}

:deep(.el-breadcrumb__item) {
  color: #606266;
}

:deep(.el-breadcrumb__inner) {
  color: #606266;
  transition: all 0.3s ease;
}

:deep(.el-breadcrumb__inner:hover) {
  color: #409eff;
}

:deep(.el-breadcrumb__separator) {
  color: #c0c4cc;
}
</style>
