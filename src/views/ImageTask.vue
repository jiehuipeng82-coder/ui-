<script setup lang="ts">
import { ref } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import { generateId } from '@/utils'
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

// 对话框状态
const dialogVisible = ref(false)

// 表单数据
const formData = ref({
  prompt: '',
  model: 'gemini-2.5-flash-image-landscape',
  ratio: '16:9',
  quantity: 1
})

const isGenerating = ref(false)

// 图片模型列表（支持的 Gemini 模型）
const imageModels = [
  { label: 'Gemini 2.5 Flash (Landscape)', value: 'gemini-2.5-flash-image-landscape' },
  { label: 'Gemini 2.5 Flash (Portrait)', value: 'gemini-2.5-flash-image-portrait' },
  { label: 'Gemini 3.0 Pro (Landscape)', value: 'gemini-3.0-pro-image-landscape' },
  { label: 'Gemini 3.0 Pro (Portrait)', value: 'gemini-3.0-pro-image-portrait' },
  { label: 'Gemini 3.0 Pro (Square)', value: 'gemini-3.0-pro-image-square' }
]

// 比例选项
const ratioOptions = [
  { label: '1:1 (方图)', value: '1:1' },
  { label: '16:9 (横图)', value: '16:9' },
  { label: '9:16 (竖图)', value: '9:16' },
  { label: '4:3 (标准)', value: '4:3' },
  { label: '3:4 (竖屏标准)', value: '3:4' }
]

// 生成数量选项
const quantityOptions = [
  { label: '1张', value: 1 },
  { label: '2张', value: 2 },
  { label: '3张', value: 3 },
  { label: '4张', value: 4 }
]

// Mock 任务列表数据
const tableData = ref<any[]>([
  {
    id: 'IMG-2026-001',
    thumbnail: 'https://via.placeholder.com/120x80?text=Image1',
    prompt: '一只可爱的猫咪，毛茸茸，坐在窗边，阳光洒落',
    model: 'gemini-2.5-flash-image-landscape',
    status: 'completed',
    createdAt: '2026-01-28 10:30:45',
    quantity: 2,
    ratio: '16:9'
  },
  {
    id: 'IMG-2026-002',
    thumbnail: 'https://via.placeholder.com/120x80?text=Image2',
    prompt: '水彩风格的森林风景，有小溪和蘑菇',
    model: 'flux-pro',
    status: 'processing',
    createdAt: '2026-01-28 11:15:22',
    quantity: 3,
    ratio: '1:1'
  },
  {
    id: 'IMG-2026-003',
    thumbnail: 'https://via.placeholder.com/120x80?text=Image3',
    prompt: '赛博朋克城市街景，霓虹灯，未来感',
    model: 'midjourney-v6',
    status: 'failed',
    createdAt: '2026-01-28 09:45:33',
    quantity: 4,
    ratio: '2.35:1'
  },
  {
    id: 'IMG-2026-004',
    thumbnail: 'https://via.placeholder.com/120x80?text=Image4',
    prompt: '油画风格的海边日落，金色光芒，宁静祥和',
    model: 'stable-diffusion-3',
    status: 'completed',
    createdAt: '2026-01-28 08:20:11',
    quantity: 1,
    ratio: '9:16'
  },
  {
    id: 'IMG-2026-005',
    thumbnail: 'https://via.placeholder.com/120x80?text=Image5',
    prompt: '精美的中国风古镇，灯笼，石板路，人物',
    model: 'dalle-3',
    status: 'processing',
    createdAt: '2026-01-27 14:33:44',
    quantity: 2,
    ratio: '16:9'
  },
  {
    id: 'IMG-2026-006',
    thumbnail: 'https://via.placeholder.com/120x80?text=Image6',
    prompt: '纸质艺术风格，白色和金色，极简主义设计',
    model: 'gemini-3.0-pro-image-portrait',
    status: 'completed',
    createdAt: '2026-01-27 13:05:20',
    quantity: 3,
    ratio: '1:1'
  }
])

// 获取模型标签
function getModelLabel(value: string): string {
  const model = imageModels.find(m => m.value === value)
  return model ? model.label : value
}

// 获取状态类型（用于 Tag 组件）
function getStatusType(status: string): 'success' | 'info' | 'danger' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'processing':
      return 'info'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
function getStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'processing':
      return '处理中'
    case 'failed':
      return '已失败'
    default:
      return '未知'
  }
}

// 获取提示词预览（截断到20个字符）
function getPromptPreview(prompt: string): string {
  return prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt
}

// 打开对话框
function openDialog() {
  dialogVisible.value = true
  formData.value = {
    prompt: '',
    model: 'gemini-2.5-flash-image-landscape',
    ratio: '16:9',
    quantity: 1
  }
}

// 关闭对话框
function closeDialog() {
  dialogVisible.value = false
}

