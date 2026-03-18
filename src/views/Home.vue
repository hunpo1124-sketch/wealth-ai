<template>
  <div class="min-h-screen bg-[var(--bg-primary)]" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <!-- 顶部全局状态栏 -->
    <div class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 px-4 py-3 border-b border-gray-200" style="padding-top: calc(12px + env(safe-area-inset-top));">
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-xs text-[var(--text-secondary)]">本月结余</h3>
          <p class="text-lg font-semibold" :class="remainingBudget >= 0 ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'">
            ¥{{ remainingBudget.toLocaleString() }}
          </p>
        </div>
        <div class="text-right">
          <h3 class="text-xs text-[var(--text-secondary)]">目标进度</h3>
          <div class="flex items-center justify-end">
            <p class="text-sm font-medium mr-2 text-[var(--primary-color)]">{{ savingsProgress.toFixed(0) }}%</p>
            <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-300" 
                :class="isGoalAchieved ? 'bg-[#10B981]' : 'bg-[var(--primary-color)]'"
                :style="{ width: savingsProgress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话区域 -->
    <div class="pt-24 pb-36 px-4 overflow-y-auto ios-scroll" ref="chatContainer" style="padding-top: calc(60px + env(safe-area-inset-top));">
      <!-- 系统欢迎消息 -->
      <div class="flex mb-6 mt-4">
        <div class="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white mr-3 flex-shrink-0 text-sm font-medium">
          AI
        </div>
        <div class="bg-white rounded-[20px] rounded-tl-[4px] p-4 shadow-sm max-w-[80%]">
          <p class="text-[15px] leading-relaxed text-gray-800">你好！我是 WealthAI，你的智能记账助手。请告诉我你的消费或收入情况，我会帮你自动记录。</p>
          <p class="text-[13px] text-gray-500 mt-2">例如：发工资15000 或 今天基金赚了200</p>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-for="(message, index) in messages" :key="index" class="mb-5">
        <!-- 用户消息 -->
        <div v-if="message.type === 'user'" class="flex justify-end">
          <div class="bg-[var(--primary-color)] text-white rounded-[20px] rounded-tr-[4px] p-4 shadow-sm max-w-[80%]">
            <p class="text-[15px] leading-relaxed">{{ message.content }}</p>
          </div>
        </div>

        <!-- AI消息 -->
        <div v-else-if="message.type === 'ai'" class="flex">
          <div class="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white mr-3 flex-shrink-0 text-sm font-medium">
            AI
          </div>
          <div class="bg-white rounded-[20px] rounded-tl-[4px] p-4 shadow-sm max-w-[80%]">
            <!-- 解析成功的卡片 -->
            <div v-if="message.data" class="mb-3">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-[15px] font-semibold text-gray-800">{{ message.data.name }}</h3>
                <p class="text-lg font-bold" :class="message.data.type === 'income' ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'">
                  {{ message.data.type === 'income' ? '+' : '-' }}¥{{ message.data.amount }}
                </p>
              </div>
              <div class="text-[13px] text-gray-500 space-y-1">
                <p>分类：{{ message.data.category }}</p>
                <p>日期：{{ formatTime(message.data.time) }}</p>
                <p v-if="message.data.source">来源：{{ message.data.source }}</p>
                <p v-if="message.data.note">备注：{{ message.data.note }}</p>
              </div>
              <div class="mt-2 pt-2 border-t border-gray-100">
                <p class="text-[12px] text-gray-400">置信度 {{ message.data.confidence }}%</p>
              </div>
            </div>
            <!-- AI回复内容 -->
            <p class="text-[15px] leading-relaxed text-gray-800">{{ message.content }}</p>
          </div>
        </div>

        <!-- 自动入账成功提示 -->
        <div v-if="message.type === 'system'" class="flex justify-center">
          <div class="bg-gray-100/80 rounded-full px-4 py-2">
            <p class="text-[12px] text-gray-600 flex items-center">
              <span class="mr-1">📝</span> 自动入账成功
              <span class="ml-2 font-medium" :class="message.data.type === 'income' ? 'text-[var(--income-color)]' : 'text-[var(--expense-color)]'">
                {{ message.data.type === 'income' ? '+' : '-' }}¥{{ message.data.amount }} {{ message.data.name }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="isLoading" class="flex mb-5">
        <div class="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white mr-3 flex-shrink-0 text-sm font-medium">
          AI
        </div>
        <div class="bg-white rounded-[20px] rounded-tl-[4px] p-4 shadow-sm flex items-center">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-2"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>

    <!-- 底部交互栏 - 位于导航栏之上 -->
    <div class="fixed left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 z-40" style="bottom: calc(64px + env(safe-area-inset-bottom)); padding-bottom: calc(12px + env(safe-area-inset-bottom));">
      <!-- 键盘输入模式 -->
      <div v-if="inputMode === 'keyboard'" class="flex items-center">
        <button
          class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-gray-500 mr-3"
          @click="inputMode = 'voice'"
        >
          🎤
        </button>
        <div class="flex-1 relative">
          <input
            type="text"
            placeholder="输入账单描述..."
            class="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-5 text-[15px] input-focus"
            @keyup.enter="addBill"
            v-model="billInput"
            :disabled="isLoading"
            style="color: #1B1B1B;"
          />
        </div>
        <button
          class="ml-3 w-11 h-11 min-w-[44px] min-h-[44px] bg-[var(--primary-color)] hover:bg-opacity-90 text-white rounded-full text-sm font-medium transition-colors flex items-center justify-center"
          @click="addBill"
          :disabled="isLoading || !billInput.trim()"
        >
          ↑
        </button>
      </div>

      <!-- 语音输入模式 -->
      <div v-else class="flex items-center justify-center py-2">
        <button
          class="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-gray-500 absolute left-4"
          @click="inputMode = 'keyboard'"
        >
          ⌨️
        </button>
        <div class="relative">
          <button
            class="w-[60px] h-[60px] min-w-[44px] min-h-[44px] rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-95"
            :class="{ 'scale-95': isRecording }"
            @mousedown="startVoiceInput"
            @mouseup="stopVoiceInput"
            @mouseleave="stopVoiceInput"
            @touchstart="startVoiceInput"
            @touchend="stopVoiceInput"
            :disabled="isLoading"
          >
            <span class="text-2xl">{{ isRecording ? '🔴' : '🎤' }}</span>
            <!-- 波纹动画 -->
            <div v-if="isRecording" class="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
          </button>
          <!-- 录音提示 -->
          <div v-if="isRecording" class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
            录音中... {{ recordingTime }}s
          </div>
        </div>
        <div class="w-11 absolute right-4"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseBillDescription } from '../services/apiService';
