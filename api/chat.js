// Vercel Serverless Function - 面试对话接口
// 火山引擎 API（OpenAI 兼容）

const axios = require('axios')

// 火山引擎 API 配置
const API_CONFIG = {
  baseUrl: 'https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions',
  model: 'ark-code-latest'
}

module.exports = async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { history, messages } = req.body
    const messageList = history || messages || []

    // 获取 API Key
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'API Key 未配置'
      })
    }

    // 调用火山引擎 API（OpenAI 兼容格式）
    const response = await axios.post(API_CONFIG.baseUrl, {
      model: API_CONFIG.model,
      messages: messageList,
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return res.status(200).json({
      success: true,
      content: response.data.choices[0].message.content
    })

  } catch (error) {
    console.error('AI调用失败:', error.response?.data || error.message)
    return res.status(500).json({
      success: false,
      message: 'AI服务暂时不可用',
      error: error.response?.data?.error?.message || error.message
    })
  }
}
