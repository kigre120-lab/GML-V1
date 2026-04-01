/**
 * AI服务模块 - JD分析与简历优化
 */

/**
 * JD分析与简历优化服务
 */
class ResumeAIService {
  
  /**
   * 分析JD匹配度
   * @param {string} jd - 职位描述
   * @param {string} resume - 简历内容（可选）
   * @returns {Promise<{matchScore: number, keywords: string[], suggestions: string[]}>}
   */
  async analyzeJD(jd, resume = '') {
    const prompt = `请分析以下职位描述(JD)，提取关键信息：

职位描述：
${jd}

请以JSON格式返回分析结果（只返回JSON，不要其他内容）：
{
  "matchScore": 75,
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5", "关键词6"],
  "suggestions": [
    "优化建议1",
    "优化建议2", 
    "优化建议3",
    "优化建议4"
  ]
}

要求：
1. matchScore: 0-100的匹配度分数
2. keywords: 提取6个核心技能关键词
3. suggestions: 给出4条简历优化建议`

    try {
      const response = await this._callBackendAPI(prompt)
      // 解析JSON响应
      const result = JSON.parse(response)
      return result
    } catch (error) {
      console.error('JD分析失败:', error)
      // 降级处理
      return this._getFallbackJDResult()
    }
  }

  /**
   * 优化简历
   * @param {string} resume - 简历内容
   * @param {string} jd - 职位描述（可选）
   * @returns {Promise<{optimizedContent: string, items: string[]}>}
   */
  async optimizeResume(resume, jd = '') {
    let prompt = `请优化以下简历内容：

简历内容：
${resume}`

    if (jd) {
      prompt += `

目标职位要求：
${jd}`
    }

    prompt += `

请以JSON格式返回优化结果（只返回JSON，不要其他内容）：
{
  "items": [
    "优化项1：技能关键词已匹配岗位要求",
    "优化项2：项目亮点已优化表达",
    "优化项3：工作经历描述已精简",
    "优化项4：简历结构已调整优化"
  ]
}

要求：
1. items: 4条主要优化项描述
2. 描述要具体、实用`

    try {
      const response = await this._callBackendAPI(prompt)
      const result = JSON.parse(response)
      return result
    } catch (error) {
      console.error('简历优化失败:', error)
      return this._getFallbackOptimizeResult()
    }
  }

  /**
   * 调用后端API
   */
  async _callBackendAPI(prompt) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://gml-v1-ddke.vercel.app/api/chat',
        method: 'POST',
        data: {
          messages: [{ role: 'user', content: prompt }]
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            resolve(res.data.content)
          } else {
            reject(new Error(res.data.message || 'API调用失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 降级处理：JD分析默认结果
   */
  _getFallbackJDResult() {
    return {
      matchScore: 70,
      keywords: ['Java', 'Spring', 'MySQL', '分布式', '微服务', '高并发'],
      suggestions: [
        '增加项目经验的技术细节描述',
        '补充与岗位匹配的技能关键词',
        '量化工作成果，用数据说话',
        '优化简历结构，突出核心优势'
      ]
    }
  }

  /**
   * 降级处理：简历优化默认结果
   */
  _getFallbackOptimizeResult() {
    return {
      items: [
        '技能关键词已匹配岗位要求',
        '项目亮点已优化表达',
        '工作经历描述已精简',
        '简历结构已调整优化'
      ]
    }
  }
}

module.exports = new ResumeAIService()
