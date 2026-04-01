// Vercel Serverless Function - 面试对话接口
// 访问地址：https://your-app.vercel.app/api/chat

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
    
    // 支持两种参数格式
    const messageList = history || messages || []

    // 调用 DeepSeek API
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: messageList,
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
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
      error: error.message
    })
  }
}
