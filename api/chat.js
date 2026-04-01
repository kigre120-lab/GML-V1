// Vercel Serverless Function - 面试对话接口

const axios = require('axios')

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

    // 检查 API Key
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      console.error('API Key 未配置')
      return res.status(500).json({
        success: false,
        message: 'API Key 未配置，请在 Vercel 环境变量中添加 DEEPSEEK_API_KEY'
      })
    }

    // 调用 DeepSeek API
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
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
    console.error('AI调用失败:', error.response?.status, error.response?.data || error.message)
    return res.status(500).json({
      success: false,
      message: 'AI服务暂时不可用',
      error: error.message,
      status: error.response?.status
    })
  }
}
