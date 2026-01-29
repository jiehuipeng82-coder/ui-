import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
  violation?: boolean
  violationReason?: string
}

export const useGenerationStore = defineStore('generation', () => {
  // State
  const currentPrompt = ref('')
  const concurrencyLimit = ref(5)
  const activeRequests = ref(0)
  const generatedImages = ref<GeneratedImage[]>([])

  // Statistics State
  const stats = ref({
    totalGenerated: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalCost: 0,
    todayGenerated: 0,
    todayCompleted: 0,
    todayFailed: 0,
    todayCost: 0
  })

  // Getters
  const completionRate = computed(() => {
    if (stats.value.totalGenerated === 0) return 0
    return Math.round((stats.value.totalCompleted / stats.value.totalGenerated) * 100)
  })

  const failureRate = computed(() => {
    if (stats.value.totalGenerated === 0) return 0
    return Math.round((stats.value.totalFailed / stats.value.totalGenerated) * 100)
  })

  // Actions
  function setPrompt(prompt: string) {
    currentPrompt.value = prompt
  }

  function setConcurrencyLimit(limit: number) {
    concurrencyLimit.value = Math.max(1, Math.min(10, limit))
  }

  function addGeneratedImage(image: GeneratedImage) {
    generatedImages.value.unshift(image)
    stats.value.totalGenerated++
    stats.value.todayGenerated++
  }

  function setImageResult(id: string, url: string, status: 'completed' | 'failed' = 'completed') {
    const image = generatedImages.value.find(img => img.id === id)
    if (image) {
      image.url = url
      image.status = status
      
      // Update stats
      if (status === 'completed') {
        stats.value.totalCompleted++
        stats.value.todayCompleted++
      } else {
        stats.value.totalFailed++
        stats.value.todayFailed++
      }
    }
  }

  function setViolation(id: string, reason?: string) {
    const image = generatedImages.value.find(img => img.id === id)
    if (image) {
      image.violation = true
      image.violationReason = reason || ''
      stats.value.totalFailed++
      stats.value.todayFailed++
    }
  }

  function updateStats(costAdded: number = 0) {
    stats.value.totalCost += costAdded
    stats.value.todayCost += costAdded
  }

  function resetTodayStats() {
    stats.value.todayGenerated = 0
    stats.value.todayCompleted = 0
    stats.value.todayFailed = 0
    stats.value.todayCost = 0
  }

  function clearGeneratedImages() {
    generatedImages.value = []
  }

  return {
    currentPrompt,
    concurrencyLimit,
    activeRequests,
    generatedImages,
    stats,
    completionRate,
    failureRate,
    setPrompt,
    setConcurrencyLimit,
    addGeneratedImage,
    setImageResult,
    setViolation,
    updateStats,
    resetTodayStats,
    clearGeneratedImages
  }
})
