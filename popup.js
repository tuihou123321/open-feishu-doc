document.addEventListener('DOMContentLoaded', function() {
  const createBtn = document.getElementById('createBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const statusDiv = document.getElementById('status');

  // 检查配置状态
  checkConfig();

  // 创建文档按钮事件
  createBtn.addEventListener('click', function() {
    createDocument();
  });

  // 设置按钮事件
  settingsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  async function checkConfig() {
    try {
      const result = await chrome.storage.sync.get(['feishu_config']);
      const config = result.feishu_config || {};
      
      if (!config.appId || !config.appSecret) {
        createBtn.disabled = true;
        createBtn.textContent = '请先配置';
        showStatus('请先在设置中配置App ID和App Secret', 'error');
      } else {
        createBtn.disabled = false;
        createBtn.textContent = '创建新文档';
      }
    } catch (error) {
      showStatus('检查配置失败: ' + error.message, 'error');
    }
  }

  async function createDocument() {
    try {
      const result = await chrome.storage.sync.get(['feishu_config']);
      const config = result.feishu_config || {};
      
      if (!config.appId || !config.appSecret) {
        showStatus('请先配置App ID和App Secret', 'error');
        return;
      }

      // 禁用按钮并显示加载状态
      createBtn.disabled = true;
      createBtn.textContent = '创建中...';
      showStatus('正在创建文档...', 'loading');

      // 生成文档标题
      const now = new Date();
      const title = `新建文档_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

      // 发送创建文档请求
      const response = await chrome.runtime.sendMessage({
        action: 'createDocument',
        data: {
          appId: config.appId,
          appSecret: config.appSecret,
          adminMobile: config.adminMobile,
          title: title
        }
      });

      console.log('创建文档响应:', response);

      if (response && response.success) {
        showStatus('文档创建成功！正在打开...', 'success');
        
        // 检查URL是否存在
        if (response.url) {
          await chrome.tabs.create({ url: response.url });
          window.close();
        } else {
          showStatus('文档创建成功，但未返回URL', 'error');
          console.error('响应中缺少URL:');
          console.log('完整响应对象:', JSON.stringify(response, null, 2));
        }
      } else {
        const errorMsg = response ? response.message : '未收到响应';
        showStatus(`创建失败: ${errorMsg}`, 'error');
        console.error('创建文档失败:', response);
      }
    } catch (error) {
      showStatus('创建文档失败: ' + error.message, 'error');
    } finally {
      // 恢复按钮状态
      createBtn.disabled = false;
      createBtn.textContent = '创建新文档';
    }
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // 自动隐藏状态消息
    if (type === 'success' || type === 'loading') {
      setTimeout(() => {
        if (type !== 'loading' || !createBtn.disabled) {
          statusDiv.style.display = 'none';
        }
      }, 3000);
    }
  }
});