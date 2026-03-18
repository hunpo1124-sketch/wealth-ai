<template>
  <div class="min-h-screen bg-[var(--bg-primary)] pb-20">
    <div class="px-4 pt-4">
      <h1 class="text-xl font-bold mb-4">统计分析</h1>
      
      <!-- 目标达成看板 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 shadow-sm">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-medium">储蓄目标达成</h3>
          <span class="text-xs text-gray-500">目标：¥8,500</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div class="bg-[var(--primary-color)] h-3 rounded-full transition-all duration-300" :style="{ width: savingsProgress + '%' }"></div>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-[var(--primary-color)] font-medium">{{ savingsProgress.toFixed(1) }}%</span>
          <span class="text-gray-500">{{ remainingBudget >= 0 ? '已存' : '超支' }} ¥{{ Math.abs(remainingBudget).toLocaleString() }}</span>
        </div>
      </div>

      <!-- 收支对比条 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 shadow-sm">
        <h3 class="text-sm font-medium mb-4">收支对比</h3>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-[var(--income-color)] font-medium">收入</span>
          <span class="text-xs text-[var(--expense-color)] font-medium">支出</span>
        </div>
        <div class="flex h-8 rounded-full overflow-hidden shadow-sm">
          <div 
            class="bg-[var(--income-color)] flex items-center justify-center text-white text-xs font-medium transition-all duration-300" 
            :style="{ width: incomeRatio + '%' }"
          >
            {{ incomeRatio.toFixed(0) }}%
          </div>
          <div 
            class="bg-[var(--expense-color)] flex items-center justify-center text-white text-xs font-medium transition-all duration-300" 
            :style="{ width: expenseRatio + '%' }"
          >
            {{ expenseRatio.toFixed(0) }}%
          </div>
        </div>
        <div class="flex justify-between mt-2 text-sm">
          <span class="text-[var(--income-color)] font-medium">¥{{ monthIncome.toLocaleString() }}</span>
          <span class="text-[var(--expense-color)] font-medium">¥{{ monthExpense.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 分类饼图 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 shadow-sm">
        <h3 class="text-sm font-medium mb-4">支出分类</h3>
        <div class="h-48">
          <canvas ref="pieChart"></canvas>
        </div>
      </div>

      <!-- 分类详情 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 shadow-sm">
        <h3 class="text-sm font-medium mb-4">分类详情</h3>
        <div class="space-y-3">
          <div
            v-for="(item, index) in categoryDetails"
            :key="index"
            class="flex items-center justify-between"
            @click="filterByCategory(item.category)"
          >
            <div class="flex items-center flex-1">
              <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: colors[index % colors.length] }"></div>
              <span class="text-sm">{{ item.category }}</span>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium">¥{{ item.amount.toLocaleString() }}</p>
              <p class="text-xs text-gray-500">{{ item.percentage.toFixed(1) }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js';
import { getMonthIncome, getMonthExpense, getRemainingBudget, getSavingsGoalProgress, getTransactions } from '../services/storage';

export default {
  name: 'Statistics',
  data() {
    return {
      monthIncome: 0,
      monthExpense: 0,
      remainingBudget: 0,
      savingsProgress: 0,
      categoryDetails: [],
      colors: [
        '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7', '#D8F3DC', '#F0FDF4'
      ],
      pieChart: null
    }
  },
  computed: {
    incomeRatio() {
      const total = this.monthIncome + this.monthExpense;
      return total > 0 ? (this.monthIncome / total) * 100 : 0;
    },
    expenseRatio() {
      const total = this.monthIncome + this.monthExpense;
      return total > 0 ? (this.monthExpense / total) * 100 : 0;
    }
  },
  mounted() {
    this.loadData();
    this.initPieChart();
  },
  beforeUnmount() {
    if (this.pieChart) this.pieChart.destroy();
  },
  methods: {
    loadData() {
      this.monthIncome = getMonthIncome();
      this.monthExpense = getMonthExpense();
      this.remainingBudget = getRemainingBudget();
      this.savingsProgress = getSavingsGoalProgress();
      this.calculateCategoryDetails();
    },
    
    calculateCategoryDetails() {
      const transactions = getTransactions();
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const expenseTransactions = transactions.filter(t => {
        const date = new Date(t.time);
        return t.type === 'expense' && 
               date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear;
      });
      
      const categoryMap = {};
      let totalExpense = 0;
      
      expenseTransactions.forEach(t => {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
        totalExpense += t.amount;
      });
      
      this.categoryDetails = Object.entries(categoryMap)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount);
    },
    
    initPieChart() {
      const ctx = this.$refs.pieChart.getContext('2d');
      this.pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.categoryDetails.map(item => item.category),
          datasets: [{
            data: this.categoryDetails.map(item => item.amount),
            backgroundColor: this.colors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const item = this.categoryDetails[context.dataIndex];
                  return `${item.category}: ¥${item.amount.toLocaleString()} (${item.percentage.toFixed(1)}%)`;
                }
              }
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                const category = this.categoryDetails[index].category;
                this.filterByCategory(category);
              }
            }
          },
          cutout: '60%'
        }
      });
    },
    
    filterByCategory(category) {
      // 跳转到流水页面并筛选对应分类
      this.$router.push({
        path: '/transactions',
        query: { category: category }
      });
    }
  }
}
</script>