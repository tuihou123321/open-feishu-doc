// 导入飞书API类
importScripts('feishu-api.js');

chrome.runtime.onInstalled.addListener(() => {
  console.log('飞书文档创建器插件已安装');
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