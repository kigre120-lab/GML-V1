/**
 * 腾讯云函数 - AI面试对话接口
 * 函数URL版本
 */

const https = require('https')

exports.main_handler = async (event) => {
  // 允许跨域
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
  
  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }
  
  // 只接受 POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, message: 'Method not allowed' }) }
  }

  // 解析请求体
  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'Invalid JSON' }) }
  }
  
  const { history, messages } = body
  const messageList = history || messages || []
  
  // 火山引擎 API Key
  const apiKey = '4165973f-f7af-4479-b578-3adc063740bd'
  
  const requestBody = JSON.stringify({
    model: 'ark-code-latest',
    messages: messageList,
    temperature: 0.7,
    max_tokens: 200
  })

  // 调用火山引擎 API
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'ark.cn-beijing.volces.com',
      port: 443,
      path: '/api/coding/v3/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              content: json.choices[0].message.content
            })
          })
        } catch (e) {
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'AI服务异常' })
          })
        }
      })
    })

    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, message: e.message })
      })
    })

    req.write(requestBody)
    req.end()
  })
}
