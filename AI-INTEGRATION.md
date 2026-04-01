# AI接入方案文档

## 一、方案概述

本方案使用 **DeepSeek API** 作为AI模型，通过自建后端服务器代理调用，确保API密钥安全。

## 二、架构图

```
┌─────────────┐      HTTPS      ┌─────────────┐      HTTPS      ┌─────────────┐
│  微信小程序  │ ───────────────→ │  后端服务器  │ ───────────────→ │ DeepSeek API│
│   (前端)    │ ←─────────────── │  (Node.js)  │ ←─────────────── │             │
└─────────────┘                  └─────────────┘                  └─────────────┘
                                        │
                                        ↓
                                 ┌─────────────┐
                                 │   数据库    │
                                 │  (MySQL)    │
                                 └─────────────┘
```

## 三、API接口说明

### 1. 面试对话接口

**请求：**
```
POST /api/interview/chat

{
  "position": "Java后端开发",
  "questionCount": 3,
  "history": [
    {"role": "system", "content": "你是一位资深面试官..."},
    {"role": "user", "content": "我熟悉Spring Boot..."},
    {"role": "assistant", "content": "很好，请介绍一下..."}
  ]
}
```

**响应：**
```json
{
  "success": true,
  "content": "回答不错，Spring Boot确实简化了很多配置。下一个问题：请讲讲Spring的IOC原理？"
}
```

### 2. JD分析接口

**请求：**
```
POST /api/jd/analyze

{
  "jd": "岗位职责：\n1. 负责后端开发...\n任职要求：\n1. 熟悉Java..."
}
```

**响应：**
```json
{
  "success": true,
  "matchScore": 75,
  "keywords": ["Java", "Spring", "MySQL", "分布式", "微服务", "高并发"],
  "suggestions": [
    "增加Spring Boot项目经验描述",
    "补充分布式系统设计经验",
    "量化项目成果数据",
    "优化技术栈关键词布局"
  ]
}
```

### 3. 简历优化接口

**请求：**
```
POST /api/resume/optimize

{
  "resume": "个人简历\n工作经历：...",
  "jd": "岗位职责..."
}
```

**响应：**
```json
{
  "success": true,
  "items": [
    "技能关键词已匹配岗位要求",
    "项目亮点已优化表达",
    "工作经历描述已精简",
    "简历结构已调整优化"
  ]
}
```

## 四、部署步骤

### 步骤1：获取DeepSeek API Key

1. 访问 https://platform.deepseek.com/
2. 注册账号并登录
3. 进入「API Keys」页面创建密钥
4. 复制保存 API Key

### 步骤2：部署后端服务器

```bash
# 进入后端目录
cd GML-V1/backend

# 安装依赖
npm init -y
npm install express axios cors dotenv

# 创建环境变量文件
echo "DEEPSEEK_API_KEY=your_api_key_here" > .env
echo "PORT=3000" >> .env

# 启动服务
node server.js
```

### 步骤3：修改小程序API地址

在 `services/interview-ai.js` 和 `services/resume-ai.js` 中修改：

```javascript
// 将
url: 'https://your-backend.com/api/interview/chat'

// 改为你的实际后端地址
url: 'https://your-domain.com/api/interview/chat'
// 或本地测试
url: 'http://localhost:3000/api/interview/chat'
```

### 步骤4：小程序合法域名配置

1. 登录微信公众平台
2. 进入「开发」→「开发管理」→「开发设置」
3. 在「服务器域名」中添加你的后端域名

## 五、费用估算

### DeepSeek计费标准

| 项目 | 价格 |
|------|------|
| 输入tokens | ¥0.001 / 千tokens |
| 输出tokens | ¥0.002 / 千tokens |

### 月度成本估算

| 场景 | 每日调用 | 月度tokens | 月度费用 |
|------|---------|-----------|---------|
| 面试对话 | 100次 × 2000tokens | 600万 | ¥12 |
| JD分析 | 50次 × 1000tokens | 150万 | ¥3 |
| 简历优化 | 30次 × 800tokens | 72万 | ¥1.5 |
| **合计** | - | - | **¥16.5/月** |

## 六、安全注意事项

1. **API Key 保护**
   - ❌ 绝不在小程序前端代码中存储API Key
   - ✅ 只在后端服务器环境变量中存储
   - ✅ 定期轮换API Key

2. **请求鉴权**
   - 所有API请求需携带用户token
   - 后端验证用户身份和剩余次数

3. **请求限流**
   - 单用户每分钟最多10次请求
   - IP级别限流防止滥用

4. **数据安全**
   - 用户简历数据加密存储
   - 定期清理过期数据

## 七、降级方案

当AI服务不可用时，系统自动切换到预设回复：

| 场景 | 降级策略 |
|------|---------|
| 面试对话 | 使用题库中预设问题 |
| JD分析 | 返回通用分析结果 |
| 简历优化 | 返回通用优化建议 |

## 八、监控与日志

```javascript
// 建议添加的日志记录
console.log({
  timestamp: new Date().toISOString(),
  userId: req.user.id,
  action: 'interview_chat',
  tokens: response.data.usage,
  success: true
})
```

## 九、常见问题

**Q: 为什么需要后端服务器？**
A: 小程序前端代码可被反编译，直接在前端调用API会暴露密钥。

**Q: 可以用其他AI模型吗？**
A: 可以，只需修改后端的API地址和请求格式。推荐：通义千问、文心一言。

**Q: 如何测试？**
A: 使用微信开发者工具的「不校验合法域名」选项，连接本地后端服务。
