<template>
  <div class="min-h-screen bg-[var(--bg-primary)] pb-20">
    <div class="px-4 pt-4">
      <h1 class="text-xl font-bold mb-4">设置</h1>
      
      <!-- API设置 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 shadow-sm">
        <h3 class="text-sm font-medium mb-3">API设置</h3>
        <div class="mb-3">
          <label class="block text-xs text-gray-500 mb-1">DeepSeek API Key</label>
          <input
            type="password"
            v-model="apiKey"
            class="w-full bg-[var(--bg-primary)] border border-gray-200 rounded-xl px-3 py-2 text-sm input-focus shadow-sm"
            @change="saveApiKey"
          />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500">AI 记账功能</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="aiEnabled"
              class="sr-only peer"
              @change="toggleAI"
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
          </label>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 shadow-sm">
        <h3 class="text-sm font-medium mb-3">数据管理</h3>
        <div class="space-y-3">
          <button
            class="w-full flex justify-between items-center py-3 px-2 text-sm font-medium text-[var(--primary-color)] border-b border-gray-100"
            @click="exportData"
          >
            <span>导出数据</span>
            <span>📤</span>
          </button>
          <button
            class="w-full flex justify-between items-center py-3 px-2 text-sm font-medium text-[var(--expense-color)]"
            @click="clearData"
          >
            <span>清空数据</span>
            <span>🗑️</span>
          </button>
        </div>
      </div>

      <!-- 关于 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 shadow-sm">
        <h3 class="text-sm font-medium mb-3">关于</h3>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm">版本</span>
            <span class="text-sm text-gray-500">1.0.0</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm">开发者</span>
            <span class="text-sm text-gray-500">WealthAI Team</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSettings, saveSettings, clearAllData, exportData as exportDataService } from '../services/storage';

export default {
  name: 'Settings',
  data() {
    return {
      apiKey: '',
      aiEnabled: true
    }
  },
  mounted() {
    this.loadSettings();
  },
  methods: {
    loadSettings() {
      const settings = getSettings();
      this.apiKey = settings.apiKey || '';
      this.aiEnabled = settings.aiEnabled !== false;
    },
    
    saveApiKey() {
      saveSettings('apiKey', this.apiKey);
    },
    
    toggleAI() {
      saveSettings('aiEnabled', this.aiEnabled);
    },
    
    exportData() {
      exportDataService();
    },
    
    clearData() {
      if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
        clearAllData();
        alert('数据已清空');
        window.location.reload();
      }
    }
  }
}
</script>

<style scoped>
.input-focus {
  @apply focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none;
}
</style>