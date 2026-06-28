// 导入飞书API类
importScripts('feishu-api.js');

chrome.runtime.onInstalled.addListener(() => {
  console.log('飞书文档创建器插件已安装');
});

let shortcutCreating = false;

chrome.commands.onCommand.addListener((command) => {
  if (command === 'create-document') {
    createDocumentFromShortcut();
  }
});

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'createDocument') {
    handleCreateDocument(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true; // 保持消息通道开放
  }
  
  if (request.action === 'testConnection') {
    handleTestConnection(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, message: error.message }));
    return true;
  }
});

async function createDocumentFromShortcut() {
  if (shortcutCreating) {
    console.log('快捷键创建文档正在进行中，忽略重复触发');
    return;
  }

  shortcutCreating = true;
  await setActionBadge('...', '#3370ff');

  try {
    const result = await chrome.storage.sync.get(['feishu_config']);
    const config = result.feishu_config || {};

    if (!config.appId || !config.appSecret) {
      await setActionBadge('CFG', '#fa8c16');
      await chrome.runtime.openOptionsPage();
      return;
    }

    const response = await handleCreateDocument({
      appId: config.appId,
      appSecret: config.appSecret,
      adminMobile: config.adminMobile,
      title: generateDocumentTitle()
    });

    if (response.success && response.url) {
      await chrome.tabs.create({ url: response.url });
      await setActionBadge('OK', '#52c41a');
      await chrome.action.setTitle({ title: response.message || '文档创建成功' });
      return;
    }

    const errorMsg = response.message || '文档创建失败';
    console.error('快捷键创建文档失败:', response);
    await setActionBadge('ERR', '#ff4d4f');
    await chrome.action.setTitle({ title: errorMsg });
  } catch (error) {
    console.error('快捷键创建文档异常:', error);
    await setActionBadge('ERR', '#ff4d4f');
    await chrome.action.setTitle({ title: error.message });
  } finally {
    shortcutCreating = false;
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setTitle({ title: '创建飞书文档' });
    }, 3000);
  }
}

function generateDocumentTitle() {
  const now = new Date();
  return `新建文档_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
}

async function setActionBadge(text, color) {
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
}

async function handleCreateDocument(data) {
  const { appId, appSecret, adminMobile, title } = data;
  
  console.log('收到创建文档请求:', { appId: appId ? '***' : '无', appSecret: appSecret ? '***' : '无', adminMobile, title });
  
  if (!appId || !appSecret) {
    console.error('缺少必要配置');
    return { success: false, message: '请先配置App ID和App Secret' };
  }
  
  try {
    const api = new FeishuAPI(appId, appSecret);
    const documentTitle = title || `新建文档_${new Date().toLocaleString('zh-CN')}`;
    
    console.log('开始创建文档:', documentTitle);
    const result = await api.createDocumentWithSettings(documentTitle, adminMobile);
    console.log('文档创建结果:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('创建文档异常:', error);
    return { success: false, message: error.message };
  }
}

async function handleTestConnection(data) {
  const { appId, appSecret } = data;
  
  if (!appId || !appSecret) {
    return { success: false, message: '请先配置App ID和App Secret' };
  }
  
  const api = new FeishuAPI(appId, appSecret);
  
  return await api.testConnection();
}
