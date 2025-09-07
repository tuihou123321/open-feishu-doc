# 飞书文档创建器 Chrome 插件

> 一键创建飞书文档的 Chrome 浏览器插件，基于飞书开放平台 API 开发。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://developer.chrome.com/docs/extensions/)
[![Feishu API](https://img.shields.io/badge/Feishu-API-green.svg)](https://open.feishu.cn/)

## 功能特性

- 🚀 一键创建飞书文档
- ⚙️ 可配置的应用密钥管理
- 🔐 安全的本地存储配置
- 👥 自动设置文档权限
- 📱 支持添加管理员

## 安装使用

### 1. 获取飞书应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建新应用或使用现有应用
3. 在应用管理页面获取：
   - **App ID**
   - **App Secret**
4. 在权限管理中添加以下权限：
   - `docs:doc:write` - 创建文档
   - `drive:drive:write` - 设置权限
   - `contact:contact:read` - 查找用户

### 2. 安装插件

1. 下载本项目代码
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

### 3. 配置插件

1. 点击插件图标，选择"设置"
2. 填入从飞书开放平台获取的 App ID 和 App Secret
3. （可选）填入管理员手机号，创建文档时自动添加为管理员
4. 点击"测试连接"验证配置
5. 保存配置

### 4. 使用插件

1. 点击插件图标
2. 点击"创建新文档"按钮
3. 插件会自动创建文档并在新标签页中打开

## 文件结构

```
open_feishu/
├── manifest.json          # 插件清单文件
├── popup.html             # 弹出窗口界面
├── popup.js              # 弹出窗口逻辑
├── options.html          # 设置页面界面
├── options.js            # 设置页面逻辑
├── background.js         # 后台服务脚本
├── feishu-api.js         # 飞书API封装类
├── icons/                # 插件图标文件夹
└── README.md             # 说明文档
```

## API 功能

- ✅ 获取访问令牌 (tenant_access_token)
- ✅ 创建飞书文档
- ✅ 设置文档公开权限
- ✅ 通过手机号查找用户
- ✅ 添加文档管理员
- ✅ 自动打开创建的文档

## 技术特性

- 使用 Chrome Extension Manifest V3
- 支持配置信息的安全本地存储
- 自动管理访问令牌刷新
- 友好的用户界面和错误提示
- 完整的错误处理机制

## 注意事项

1. **权限配置**：请确保飞书应用已获得所需的API权限
2. **网络访问**：插件需要访问飞书开放平台API，请确保网络连接正常
3. **数据安全**：应用密钥仅存储在本地浏览器中，不会上传到任何服务器
4. **使用限制**：请遵守飞书开放平台的API调用限制

## 开发说明

### 技术栈
- **Chrome Extension Manifest V3** - 现代Chrome插件标准
- **飞书开放平台API v2** - 官方API集成
- **原生JavaScript** - 无第三方依赖，轻量高效

### 参考项目
基于 [feishu-doc-creator](https://github.com/ChrisZou/feishu-doc-creator) 项目改造，将Go命令行工具转换为Chrome插件实现。

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 作者信息

**作者**: 佐老板  
**微信**: xiaozuo-2013

## 问题反馈

如遇到问题，请提交 [Issue](../../issues) 或者通过以下方式联系：
- 描述具体的错误信息
- 提供插件版本信息
- 附上控制台错误日志（如有）

## 更新日志

### v1.0.0 (2024-09-05)
- ✨ 初始版本发布
- 🚀 一键创建飞书文档功能
- ⚙️ 配置管理界面
- 🔐 安全的密钥存储
- 👥 自动权限设置

## 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

**📝 Generated with [Claude Code](https://claude.ai/code)**