// 提交表单
async function handleSubmit() {
  if (!formData.value.prompt.trim()) {
    ElMessage.warning('请输入提示词')
    return
  }

  isGenerating.value = true

  try {
    // 创建新任务
    const newTask = {
      id: `IMG-${new Date().getFullYear()}-${String(tableData.value.length + 1).padStart(3, '0')}`,
      thumbnail: 'https://via.placeholder.com/120x80?text=Generating',
      prompt: formData.value.prompt,
      model: formData.value.model,
      status: 'processing',
      createdAt: new Date().toLocaleString('zh-CN'),
      quantity: formData.value.quantity,
      ratio: formData.value.ratio
    }

    // 添加到表格顶部
    tableData.value.unshift(newTask)

    // 更新 Store
    generationStore.addGeneratedImage({
      id: newTask.id,
      url: newTask.thumbnail,
      prompt: formData.value.prompt,
      timestamp: Date.now(),
      status: 'pending'
    })

    ElMessage.success(`图片任务已创建，处理中...（将生成 ${formData.value.quantity} 张图）`)

    // 关闭对话框
    closeDialog()

    // 模拟 2 秒后完成
    setTimeout(() => {
      const taskIndex = tableData.value.findIndex(t => t.id === newTask.id)
      if (taskIndex > -1) {
        tableData.value[taskIndex].status = 'completed'
      }
    }, 2000)
  } finally {
    isGenerating.value = false
  }
}

// 删除任务
function handleDelete(id: string) {
  const index = tableData.value.findIndex(t => t.id === id)
  if (index !== -1) {
    tableData.value.splice(index, 1)
    ElMessage.success('任务已删除')
  }
}

// 查看详情
function handleView(row: any) {
  ElMessage.info(`任务详情: ${row.id}\n提示词: ${row.prompt}\n模型: ${getModelLabel(row.model)}\n生成数量: ${row.quantity}张`)
}

// 下载任务
function handleDownload(row: any) {
  if (row.status === 'completed') {
    ElMessage.success(`开始下载: ${row.id}（${row.quantity} 张图片）`)
  } else {
    ElMessage.warning('该任务未完成，无法下载')
  }
}
</script>

<template>
  <div class="image-task-page">
    <!-- 内容卡片容器 -->
    <div class="content-card">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">图片任务列表</h1>
        <el-button type="primary" size="large" @click="openDialog" class="create-btn">
          + 新建任务
        </el-button>
      </div>

      <!-- 任务表格 -->
      <el-table :data="tableData" class="task-table">
        <el-table-column prop="id" label="任务 ID" width="140">
          <template #default="{ row }">
            <span class="task-id">{{ row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="缩略图" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.thumbnail"
              :preview-src-list="[row.thumbnail]"
              class="thumbnail-img"
              loading="lazy"
            />
          </template>
        </el-table-column>

        <el-table-column label="提示词" min-width="200">
          <template #default="{ row }">
            <span class="prompt-text" :title="row.prompt">
              {{ getPromptPreview(row.prompt) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="模型" width="200">
          <template #default="{ row }">
            <el-tag class="model-tag">{{ getModelLabel(row.model) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" round effect="light" class="status-tag">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="数量" width="80">
          <template #default="{ row }">
            {{ row.quantity }} 张
          </template>
        </el-table-column>

        <el-table-column label="比例" width="80">
          <template #default="{ row }">
            <el-tag type="info" effect="light">{{ row.ratio }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ row.createdAt }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
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
      title="创建图片任务"
      width="500px"
      @close="closeDialog"
      class="custom-dialog"
    >
      <el-form label-width="100px" size="default" class="task-form">
        <!-- 提示词 -->
        <el-form-item label="提示词" required>
          <el-input
            v-model="formData.prompt"
            type="textarea"
            :rows="5"
            placeholder="请输入您想要生成的图片描述，例如：一只蓝眼睛的白色猫咪，坐在阳光下"
            class="form-textarea"
          />
        </el-form-item>

        <!-- 模型选择 -->
        <el-form-item label="模型选择" required>
          <el-select 
            v-model="formData.model" 
            placeholder="选择图片生成模型"
            class="form-select"
          >
            <el-option
              v-for="model in imageModels"
              :key="model.value"
              :label="model.label"
              :value="model.value"
            />
          </el-select>
        </el-form-item>

        <!-- 图片比例 -->
        <el-form-item label="图片比例" required>
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

        <!-- 生成数量 -->
        <el-form-item label="生成数量" required>
          <el-radio-group v-model="formData.quantity" class="quantity-group">
            <el-radio-button
              v-for="qty in quantityOptions"
              :key="qty.value"
              :label="qty.value"
              class="quantity-button"
            >
              {{ qty.label }}
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
.image-task-page {
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
  min-width: 100px;
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  background-color: #f8f9fa;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 8px;
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

/* 数量选择按钮组 */
.quantity-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.quantity-button .el-radio-button__inner) {
  min-width: 70px;
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
  padding: 0 8px;
}

:deep(.quantity-button .el-radio-button__inner:hover) {
  border-color: #0066cc;
  color: #0066cc;
  background-color: #eff6ff;
}

:deep(.quantity-button.is-active .el-radio-button__inner) {
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
  .image-task-page {
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
