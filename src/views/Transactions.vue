<template>
  <div class="min-h-screen bg-[var(--bg-primary)] pb-20">
    <div class="px-4 pt-4">
      <h1 class="text-xl font-bold mb-4">流水记录</h1>
      
      <!-- 筛选器 -->
      <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          class="px-4 py-2 rounded-full text-sm transition-colors shadow-sm whitespace-nowrap"
          :class="filter === 'all' ? 'bg-[var(--primary-color)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'"
          @click="filter = 'all'"
        >
          全部
        </button>
        <button
          class="px-4 py-2 rounded-full text-sm transition-colors shadow-sm whitespace-nowrap"
          :class="filter === 'income' ? 'bg-[var(--income-color)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'"
          @click="filter = 'income'"
        >
          收入
        </button>
        <button
          class="px-4 py-2 rounded-full text-sm transition-colors shadow-sm whitespace-nowrap"
          :class="filter === 'expense' ? 'bg-[var(--expense-color)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'"
          @click="filter = 'expense'"
        >
          支出
        </button>
        <button
          v-if="categoryFilter"
          class="px-4 py-2 rounded-full text-sm transition-colors shadow-sm whitespace-nowrap bg-gray-100 text-gray-700"
          @click="clearCategoryFilter"
        >
          {{ categoryFilter }} <span class="ml-1">×</span>
        </button>
      </div>

      <!-- 流水列表 -->
      <div class="space-y-3">
        <div
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          class="bg-[var(--bg-card)] rounded-2xl p-4 shadow-sm"
        >
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h3 class="text-sm font-medium">{{ transaction.name }}</h3>
              <div class="flex items-center mt-1">
                <span class="text-xs bg-gray-100 text-[var(--text-secondary)] px-2 py-0.5 rounded-full mr-2">{{ transaction.category }}</span>
                <span class="text-xs text-gray-500">{{ formatTime(transaction.time) }}</span>
              </div>
            </div>
            <div class="flex items-center">
              <p class="text-lg font-semibold mr-4" :class="transaction.type === 'income' ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'">
                {{ transaction.type === 'income' ? '+' : '-' }}¥{{ transaction.amount }}
              </p>
              <button 
                class="text-gray-400 hover:text-[var(--expense-color)] transition-colors"
                @click="deleteTransaction(transaction.id)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="filteredTransactions.length === 0" class="text-center py-12 text-gray-500">
          暂无记录
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getTransactions, deleteTransaction as deleteTransactionService } from '../services/storage';

export default {
  name: 'Transactions',
  data() {
    return {
      filter: 'all',
      categoryFilter: '',
      transactions: []
    }
  },
  computed: {
    filteredTransactions() {
      let result = this.transactions;
      
      // 类型筛选
      if (this.filter !== 'all') {
        result = result.filter(t => t.type === this.filter);
      }
      
      // 分类筛选
      if (this.categoryFilter) {
        result = result.filter(t => t.category === this.categoryFilter);
      }
      
      return result;
    }
  },
  mounted() {
    this.loadTransactions();
    this.checkQueryParams();
  },
  watch: {
    $route: {
      handler() {
        this.checkQueryParams();
      },
      immediate: true
    }
  },
  methods: {
    loadTransactions() {
      this.transactions = getTransactions();
    },
    
    checkQueryParams() {
      if (this.$route.query.category) {
        this.categoryFilter = this.$route.query.category;
        this.filter = 'all'; // 重置类型筛选
      }
    },
    
    clearCategoryFilter() {
      this.categoryFilter = '';
      this.$router.push('/transactions');
    },
    
    formatTime(time) {
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    deleteTransaction(id) {
      if (confirm('确定要删除这条记录吗？')) {
        deleteTransactionService(id);
        this.loadTransactions();
      }
    }
  }
}
</script>