# 智谱 GLM Vision 模型配置指南

本插件现已支持智谱 AI 的视觉模型（如 GLM-4.6V）进行图片识别。

## 支持的模型

### 文本模型（不支持图片）
- `glm-4.7` - 最新旗舰文本模型
- `glm-4.6` - 文本对话模型
- `glm-4.5` / `glm-4.5-air` / `glm-4.5-airx` - 轻量级文本模型

**注意**：使用文本模型时，如果输入包含图片，插件会自动将图片转换为文本提示。

### 视觉模型（支持图片识别）
- `glm-4.6v` - **推荐**，最新视觉模型，支持 128K 上下文
- `glm-4v` - 视觉理解模型
- `glm-4v-plus` - 增强版视觉模型
- `glm-4.5v` - 开源视觉模型
- `glm-4.6v-flash` - 免费视觉模型
- `glm-4v-flash` - 免费快速视觉模型

## 配置步骤

### 1. 添加 GLM-4.6V 模型配置

在 VS Code 设置中添加自定义模型配置：

```json
{
  "github.copilot.advanced": {
    "byok": {
      "models": [
        {
          "id": "glm-4.6v",
          "name": "GLM-4.6V (Vision)",
          "provider": "openai-compatible",
          "endpoint": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          "apiKey": "YOUR_ZHIPU_API_KEY",
          "capabilities": {
            "supportsVision": true,
            "supportsToolUse": true,
            "supportsStreaming": true
          },
          "maxTokens": 8192,
          "contextWindow": 128000
        }
      ]
    }
  }
}
```

### 2. 获取 API Key

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入 [API Keys 管理页面](https://bigmodel.cn/usercenter/proj-mgmt/apikeys)
4. 创建新的 API Key
5. 将 API Key 替换到配置中的 `YOUR_ZHIPU_API_KEY`

### 3. 使用图片识别

配置完成后：

1. 在 VS Code 中打开 Copilot Chat
2. 选择 "GLM-4.6V (Vision)" 模型
3. 粘贴图片或使用附件功能上传图片
4. 输入你的问题，模型会识别图片内容并回答

## 高级用法

### 获取物体位置信息

GLM-4.6V 可以识别图片中的物体，并提供位置描述。在提示词中这样问：

```
请分析这张图片，列出所有识别到的物体及其大致位置。
```

如果需要更结构化的输出：

```
请识别图片中的所有物体，并以 JSON 格式返回：
{
  "objects": [
    {
      "name": "物体名称",
      "location": "位置描述（如：左上角、中央、右下角）",
      "description": "详细描述"
    }
  ]
}
```

### 多图片对话

GLM-4.6V 支持在一次对话中发送多张图片：

1. 依次粘贴多张图片
2. 输入问题："比较这两张图片的差异"

## 多配置示例

你可以同时配置多个模型，根据需要切换：

```json
{
  "github.copilot.advanced": {
    "byok": {
      "models": [
        {
          "id": "glm-4.7",
          "name": "GLM-4.7 (Text Only)",
          "provider": "openai-compatible",
          "endpoint": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          "apiKey": "YOUR_ZHIPU_API_KEY",
          "capabilities": {
            "supportsVision": false,
            "supportsToolUse": true
          },
          "maxTokens": 8192,
          "contextWindow": 128000
        },
        {
          "id": "glm-4.6v",
          "name": "GLM-4.6V (Vision)",
          "provider": "openai-compatible",
          "endpoint": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          "apiKey": "YOUR_ZHIPU_API_KEY",
          "capabilities": {
            "supportsVision": true,
            "supportsToolUse": true
          },
          "maxTokens": 8192,
          "contextWindow": 128000
        },
        {
          "id": "glm-4.6v-flash",
          "name": "GLM-4.6V Flash (Free, Vision)",
          "provider": "openai-compatible",
          "endpoint": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
          "apiKey": "YOUR_ZHIPU_API_KEY",
          "capabilities": {
            "supportsVision": true,
            "supportsToolUse": false
          },
          "maxTokens": 4096,
          "contextWindow": 128000
        }
      ]
    }
  }
}
```

## 注意事项

1. **图片大小限制**：建议图片大小不超过 10MB，过大的图片可能导致请求失败
2. **图片格式**：支持 PNG、JPEG、GIF、WEBP、BMP 格式
3. **费用**：GLM-4.6V 为付费模型，GLM-4.6V-Flash 为免费模型（有限额）
4. **错误处理**：如果使用文本模型（如 GLM-4.7）发送图片，插件会自动添加文本提示，不会报错

## 故障排查

### 图片无法识别

1. 确认使用的是视觉模型（如 `glm-4.6v`）而不是文本模型（如 `glm-4.7`）
2. 检查 `"supportsVision": true` 是否已设置
3. 查看开发者工具控制台（Help -> Toggle Developer Tools）中的错误日志

### 400 错误

- 检查 API Key 是否正确
- 确认账户余额充足
- 检查图片是否过大（建议 < 10MB）

## 相关文档

- [智谱 AI 开放平台](https://open.bigmodel.cn/)
- [GLM-4.6V 模型文档](https://docs.bigmodel.cn/cn/guide/models/vlm/glm-4.6v)
- [API 调用示例](https://docs.bigmodel.cn/api-reference/%E6%A8%A1%E5%9E%8B-api/%E5%AF%B9%E8%AF%9D%E8%A1%A5%E5%85%A8)
