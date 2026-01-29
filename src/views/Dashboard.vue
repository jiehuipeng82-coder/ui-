<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import { ElRow, ElCol, ElCard, ElTable, ElTableColumn, ElTag, ElEmpty, ElProgress } from 'element-plus'
import { TrendCharts, DataAnalysis } from '@element-plus/icons-vue'

const generationStore = useGenerationStore()

// 统计数据 - 使用 store 中的数据
const stats = computed(() => ({
  total: generationStore.stats.totalGenerated,
  completed: generationStore.stats.totalCompleted,
  failed: generationStore.stats.totalFailed,
  processing: 0,
  cost: generationStore.stats.totalCost,
  completionRate: generationStore.completionRate,
  failureRate: generationStore.failureRate
}))

// 模拟的最近任务列表
const recentTasks = ref([
  {
    id: 'TASK-001',
    prompt: '一只可爱的猫咪在花园里玩耍',
    status: 'completed',
    createdAt: '2026-01-28 10:30:45',
    duration: '2.5s'
  },
  {
    id: 'TASK-002',
    prompt: '蓝天白云下的山川风景',
    status: 'completed',
    createdAt: '2026-01-28 10:25:30',
    duration: '3.1s'
  },
  {
    id: 'TASK-003',
    prompt: '未来科技城市全景图',
    status: 'processing',
    createdAt: '2026-01-28 10:20:15',
    duration: '-'
  },
  {
    id: 'TASK-004',
    prompt: '温暖的家庭晚餐场景',
    status: 'failed',
    createdAt: '2026-01-28 10:15:00',
    duration: '1.2s'
  },
  {
    id: 'TASK-005',
    prompt: '星空下的露营帐篷',
    status: 'completed',
    createdAt: '2026-01-28 10:10:45',
    duration: '2.8s'
  }
])

// 趋势数据
const chartData = {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  completedData: [45, 52, 38, 65, 73, 82, 90],
  failedData: [5, 8, 12, 8, 10, 6, 8]
}

// 计算最大值用于图表
const maxValue = Math.max(...chartData.completedData, ...chartData.failedData) || 100
</script>

