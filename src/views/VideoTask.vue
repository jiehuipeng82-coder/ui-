<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useGenerationStore } from '@/stores/generation'
import { generateId, formatDate } from '@/utils'
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadio,
  ElTable,
  ElTableColumn,
  ElTag,
  ElMessage,
  ElImage,
  ElPopconfirm,
  ElIcon
} from 'element-plus'
import { Delete, Download, View } from '@element-plus/icons-vue'

const generationStore = useGenerationStore()

// ==================== 配置部分 ====================
// 读取环境变量中的 API 基础地址，如果读取不到，默认设为 localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'

// 对话框状态
const dialogVisible = ref(false)

// 表单数据
const formData = ref({
  prompt: '',
  model: 'gemini-2.5-flash-video',
  ratio: '16:9',
  duration: '5s'
})

const isGenerating = ref(false)

// 视频模型列表（仅包含 Gemini 视频模型）
const videoModels = [
  { label: 'Gemini 2.5 Flash Video', value: 'gemini-2.5-flash-video' },
  { label: 'Gemini 3.0 Pro Video', value: 'gemini-3.0-pro-video' }
]

// 比例选项
const ratioOptions = [
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' }
]

// 时长选项
const durationOptions = [
  { label: '5秒', value: '5s' },
  { label: '10秒', value: '10s' }
]

// Mock 任务列表数据
const tableData = ref([
  {
    id: 'TASK-2026-001',
    thumbnail: 'https://via.placeholder.com/120x80?text=Video1',
    prompt: '一只金色的拉布拉多犬在阳光下奔跑，背景是绿色的草坪和树木',
    model: 'kling',
    status: 'completed',
    createdAt: '2026-01-28 10:30:45',
    duration: '5s',
    ratio: '16:9'
  },
  {
    id: 'TASK-2026-002',
    thumbnail: 'https://via.placeholder.com/120x80?text=Video2',
    prompt: '未来科技城市街景，霓虹灯闪烁，飞行汽车在空中穿梭',
    model: 'sora',
    status: 'processing',
    createdAt: '2026-01-28 10:25:30',
    duration: '10s',
    ratio: '16:9'
  },
  {
    id: 'TASK-2026-003',
    thumbnail: 'https://via.placeholder.com/120x80?text=Video3',
    prompt: '樱花树下翩翩起舞的少女，穿着粉色和服',
    model: 'runway',
    status: 'completed',
    createdAt: '2026-01-28 10:20:15',
    duration: '5s',
    ratio: '9:16'
  },
  {
    id: 'TASK-2026-004',
    thumbnail: 'https://via.placeholder.com/120x80?text=Video4',
    prompt: '深海中的多彩珊瑚礁和游动的热带鱼群',
    model: 'pika',
    status: 'failed',
    createdAt: '2026-01-28 10:15:00',
    duration: '10s',
    ratio: '16:9'
  },
  {
    id: 'TASK-2026-005',
    thumbnail: 'https://via.placeholder.com/120x80?text=Video5',
    prompt: '宇航员在月球表面行走，地球在背景中升起',
    model: 'kling',
    status: 'completed',
    createdAt: '2026-01-28 10:10:45',
    duration: '5s',
    ratio: '16:9'
  },
  {
    id: 'TASK-2026-006',
    thumbnail: 'https://via.placeholder.com/120x80?text=Video6',
    prompt: '咖啡店里的舒适场景，温暖的灯光和繁忙的顾客',
    model: 'synthesia',
    status: 'completed',
    createdAt: '2026-01-28 10:05:30',
    duration: '5s',
    ratio: '1:1'
  }
])

// 获取提示词预览（前 20 个字符）
const getPromptPreview = (prompt: string) => {
  return prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt
}

// 获取状态标签类型
const getStatusType = (status: string): 'success' | 'info' | 'danger' => {
  const typeMap: Record<string, 'success' | 'info' | 'danger'> = {
    completed: 'success',
    processing: 'info',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态显示文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    completed: '成功',
    processing: '处理中',
    failed: '失败'
  }
  return textMap[status] || '未知'
}

// 打开新建任务对话框
const openDialog = () => {
  formData.value = {
    prompt: '',
    model: 'gemini-2.5-flash-video',
    ratio: '16:9',
    duration: '5s'
  }
  dialogVisible.value = true
}

// 关闭对话框
const closeDialog = () => {
  dialogVisible.value = false
}

// ==================== 核心功能：提交表单并发送网络请求 ====================
/**
 * 提交表单 - 创建新视频任务
 * 
 * 流程：
 * 1. 验证表单数据（prompt 不能为空）
 * 2. 设置 loading 状态
 * 3. 构造请求体，包含 prompt, model, ratio, duration
 * 4. 发送 POST 请求到后端接口：/api/run
 * 5. 根据返回结果更新任务列表
 * 6. 显示成功或失败提示
 */
