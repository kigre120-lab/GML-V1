// Vercel Serverless Function - JD分析接口
// 访问地址：https://your-app.vercel.app/api/analyze

const axios = require('axios')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  try {
    const { jd } = req.body

    const prompt = `分析以下职位描述，提取关键信息，只返回JSON格式：
{"matchScore":75,"keywords":["技能1","技能2","技能3","技能4","技能5","技能6"],"suggestions":["建议1","建议2","建议3","建议4"]}

职位描述：
${jd}`

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
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
      matchScore: 70,
      keywords: ['Java', 'Spring', 'MySQL', '分布式', '微服务', '高并发'],
      suggestions: ['增加项目经验描述', '补充技能关键词', '量化工作成果', '优化简历结构']
    })

  } catch (error) {
    return res.status(500).json({ success: false, message: '分析失败' })
  }
}
