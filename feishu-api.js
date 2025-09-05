class FeishuAPI {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.baseUrl = 'https://open.feishu.cn/open-apis';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`${this.baseUrl}/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret
      })
    });

    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`获取访问令牌失败: ${data.msg}`);
    }

    this.accessToken = data.tenant_access_token;
    this.tokenExpiry = Date.now() + (data.expire - 300) * 1000; // 提前5分钟过期
    
    return this.accessToken;
  }

  async createDocument(title = '新建文档') {
    console.log('获取访问令牌...');
    const token = await this.getAccessToken();
    console.log('访问令牌获取成功');
    
    const requestBody = { title: title };
    console.log('发送创建文档请求:', requestBody);
    
    const response = await fetch(`${this.baseUrl}/docx/v1/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('创建文档API响应:', data);
    
    if (data.code !== 0) {
      throw new Error(`创建文档失败: ${data.msg || data.message || '未知错误'} (code: ${data.code})`);
    }

    const documentId = data.data.document.document_id;
    const url = `https://feishu.cn/docx/${documentId}`;
    
    const result = {
      documentId: documentId,
      url: url
    };
    
    console.log('解析文档信息:', result);
    return result;
  }

  async setDocumentPermission(documentId) {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}/drive/v1/permissions/${documentId}/public?type=docx`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        external_access: false,
        link_share_entity: "tenant_editable",
        share_entity: "anyone"
      })
    });

    const data = await response.json();
    
    if (data.code !== 0) {
      console.warn(`设置文档权限失败: ${data.msg || data.message}`);
      // 权限设置失败不阻止文档创建，只是记录警告
      return null;
    }

    return data.data;
  }

  async findUserByMobile(mobile) {
    if (!mobile) return null;
    
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}/contact/v3/users/batch_get_id?user_id_type=open_id`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mobiles: [mobile],
        include_resigned: true
      })
    });

    const data = await response.json();
    
    if (data.code !== 0) {
      console.warn(`查找用户失败: ${data.msg}`);
      return null;
    }

    const userList = data.data?.user_list || [];
    if (userList.length === 0) {
      console.warn(`未找到手机号为 ${mobile} 的用户`);
      return null;
    }

    const user = userList[0];
    return user.user_id || user.open_id || user.union_id || null;
  }

  async addDocumentManager(documentId, userId) {
    if (!userId) return null;
    
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}/drive/v1/permissions/${documentId}/members?type=docx`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        member_type: "openid",
        member_id: userId,
        perm: "full_access",
        perm_type: "container",
        type: "user"
      })
    });

    const data = await response.json();
    
    if (data.code !== 0) {
      console.warn(`添加管理员失败: ${data.msg}`);
      return null;
    }

    return data.data;
  }

  async testConnection() {
    try {
      const token = await this.getAccessToken();
      return { success: true, message: '连接成功！' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async createDocumentWithSettings(title, adminMobile = null) {
    try {
      // 1. 创建文档（核心功能）
      const docResult = await this.createDocument(title);
      
      // 2. 尝试设置公开权限（可选功能，失败不影响文档创建）
      try {
        await this.setDocumentPermission(docResult.documentId);
      } catch (error) {
        console.warn('设置权限失败，但文档已创建:', error.message);
      }
      
      // 3. 尝试添加管理员（可选功能，失败不影响文档创建）
      if (adminMobile) {
        try {
          const userId = await this.findUserByMobile(adminMobile);
          if (userId) {
            await this.addDocumentManager(docResult.documentId, userId);
          }
        } catch (error) {
          console.warn('添加管理员失败，但文档已创建:', error.message);
        }
      }
      
      return {
        success: true,
        documentId: docResult.documentId,
        url: docResult.url,
        message: '文档创建成功！'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// 导出给其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeishuAPI;
}