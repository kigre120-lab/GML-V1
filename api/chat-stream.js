// Vercel Serverless Function - 面试对话接口（流式响应）
// 火山引擎 API（OpenAI 兼容）

module.exports = async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const https = require('https')
  const { history, messages } = req.body
  const messageList = history || messages || []
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'API Key 未配置' })
  }

  // 构建请求体
  const requestBody = JSON.stringify({
    model: 'ark-code-latest',
    messages: messageList,
    temperature: 0.7,
    max_tokens: 200,
    stream: true
  })

  // 创建请求
  const options = {
    hostname: 'ark.cn-beijing.volces.com',
    port: 443,
    path: '/api/coding/v3/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(requestBody)
    }
  }

  const proxyReq = https.request(options, (proxyRes) => {
    proxyRes.on('data', (chunk) => {
      res.write(chunk)
    })
    
    proxyRes.on('end', () => {
      res.end()
    })
  })

  proxyReq.on('error', (error) => {
    console.error('代理请求错误:', error)
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
    res.end()
  })

  proxyReq.write(requestBody)
  proxyReq.end()
}
