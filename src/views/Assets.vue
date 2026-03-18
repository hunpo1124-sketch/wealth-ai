<template>
  <div class="min-h-screen bg-[var(--bg-primary)] pb-20">
    <div class="px-4 pt-4">
      <h1 class="text-xl font-bold mb-4">资产管理</h1>
      
      <!-- 负债监控 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 shadow-sm">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-medium">房贷剩余本金</h3>
          <span class="text-xs text-gray-500">负债</span>
        </div>
        <p class="text-3xl font-bold text-[var(--expense-color)] mb-3">¥{{ mortgage.toLocaleString() }}</p>
        <button
          class="w-full bg-[var(--primary-color)] hover:bg-opacity-90 text-white py-3 rounded-full transition-colors text-sm font-medium shadow-sm"
          @click="payMortgage"
        >
          还房贷 -¥6,000
        </button>
      </div>

      <!-- 股票模块 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 shadow-sm">
        <h3 class="text-sm font-medium mb-4">股票</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm">总资产</span>
              <span class="text-xs text-gray-500">今日盈亏</span>
            </div>
            <div class="flex items-center justify-between">
              <input
                type="number"
                v-model="stocks"
                class="bg-[var(--bg-primary)] border border-gray-200 rounded-xl px-3 py-2 text-lg font-semibold w-40 input-focus shadow-sm"
                @change="updateAssets('stocks', stocks)"
              />
              <div class="text-right">
                <p class="text-sm font-medium" :class="stockProfit >= 0 ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'">
                  {{ stockProfit >= 0 ? '+' : '' }}¥{{ stockProfit.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 基金模块 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 mb-6 shadow-sm">
        <h3 class="text-sm font-medium mb-4">基金</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm">总资产</span>
              <span class="text-xs text-gray-500">今日盈亏</span>
            </div>
            <div class="flex items-center justify-between">
              <input
                type="number"
                v-model="funds"
                class="bg-[var(--bg-primary)] border border-gray-200 rounded-xl px-3 py-2 text-lg font-semibold w-40 input-focus shadow-sm"
                @change="updateAssets('funds', funds)"
              />
              <div class="text-right">
                <p class="text-sm font-medium" :class="fundProfit >= 0 ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'">
                  {{ fundProfit >= 0 ? '+' : '' }}¥{{ fundProfit.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 资产总览 -->
      <div class="bg-[var(--bg-card)] rounded-2xl p-4 shadow-sm">
        <h3 class="text-sm font-medium mb-4">资产总览</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">总资产</span>
            <span class="text-lg font-semibold text-[var(--income-color)]">¥{{ totalAssets.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">总负债</span>
            <span class="text-lg font-semibold text-[var(--expense-color)]">¥{{ mortgage.toLocaleString() }}</span>
          </div>
          <div class="border-t border-gray-100 pt-3 mt-3">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">净资产</span>
              <span class="text-xl font-bold" :class="netAssets >= 0 ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'">
                ¥{{ netAssets.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAssets, updateAssets, addTransaction } from '../services/storage';

export default {
  name: 'Assets',
  data() {
    return {
      mortgage: 390000,
      stocks: 0,
      funds: 0,
      stockProfit: 0,
      fundProfit: 0
    }
  },
  computed: {
    totalAssets() {
      return this.stocks + this.funds;
    },
    netAssets() {
      return this.totalAssets - this.mortgage;
    }
  },
  mounted() {
    this.loadAssets();
  },
  methods: {
    loadAssets() {
      const assets = getAssets();
      this.mortgage = assets.mortgage;
      this.stocks = assets.stocks;
      this.funds = assets.funds;
    },
    
    payMortgage() {
      const mortgageAmount = 6000;
      
      this.mortgage -= mortgageAmount;
      updateAssets('mortgage', this.mortgage);
      
      const newBill = {
        id: Date.now(),
        name: '房贷还款',
        category: '房产',
        amount: mortgageAmount,
        type: 'expense',
        time: new Date().toISOString()
      };
      
      addTransaction(newBill);
      
      alert('本月房贷已扣除，距离财务自由又近了一步！');
    }
  }
}
</script>

<style scoped>
.input-focus {
  @apply focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none;
}
</style>