<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50" style="padding-bottom: env(safe-area-inset-bottom);">
    <div class="flex justify-around items-center py-2 px-4">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-2 px-3 transition-colors"
        :class="isActive(item.path) ? 'text-[var(--primary-color)]' : 'text-gray-400'"
      >
        <component :is="item.icon" class="w-6 h-6 mb-1" />
        <span class="text-[11px] font-medium">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script>
import { Home, List, BarChart3, Wallet, Settings } from 'lucide-vue-next';

export default {
  name: 'BottomNav',
  components: {
    Home,
    List,
    BarChart3,
    Wallet,
    Settings
  },
  data() {
    return {
      navItems: [
        { path: '/', label: '记账', icon: 'Home' },
        { path: '/transactions', label: '流水', icon: 'List' },
        { path: '/statistics', label: '统计', icon: 'BarChart3' },
        { path: '/assets', label: '资产', icon: 'Wallet' },
        { path: '/settings', label: '设置', icon: 'Settings' }
      ]
    }
  },
  methods: {
    isActive(path) {
      return this.$route.path === path;
    }
  }
}
</script>

<style scoped>
/* 禁用点击时的蓝色高亮 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 确保导航链接有足够的点击区域 */
router-link {
  touch-action: manipulation;
}
</style>