<template>
  <div class="dashboard-page">
    <!-- 顶部数据卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card completed">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-label">累计任务</div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-subtitle">个任务</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card success">
          <div class="stat-icon">✓</div>
          <div class="stat-content">
            <div class="stat-label">成功数</div>
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-subtitle">{{ stats.completionRate }}% 完成率</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card processing">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <div class="stat-label">处理中</div>
            <div class="stat-value">{{ stats.failed }}</div>
            <div class="stat-subtitle">{{ stats.failureRate }}% 失败率</div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card cost">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-label">总花费</div>
            <div class="stat-value">¥{{ stats.cost.toFixed(2) }}</div>
            <div class="stat-subtitle">总计消耗</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>近7天任务趋势</span>
            </div>
          </template>

          <div class="chart-container">
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-color completed"></span>
                <span>成功任务</span>
              </div>
              <div class="legend-item">
                <span class="legend-color failed"></span>
                <span>失败任务</span>
              </div>
            </div>

            <svg viewBox="0 0 800 300" class="chart-svg">
              <!-- 背景网格 -->
              <defs>
                <pattern id="grid" width="100" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" stroke-width="1" />
                </pattern>
              </defs>
              <rect width="800" height="300" fill="url(#grid)" />

              <!-- 坐标轴 -->
              <line x1="60" y1="20" x2="60" y2="260" stroke="#94a3b8" stroke-width="2" />
              <line x1="60" y1="260" x2="780" y2="260" stroke="#94a3b8" stroke-width="2" />

              <!-- 成功任务线 (绿色) -->
              <polyline
                :points="`
                  80,${260 - ((chartData.completedData[0] || 0) / maxValue) * 220}
                  180,${260 - ((chartData.completedData[1] || 0) / maxValue) * 220}
                  280,${260 - ((chartData.completedData[2] || 0) / maxValue) * 220}
                  380,${260 - ((chartData.completedData[3] || 0) / maxValue) * 220}
                  480,${260 - ((chartData.completedData[4] || 0) / maxValue) * 220}
                  580,${260 - ((chartData.completedData[5] || 0) / maxValue) * 220}
                  680,${260 - ((chartData.completedData[6] || 0) / maxValue) * 220}
                `"
                fill="none"
                stroke="#10b981"
                stroke-width="3"
              />

              <!-- 失败任务线 (红色) -->
              <polyline
                :points="`
                  80,${260 - ((chartData.failedData[0] || 0) / maxValue) * 220}
                  180,${260 - ((chartData.failedData[1] || 0) / maxValue) * 220}
                  280,${260 - ((chartData.failedData[2] || 0) / maxValue) * 220}
                  380,${260 - ((chartData.failedData[3] || 0) / maxValue) * 220}
                  480,${260 - ((chartData.failedData[4] || 0) / maxValue) * 220}
                  580,${260 - ((chartData.failedData[5] || 0) / maxValue) * 220}
                  680,${260 - ((chartData.failedData[6] || 0) / maxValue) * 220}
                `"
                fill="none"
                stroke="#ef4444"
                stroke-width="3"
              />

              <!-- 数据点 - 成功 -->
              <circle
                v-for="(value, index) in chartData.completedData"
                :key="`completed-${index}`"
                :cx="80 + index * 100"
                :cy="260 - (value / maxValue) * 220"
                r="4"
                fill="#10b981"
              />

              <!-- 数据点 - 失败 -->
              <circle
                v-for="(value, index) in chartData.failedData"
                :key="`failed-${index}`"
                :cx="80 + index * 100"
                :cy="260 - (value / maxValue) * 220"
                r="4"
                fill="#ef4444"
              />

              <!-- X轴标签 -->
              <text
                v-for="(label, index) in chartData.labels"
                :key="`label-${index}`"
                :x="80 + index * 100"
                y="290"
                text-anchor="middle"
                font-size="12"
                fill="#6b7280"
              >
                {{ label }}
              </text>
            </svg>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近任务列表 -->
    <el-row :gutter="20" class="table-row">
      <el-col :xs="24">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>最近任务列表</span>
            </div>
          </template>

          <el-table :data="recentTasks" stripe style="width: 100%">
            <el-table-column prop="id" label="任务ID" width="120" />
            <el-table-column prop="prompt" label="任务描述" min-width="300">
              <template #default="{ row }">
                <span class="prompt-text">{{ row.prompt }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 'completed' ? 'success' : row.status === 'processing' ? 'warning' : 'danger'"
                  effect="plain"
                >
                  {{
                    row.status === 'completed'
                      ? '✓ 完成'
                      : row.status === 'processing'
                        ? '⏳ 处理中'
                        : '✕ 失败'
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column prop="duration" label="耗时" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 0;
}

/* 数据卡片 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px !important;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-card.completed {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-color: #667eea;
}

.stat-card.success {
  background: linear-gradient(135deg, #10b98115 0%, #059669 15 100%);
  border-color: #10b981;
}

.stat-card.processing {
  background: linear-gradient(135deg, #f59e0b15 0%, #d97706 15 100%);
  border-color: #f59e0b;
}

.stat-card.cost {
  background: linear-gradient(135deg, #ef444415 0%, #dc262615 100%);
  border-color: #ef4444;
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.stat-subtitle {
  font-size: 12px;
  color: #94a3b8;
}

/* 图表区域 */
.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #1e293b;
}

.chart-container {
  position: relative;
  padding: 24px 0;
}

.chart-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 0 60px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.completed {
  background: #10b981;
}

.legend-color.failed {
  background: #ef4444;
}

.chart-svg {
  width: 100%;
  height: 320px;
  display: block;
}

/* 表格区域 */
.table-row {
  margin-bottom: 24px;
}

.table-card {
  border-radius: 8px;
}

.prompt-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  color: #374151;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-card {
    gap: 12px;
    padding: 16px !important;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-legend {
    padding: 0 20px;
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table th) {
    padding: 8px !important;
  }

  :deep(.el-table td) {
    padding: 8px !important;
  }
}

/* Element Plus 自定义 */
:deep(.el-card) {
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
}

:deep(.el-table__header) {
  background-color: #f8fafc;
}

:deep(.el-table tr) {
  transition: all 0.3s ease;
}

:deep(.el-table tr:hover > td) {
  background-color: #f1f5f9 !important;
}

:deep(.el-tag) {
  border-radius: 6px;
}
</style>
