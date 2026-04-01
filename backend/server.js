/**
 * 后端API示例 - Node.js + Express
 * 
 * 部署步骤：
 * 1. cd backend && npm install express axios cors dotenv
 * 2. 创建 .env 文件：DEEPSEEK_API_KEY=your_api_key
 * 3. node server.js 启动服务
 */

const express = require('express')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// AI API配置
const AI_CONFIG = {
  baseUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  apiKey: process.env.DEEPSEEK_API_KEY
}

/**
 * 面试对话接口
 * POST /api/interview/chat
 */
app.post('/api/interview/chat', async (req, res) => {
  try {
    const { history } = req.body
    
    const response = await axios.post(AI_CONFIG.baseUrl, {
      model: AI_CONFIG.model,
      messages: history,
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    res.json({
      success: true,
      content: response.data.choices[0].message.content
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI服务暂时不可用'
    })
  }
})

/**
 * JD分析接口
 * POST /api/jd/analyze
 */
app.post('/api/jd/analyze', async (req, res) => {
  try {
    const { jd } = req.body
    
    const prompt = `分析以下职位描述，提取关键信息，以JSON格式返回：
{"matchScore":70,"keywords":["技能1","技能2"],"suggestions":["建议1","建议2"]}

JD内容：
${jd}`

    const response = await axios.post(AI_CONFIG.baseUrl, {
      model: AI_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    let content = response.data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      res.json({ success: true, ...JSON.parse(jsonMatch[0]) })
    } else {
      res.json({
        success: true,
        matchScore: 70,
        keywords: ['Java', 'Spring', 'MySQL'],
        suggestions: ['增加项目经验', '补充技能关键词']
      })
    }
    
  } catch (error) {
    res.status(500).json({ success: false, message: '分析失败' })
  }
})

/**
 * 简历优化接口
 * POST /api/resume/optimize
 */
app.post('/api/resume/optimize', async (req, res) => {
  try {
    const { resume, jd } = req.body
    
    const prompt = `优化简历，返回JSON：{"items":["优化项1","优化项2","优化项3"]}

简历：${resume}
${jd ? 'JD：' + jd : ''}`

    const response = await axios.post(AI_CONFIG.baseUrl, {
      model: AI_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    let content = response.data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      res.json({ success: true, ...JSON.parse(jsonMatch[0]) })
    } else {
      res.json({
        success: true,
        items: ['技能关键词优化', '项目亮点提炼', '经历描述精简']
      })
    }
    
  } catch (error) {
    res.status(500).json({ success: false, message: '优化失败' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`))
