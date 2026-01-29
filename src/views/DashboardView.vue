<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import { ElRow, ElCol, ElEmpty } from 'element-plus'

const generationStore = useGenerationStore()

// 动态统计数据
const displayStats = computed(() => generationStore.stats)
const hasData = computed(() => generationStore.stats.totalGenerated > 0)

// 监听统计数据变化，用于动画效果
const animatingValue = ref(0)
watch(
  () => displayStats.value.totalGenerated,
  (newVal) => {
    animatingValue.value = newVal
  }
)
</script>

<template>
  <div class="dashboard-container">
    <!-- 头部 -->
    <div class="dashboard-header">
      <div class="header-title">
        <h2 class="title">生成统计</h2>
        <p class="subtitle">实时监控您的任务进度</p>
      </div>
    </div>

    <!-- 如果没有数据，显示空状态 -->
    <div v-if="!hasData" class="empty-state">
      <el-empty
        description="暂无数据"
        :image-size="150"
      >
        <template #default>
          <p style="color: #94a3b8; font-size: 14px;">开始在左侧生成任务，数据将在此实时显示</p>
        </template>
      </el-empty>
    </div>

    <!-- 有数据时显示统计信息 -->
    <template v-else>
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-label">总任务数</div>
            <div class="stat-value blue">{{ displayStats.totalGenerated }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-label">已完成</div>
            <div class="stat-value green">✓ {{ displayStats.totalCompleted }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-label">已失败</div>
            <div class="stat-value red">✕ {{ displayStats.totalFailed }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-label">总消费</div>
            <div class="stat-value orange">¥{{ displayStats.totalCost.toFixed(2) }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 今日统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="8">
          <div class="stat-card">
            <div class="stat-label">今日任务</div>
            <div class="stat-value blue">{{ displayStats.todayGenerated }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="stat-card">
            <div class="stat-label">今日完成</div>
            <div class="stat-value green">✓ {{ displayStats.todayCompleted }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="stat-card">
            <div class="stat-label">今日消费</div>
            <div class="stat-value orange">¥{{ displayStats.todayCost.toFixed(2) }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 完成率信息 -->
      <div class="info-section">
        <div class="info-card">
          <div class="info-label">完成率</div>
          <div class="info-value">{{ generationStore.completionRate }}%</div>
        </div>
        <div class="info-card">
          <div class="info-label">失败率</div>
          <div class="info-value">{{ generationStore.failureRate }}%</div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 32px;
}

/* 头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-title {
  flex: 1;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #ffffff;
  border-radius: 8px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.stat-card:nth-child(1) {
  border-left-color: #3b82f6;
}

.stat-card:nth-child(2) {
  border-left-color: #10b981;
}

.stat-card:nth-child(3) {
  border-left-color: #ef4444;
}

.stat-card:nth-child(4) {
  border-left-color: #f59e0b;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.stat-value.blue {
  color: #3b82f6;
}

.stat-value.green {
  color: #10b981;
}

.stat-value.red {
  color: #ef4444;
}

.stat-value.orange {
  color: #f59e0b;
}

/* 信息卡片 */
.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 24px;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  text-align: center;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.info-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.info-value {
  font-size: 32px;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .dashboard-header {
    margin-bottom: 24px;
  }

  .title {
    font-size: 24px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
