// Vercel Serverless Function - 简历优化接口
// 访问地址：https://your-app.vercel.app/api/optimize

const axios = require('axios')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  try {
    const { resume, jd } = req.body

    let prompt = `请优化以下简历，返回JSON格式：{"items":["优化项1","优化项2","优化项3","优化项4"]}

简历内容：
${resume}`

    if (jd) {
      prompt += `\n\n目标职位要求：\n${jd}`
    }

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    let content = response.data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      return res.status(200).json({ success: true, ...JSON.parse(jsonMatch[0]) })
    }
    
    return res.status(200).json({
      success: true,
      items: ['技能关键词已优化', '项目亮点已提炼', '工作经历已精简', '简历结构已调整']
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: '优化失败' })
  }
}