const handleSubmit = async () => {
  // 验证表单数据
  if (!formData.value.prompt.trim()) {
    ElMessage.warning('请输入视频描述（提示词）')
    return
  }

  // 设置 loading 状态
  isGenerating.value = true

  try {
    // ==================== 构造请求体 ====================
    const payload = {
      // 用户输入的提示词
      prompt: formData.value.prompt.trim(),
      // 选择的视频模型
      model: formData.value.model,
      // 视频比例
      ratio: formData.value.ratio,
      // 视频时长
      duration: formData.value.duration
    }

    // ==================== 发送 POST 请求 ====================
    // 📌 重要：请确认后端接口路径是否正确
    // 如果后端路径不是 /api/run，请修改下面的字符串
    const endpoint = '/api/run'
    const requestUrl = `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`
    
    console.log(`[VideoTask] 发送请求到：${requestUrl}`, payload)

    const response = await axios.post(requestUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // ==================== 处理响应数据 ====================
    const taskId = generateId()
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    // 将新任务添加到表格顶部
    tableData.value.unshift({
      id: `TASK-${taskId}`,
      thumbnail: response.data?.thumbnail || 'https://via.placeholder.com/120x80?text=Processing',
      prompt: formData.value.prompt,
      model: formData.value.model,
      status: response.data?.status || 'processing',
      createdAt: dateStr,
      duration: formData.value.duration,
      ratio: formData.value.ratio
    })

    // 更新 Pinia store
    generationStore.addGeneratedImage({
      id: taskId,
      url: response.data?.url || '',
      prompt: formData.value.prompt,
      timestamp: Date.now(),
      status: response.data?.status || 'pending'
    })

    // 显示成功提示
    ElMessage.success(`视频任务已创建！任务 ID: ${taskId}`)
    
    // 关闭对话框
    closeDialog()

  } catch (error: any) {
    // ==================== 错误处理 ====================
    console.error('[VideoTask] 请求失败：', error)

    // 构造友好的错误提示
    let errorMessage = '创建任务失败'
    
    if (error.response?.status === 400) {
      errorMessage = '请求参数不正确：' + (error.response?.data?.message || error.response?.data?.error || '未知错误')
    } else if (error.response?.status === 401) {
      errorMessage = 'API 鉴权失败，请检查 .env 文件中的 VITE_API_KEY'
    } else if (error.response?.status === 500) {
      errorMessage = '后端服务器错误，请稍后重试'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = `无法连接到后端服务器：${API_BASE_URL}，请检查 .env 配置`
    } else if (error.message === 'Network Error') {
      errorMessage = '网络连接失败，请检查网络设置'
    }

    ElMessage.error(errorMessage)
  } finally {
    // ==================== 清除 loading 状态 ====================
    isGenerating.value = false
  }
}

// 删除任务
const handleDelete = (id: string) => {
  const index = tableData.value.findIndex(t => t.id === id)
  if (index > -1) {
    tableData.value.splice(index, 1)
    ElMessage.success('任务已删除')
  }
}

// 查看详情
const handleView = (row: any) => {
  ElMessage.info(`查看任务详情: ${row.id}`)
}

// 下载
const handleDownload = (row: any) => {
  if (row.status !== 'completed') {
    ElMessage.warning('仅可下载已完成的任务')
    return
  }
  ElMessage.success(`开始下载: ${row.id}`)
}
</script>

<template>
  <div class="video-task-page">
    <!-- 内容卡片容器 -->
    <div class="content-card">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">视频任务列表</h1>
        <el-button type="primary" size="large" @click="openDialog" class="create-btn">
          + 新建任务
        </el-button>
      </div>

      <!-- 任务列表表格 -->
      <el-table :data="tableData" class="task-table">
        <!-- 任务 ID 列 -->
        <el-table-column prop="id" label="任务 ID" width="140" align="left">
          <template #default="{ row }">
            <span class="task-id">{{ row.id }}</span>
          </template>
        </el-table-column>

        <!-- 缩略图列 -->
        <el-table-column label="缩略图" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.thumbnail"
              :alt="row.id"
              class="thumbnail-img"
              fit="cover"
              :preview-src-list="[row.thumbnail]"
            />
          </template>
        </el-table-column>

        <!-- 提示词列 -->
        <el-table-column label="提示词" min-width="200" align="left">
          <template #default="{ row }">
            <span class="prompt-text" :title="row.prompt">
              {{ getPromptPreview(row.prompt) }}
            </span>
          </template>
        </el-table-column>

        <!-- 模型名称列 -->
        <el-table-column prop="model" label="模型" width="100" align="center">
          <template #default="{ row }">
            <el-tag class="model-tag">{{ row.model }}</el-tag>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" round effect="light" class="status-tag">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间列 -->
        <el-table-column prop="createdAt" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            <span class="time-text">{{ row.createdAt }}</span>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                type="primary"
                link
                size="small"
                :icon="View"
                @click="handleView(row)"
                class="icon-btn"
              />
              <el-button
                v-if="row.status === 'completed'"
                type="success"
                link
                size="small"
                :icon="Download"
                @click="handleDownload(row)"
                class="icon-btn"
              />
              <el-popconfirm
                title="确认删除?"
                description="此操作将永久删除该任务"
                confirm-button-text="确认"
                cancel-button-text="取消"
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button type="danger" link size="small" :icon="Delete" class="icon-btn" />
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建视频任务"
      width="500px"
      @close="closeDialog"
      class="custom-dialog"
    >
      <el-form
        label-width="100px"
        size="default"
        class="task-form"
      >
        <!-- 提示词 -->
        <el-form-item label="提示词" required>
          <el-input
            v-model="formData.prompt"
            type="textarea"
            :rows="5"
            placeholder="请输入您想要生成的视频描述"
            class="form-textarea"
          />
        </el-form-item>

        <!-- 模型选择 -->
        <el-form-item label="模型选择" required>
          <el-select 
            v-model="formData.model" 
            placeholder="选择视频模型"
            class="form-select"
          >
            <el-option
              v-for="model in videoModels"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
        </el-form-item>

        <!-- 比例 -->
        <el-form-item label="比例">
          <el-radio-group v-model="formData.ratio" class="ratio-group">
            <el-radio-button 
              v-for="ratio in ratioOptions" 
              :key="ratio.value" 
              :label="ratio.value"
              class="ratio-button"
            >
              {{ ratio.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 时长 -->
        <el-form-item label="时长">
          <el-radio-group v-model="formData.duration" class="duration-group">
            <el-radio-button 
              v-for="duration in durationOptions" 
              :key="duration.value" 
              :label="duration.value"
              class="duration-button"
            >
              {{ duration.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog" class="cancel-btn">取消</el-button>
          <el-button
            type="primary"
            :loading="isGenerating"
            @click="handleSubmit"
            class="generate-btn"
          >
            ✨ 立即生成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.video-task-page {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  min-height: 100vh;
}

/* 内容卡片容器 */
.content-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  gap: 20px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.5px;
}

.create-btn {
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 表格美化 */
.task-table {
  border-collapse: collapse;
}

:deep(.task-table .el-table__header) {
  background: #f9fafb;
}

:deep(.task-table .el-table__header th) {
  background: #f9fafb;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.task-table .el-table__body tr) {
  height: 64px;
}

:deep(.task-table .el-table__body td) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.task-table .el-table__body tr:hover > td) {
  background-color: #f9fafb !important;
}

/* 去除竖直分割线 */
:deep(.task-table .el-table__cell) {
  border-right: none;
}

.task-id {
  color: #0066cc;
  font-weight: 600;
  font-size: 14px;
}

.thumbnail-img {
  width: 100px !important;
  height: 64px !important;
  border-radius: 8px;
  background-color: #f3f4f6;
  overflow: hidden;
}

.prompt-text {
  color: #6b7280;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
  line-height: 1.5;
}

.model-tag {
  background-color: #eff6ff;
  color: #0284c7;
  border: none;
  border-radius: 6px;
}

.status-tag {
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
}

.time-text {
  color: #9ca3af;
  font-size: 13px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.icon-btn {
  font-size: 18px;
  padding: 0;
  min-width: auto;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background-color: rgba(0, 102, 204, 0.1);
}

.icon-btn.is-danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Dialog 对话框美化 */
:deep(.custom-dialog .el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.custom-dialog .el-dialog__header) {
  border-bottom: none;
  padding: 24px 24px 16px;
}

:deep(.custom-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

:deep(.custom-dialog .el-dialog__body) {
  padding: 20px 24px;
}

:deep(.custom-dialog .el-dialog__footer) {
  border-top: 1px solid #e5e7eb;
  padding: 16px 24px;
}

/* 表单美化 */
.task-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-textarea :deep(.el-textarea__inner) {
  background-color: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  min-height: 120px;
  transition: all 0.3s ease;
}

.form-textarea :deep(.el-textarea__inner:focus) {
  background-color: #ffffff;
  border-color: #0066cc;
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

.form-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: #f8f9fa;
  padding: 10px;
}

.form-select :deep(.el-select__placeholder) {
  color: #9ca3af;
}

.form-select {
  width: 100%;
}

.form-select :deep(.el-input__inner) {
  font-size: 14px;
  height: 40px;
  line-height: 40px;
}

/* 比例选择按钮组 */
.ratio-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.ratio-button .el-radio-button__inner) {
  min-width: 90px;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background-color: #f8f9fa;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 12px;
}

:deep(.ratio-button .el-radio-button__inner:hover) {
  border-color: #0066cc;
  color: #0066cc;
  background-color: #eff6ff;
}

:deep(.ratio-button.is-active .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 时长选择按钮组 */
.duration-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.duration-button .el-radio-button__inner) {
  min-width: 80px;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background-color: #f8f9fa;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 12px;
}

:deep(.duration-button .el-radio-button__inner:hover) {
  border-color: #0066cc;
  color: #0066cc;
  background-color: #eff6ff;
}

:deep(.duration-button.is-active .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 按钮美化 */
.cancel-btn {
  border-radius: 8px;
  color: #6b7280;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  color: #1f2937;
  border-color: #9ca3af;
}

.generate-btn {
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.generate-btn:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-card {
    padding: 16px;
  }

  :deep(.task-table .el-table__body tr) {
    height: 56px;
  }
}

@media (max-width: 768px) {
  .video-task-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .content-card {
    padding: 12px;
  }

  .operation-buttons {
    flex-direction: column;
  }
}
</style>
