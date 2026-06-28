# 佐老板飞书文档创建器 Chrome 插件

> 一键创建飞书文档的 Chrome 浏览器插件。支持点击插件按钮或按快捷键直接创建新文档，并自动把文档所有者转给佐老板。文档默认不对外公开，需要分享时再由所有者手动开启对外分享。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://developer.chrome.com/docs/extensions/)
[![Feishu API](https://img.shields.io/badge/Feishu-API-green.svg)](https://open.feishu.cn/)

## 功能特性

- 🚀 一键创建并打开飞书文档
- ⌨️ 支持快捷键创建：macOS 默认 `Option+Shift+Y`
- 👑 自动转移文档所有者给佐老板
- 🔒 默认不公开链接，需要时手动开启对外分享
- 👥 所有者转移失败时，自动降级添加管理员权限
- ⚙️ 可配置的应用密钥管理
- 🔐 安全的本地存储配置

## 安装使用

### 1. 获取飞书应用凭证

1. 访问 [飞书开放平台](https://open.feishu.cn/app)
2. 创建新应用或使用现有应用
3. 在应用管理页面获取：
   - **App ID**
   - **App Secret**
4. 在权限管理中添加以下权限：
   - `docx:document:create` - 创建新版文档
   - `docs:permission.setting:write_only` - 允许所有者手动对外分享，默认不公开链接
   - `docs:permission.member:create` - 添加文档管理员
   - `docs:permission.member:transfer` - 转移文档所有者
   - `contact:user.base:readonly` / `contact:user:search` - 通过手机号查找用户

### 2. 安装插件

1. 下载本项目代码
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹

### 3. 配置插件

1. 点击插件图标，选择"设置"
2. 填入从飞书开放平台获取的 App ID 和 App Secret
3. （可选）填入管理员手机号；不填时默认把文档所有者转给佐老板
4. 点击"测试连接"验证配置
5. 保存配置

### 4. 使用插件

方式一：点击插件创建

1. 点击浏览器工具栏里的插件图标
2. 点击"创建新文档"
3. 插件会自动创建文档并在新标签页中打开

方式二：快捷键创建

按下快捷键后，插件会直接创建并打开文档，不需要再打开 popup。

- macOS：`Option+Shift+Y`
- Windows / Linux：`Alt+Shift+Y`
- 如需修改快捷键，打开 `chrome://extensions/shortcuts`，找到"佐老板飞书文档创建器"后重新设置。
- 快捷键默认只在 Chrome 获得焦点时生效；如果插件图标显示 `KEY`，说明快捷键未绑定或冲突，需要到快捷键页面手动设置。

## 权限行为

新建文档后的默认行为：

- 文档所有者：自动转给佐老板
- 链接公开状态：默认关闭，不允许拿到链接的人直接访问
- 对外分享能力：保留，佐老板可以在文档右上角手动开启
- 分享管理权限：仅可管理权限的人可以添加、移除协作者

这意味着：日常创建的文档更安全，不会自动暴露；当需要发给客户或外部伙伴时，再手动点击飞书文档里的分享按钮开启。

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
- ✅ 允许所有者手动开启对外分享，默认不公开链接
- ✅ 通过手机号查找用户
- ✅ 自动转移文档所有者，失败时添加文档管理员
- ✅ 自动打开创建的文档
- ✅ 支持 Chrome Commands 快捷键触发

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
5. **重新加载**：修改本地代码后，需要在 `chrome://extensions/` 里重新加载插件才会生效

## 隐私与安全

- App ID / App Secret 仅保存在 Chrome 的扩展存储中
- 仓库不包含任何真实 App Secret
- 新建文档默认不公开链接
- 外部分享需要所有者在飞书文档中手动开启

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

### v1.1.1
- ⌨️ macOS 默认快捷键改为 `Option+Shift+Y`，减少和系统 / Chrome 快捷键冲突
- 🧭 新增快捷键绑定检测：未绑定时插件图标显示 `KEY`
- 📝 补充快捷键只在 Chrome 聚焦时生效的说明

### v1.1.0
- ✨ 新增快捷键创建文档
- 👑 创建后自动转移文档所有者给佐老板
- 🔒 文档默认不对外公开，保留手动开启对外分享能力
- 📝 更新飞书权限清单和使用说明

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
