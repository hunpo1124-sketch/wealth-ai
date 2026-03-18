// 数据存储服务 - 使用LocalStorage实现数据持久化

const STORAGE_KEY = 'wealthai_data';

// 默认数据
const defaultData = {
  transactions: [],
  assets: {
    stocks: 0,
    funds: 0,
    mortgage: 390000
  },
  settings: {
    savingsGoal: 8500,
    apiKey: '',
    aiEnabled: true
  }
};

// 获取数据
export function getData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultData;
  } catch (error) {
    console.error('读取数据失败:', error);
    return defaultData;
  }
}

// 保存数据
export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存数据失败:', error);
    return false;
  }
}

// 添加交易记录
export function addTransaction(transaction) {
  const data = getData();
  data.transactions.unshift(transaction);
  saveData(data);
  return data.transactions;
}

// 获取所有交易记录
export function getTransactions() {
  const data = getData();
  return data.transactions;
}

// 获取本月收入
export function getMonthIncome() {
  const transactions = getTransactions();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions
    .filter(t => {
      const date = new Date(t.time);
      return t.type === 'income' && 
             date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

// 获取本月支出
export function getMonthExpense() {
  const transactions = getTransactions();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions
    .filter(t => {
      const date = new Date(t.time);
      return t.type === 'expense' && 
             date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

// 获取剩余预算
export function getRemainingBudget() {
  const income = getMonthIncome();
  const expense = getMonthExpense();
  return income - expense;
}

// 获取储蓄目标进度
export function getSavingsGoalProgress() {
  const remainingBudget = getRemainingBudget();
  const goal = getData().settings.savingsGoal;
  const progress = (remainingBudget / goal) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

// 更新资产
export function updateAssets(type, amount) {
  const data = getData();
  data.assets[type] = amount;
  saveData(data);
  return data.assets;
}

// 获取资产
export function getAssets() {
  const data = getData();
  return data.assets;
}

// 更新设置
export function updateSettings(settings) {
  const data = getData();
  data.settings = { ...data.settings, ...settings };
  saveData(data);
  return data.settings;
}

// 获取设置
export function getSettings() {
  const data = getData();
  return data.settings;
}

// 保存设置（与updateSettings功能相同，作为别名）
export function saveSettings(key, value) {
  const data = getData();
  data.settings[key] = value;
  saveData(data);
  return data.settings;
}

// 清空所有数据
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('清空数据失败:', error);
    return false;
  }
}

// 导出数据
export function exportData() {
  try {
    const data = getData();
    // 导出时移除敏感信息（API Key）
    const exportData = {
      ...data,
      settings: {
        ...data.settings,
        apiKey: '[REDACTED]'
      }
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wealthai_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('导出数据失败:', error);
    return false;
  }
}

// 删除交易记录
export function deleteTransaction(id) {
  try {
    const data = getData();
    data.transactions = data.transactions.filter(t => t.id !== id);
    saveData(data);
    return true;
  } catch (error) {
    console.error('删除交易记录失败:', error);
    return false;
  }
}