import { addTransaction, getMonthIncome, getMonthExpense, getRemainingBudget, getSavingsGoalProgress, getTransactions, updateAssets } from '../services/storage';

export default {
  name: 'Home',
  data() {
    return {
      billInput: '',
      isLoading: false,
      isRecording: false,
      inputMode: 'voice', // 'voice' 或 'keyboard'
      recognition: null,
      recordingTime: 0,
      recordingTimer: null,
      monthIncome: 0,
      monthExpense: 0,
      remainingBudget: 0,
      savingsProgress: 0,
      messages: []
    }
  },
  computed: {
    // 是否达成目标
    isGoalAchieved() {
      return this.remainingBudget >= 8500;
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.monthIncome = getMonthIncome();
      this.monthExpense = getMonthExpense();
      this.remainingBudget = getRemainingBudget();
      this.savingsProgress = getSavingsGoalProgress();
    },
    
    async addBill() {
      if (!this.billInput.trim()) return;
      
      // 添加用户消息
      this.messages.push({
        type: 'user',
        content: this.billInput
      });
      
      // 自动滚动到底部
      this.scrollToBottom();
      
      try {
        this.isLoading = true;
        const result = await parseBillDescription(this.billInput);
        
        if (result.amount === 0 || result.amount === null || result.amount === undefined) {
          // 添加AI回复
          this.messages.push({
            type: 'ai',
            content: '抱歉，我没听清金额，请再说一次。'
          });
          this.billInput = '';
          return;
        }
        
        // 检查是否是基金或股票收益
        let isInvestment = false;
        let investmentType = '';
        
        if (this.billInput.includes('基金') || this.billInput.includes('股票')) {
          isInvestment = true;
          investmentType = this.billInput.includes('基金') ? '基金' : '股票';
          
          // 自动更新资产模块
          if (investmentType === '基金') {
            const assets = JSON.parse(localStorage.getItem('wealthai_data') || '{"assets":{"stocks":0,"funds":0,"mortgage":390000}}').assets;
            updateAssets('funds', (assets.funds || 0) + result.amount);
          } else if (investmentType === '股票') {
            const assets = JSON.parse(localStorage.getItem('wealthai_data') || '{"assets":{"stocks":0,"funds":0,"mortgage":390000}}').assets;
            updateAssets('stocks', (assets.stocks || 0) + result.amount);
          }
        }
        
        const newBill = {
          id: Date.now(),
          name: result.name || this.billInput,
          category: result.category,
          amount: result.amount,
          type: result.type || 'expense',
          time: new Date().toISOString(),
          source: this.billInput,
          confidence: Math.floor(Math.random() * 5) + 95 // 模拟置信度
        };
        
        addTransaction(newBill);
        this.loadData();
        
        // 添加AI回复
        let aiResponse = '';
        if (isInvestment) {
          aiResponse = `太棒了！已为您更新${investmentType}资产，今日盈亏 +¥${result.amount}`;
        } else if (newBill.type === 'income') {
          aiResponse = `收到！已为您记录一笔收入：${newBill.name} ¥${newBill.amount}`;
        } else {
          aiResponse = `好的！已为您记录一笔支出：${newBill.name} ¥${newBill.amount}`;
        }
        
        this.messages.push({
          type: 'ai',
          content: aiResponse,
          data: newBill
        });
        
        // 添加系统提示
        this.messages.push({
          type: 'system',
          data: newBill
        });
        
        this.billInput = '';
      } catch (error) {
        console.error('添加账单失败:', error);
        this.messages.push({
          type: 'ai',
          content: '抱歉，处理失败，请重试。'
        });
      } finally {
        this.isLoading = false;
        // 自动滚动到底部
        this.scrollToBottom();
      }
    },
    
    startVoiceInput() {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('您的浏览器不支持语音识别功能，请使用Chrome浏览器');
        return;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      
      this.isRecording = true;
      this.recordingTime = 0;
      
      // 开始计时
      this.recordingTimer = setInterval(() => {
        this.recordingTime++;
      }, 1000);
      
      this.recognition.onstart = () => {
        console.log('语音识别开始');
      };
      
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.billInput = transcript;
        this.addBill();
      };
      
      this.recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        this.stopVoiceInput();
        alert('语音识别失败，请重试');
      };
      
      this.recognition.onend = () => {
        this.stopVoiceInput();
      };
      
      this.recognition.start();
    },
    
    stopVoiceInput() {
      if (this.recognition) {
        this.recognition.stop();
      }
      
      this.isRecording = false;
      
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }
      
      this.recordingTime = 0;
    },
    
    formatTime(time) {
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        setTimeout(() => {
          const chatContainer = this.$refs.chatContainer;
          if (chatContainer) {
            chatContainer.scrollTo({
              top: chatContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 50);
      });
    }
  }
}
</script>

<style scoped>
.input-focus {
  @apply focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none;
}

/* iOS 惯性滚动 */
.ios-scroll {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 0;
  display: none;
}

/* 波纹动画 */
.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 禁用文本选择，提升触摸体验 */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}
</style>
