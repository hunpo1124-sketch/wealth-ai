// API服务模块
import { getSettings } from './storage';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 获取 API Key
 * @returns {string} API Key
 */
function getApiKey() {
  const settings = getSettings();
  return settings.apiKey || '';
}

/**
 * 解析账单描述
 * @param {string} description - 账单描述文本
 * @returns {Promise<Object>} 解析结果，包含金额、分类等信息
 */
export async function parseBillDescription(description) {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      console.warn('未配置 API Key，请前往设置页面配置');
      return {
        amount: 0,
        category: '其他',
        name: description,
        error: '未配置 API Key'
      };
    }

    // 构建请求数据
    const requestData = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个智能账单解析助手，请从用户输入的文本中提取金额、类型、分类和消费项名称。\n\n请特别注意：\n1. 必须能够识别收入和支出：\n   - 收入关键词：发工资、工资、奖金、兼职、利息、收入、赚了、收到等\n   - 支出关键词：花了、消费、买了、吃饭、打车、购物等\n2. 必须具备中文大写数字转阿拉伯数字的能力：\n   - 整数：五十元 -> 50，五十五元 -> 55，一百二十元 -> 120\n   - 小数：八块五 -> 8.5，三块二毛五 -> 3.25\n   - 其他：五块 -> 5，五元 -> 5\n3. 能够识别自然语言描述\n4. 严格按照指定格式返回，只返回标准JSON，不包含任何解释性文字\n5. 如果金额为0或无法识别，请将amount设为0\n\n请按照以下JSON格式返回结果：\n{"amount": 数字, "type": "income/expense", "name": "字符串", "category": "字符串"}\n\n其中：\n- amount：提取的金额（必须为数字类型）\n- type：类型，income为收入，expense为支出\n- name：消费项名称\n- category：分类，可选值：餐饮、交通、日常、娱乐、生活缴费、教育、房产、工资、兼职、利息、其他\n\n示例：\n- "发工资15000" -> {"amount": 15000, "type": "income", "name": "工资", "category": "工资"}\n- "老乡鸡28" -> {"amount": 28, "type": "expense", "name": "老乡鸡", "category": "餐饮"}\n- "吃饭消费五十元" -> {"amount": 50, "type": "expense", "name": "吃饭", "category": "餐饮"}\n- "买衣服花了三百块" -> {"amount": 300, "type": "expense", "name": "买衣服", "category": "日常"}\n- "打车去公司花了二十五元" -> {"amount": 25, "type": "expense", "name": "打车去公司", "category": "交通"}\n- "河马购物花了五十五元" -> {"amount": 55, "type": "expense", "name": "河马购物", "category": "日常"}\n- "兼职赚了八百块" -> {"amount": 800, "type": "income", "name": "兼职", "category": "兼职"}'
        },
        {
          role: 'user',
          content: description
        }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    };

    // 发送请求
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    // 检查响应状态
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API Key 无效，请检查设置');
      }
      throw new Error(`API请求失败: ${response.status}`);
    }

    // 解析响应数据
    const data = await response.json();
    console.log('AI解析结果:', data);
    const result = JSON.parse(data.choices[0].message.content);
    
    // 确保amount是数字类型
    if (typeof result.amount === 'string') {
      result.amount = parseFloat(result.amount) || 0;
    }
    
    return result;
  } catch (error) {
    console.error('解析账单失败:', error);
    // 返回默认值
    return {
      amount: 0,
      category: '其他',
      name: description,
      error: error.message
    };
  }
}
