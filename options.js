document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('configForm');
  const testBtn = document.getElementById('testBtn');
  const statusDiv = document.getElementById('status');
  
  const appIdInput = document.getElementById('appId');
  const appSecretInput = document.getElementById('appSecret');
  const adminMobileInput = document.getElementById('adminMobile');

  // 加载已保存的配置
  loadConfig();

  // 保存配置
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    saveConfig();
  });

  // 测试连接
  testBtn.addEventListener('click', function() {
    testConnection();
  });

  async function loadConfig() {
    try {
      const result = await chrome.storage.sync.get(['feishu_config']);
      const config = result.feishu_config || {};
      
      appIdInput.value = config.appId || '';
      appSecretInput.value = config.appSecret || '';
      adminMobileInput.value = config.adminMobile || '';
    } catch (error) {
      showStatus('加载配置失败: ' + error.message, 'error');
    }
  }

  async function saveConfig() {
    const config = {
      appId: appIdInput.value.trim(),
      appSecret: appSecretInput.value.trim(),
      adminMobile: adminMobileInput.value.trim()
    };

    if (!config.appId || !config.appSecret) {
      showStatus('App ID和App Secret不能为空', 'error');
      return;
    }

    try {
      await chrome.storage.sync.set({ feishu_config: config });
      showStatus('配置保存成功！', 'success');
    } catch (error) {
      showStatus('保存配置失败: ' + error.message, 'error');
    }
  }

  async function testConnection() {
    const appId = appIdInput.value.trim();
    const appSecret = appSecretInput.value.trim();

    if (!appId || !appSecret) {
      showStatus('请先填写App ID和App Secret', 'error');
      return;
    }

    showStatus('正在测试连接...', 'loading');
    testBtn.disabled = true;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testConnection',
        data: { appId, appSecret }
      });

      if (response.success) {
        showStatus(response.message, 'success');
      } else {
        showStatus(response.message, 'error');
      }
    } catch (error) {
      showStatus('测试连接失败: ' + error.message, 'error');
    } finally {
      testBtn.disabled = false;
    }
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // 5秒后自动隐藏成功消息
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 5000);
    }
  }
});