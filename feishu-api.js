class FeishuAPI {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.baseUrl = 'https://open.feishu.cn/open-apis';
    this.accessToken = null;
    this.tokenExpiry = null;
    this.defaultAdminOpenId = 'ou_49f1acb233b076bb716da1e924e945d2';
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
        // Allow the owner to manually share externally later, but keep link sharing off by default.
        external_access: true,
        invite_external: true,
        link_share_entity: "closed",
        share_entity: "only_full_access",
        security_entity: "anyone_can_view",
        comment_entity: "anyone_can_view"
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
    return user.open_id || user.user_id || user.union_id || null;
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

  async transferDocumentOwner(documentId, userId) {
    if (!userId) return null;

    const token = await this.getAccessToken();
    const params = new URLSearchParams({
      type: 'docx',
      need_notification: 'false',
      remove_old_owner: 'false',
      stay_put: 'false',
      old_owner_perm: 'full_access'
    });

    const response = await fetch(`${this.baseUrl}/drive/v1/permissions/${documentId}/members/transfer_owner?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        member_type: 'openid',
        member_id: userId
      })
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`转移文档所有者失败: ${data.msg || data.message}`);
    }

    return data.data || {};
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
    const warnings = [];
    let ownerTransferred = false;
    let adminGranted = false;
    let shareEnabled = false;

    try {
      // 1. 创建文档（核心功能）
      const docResult = await this.createDocument(title);
      
      // 2. 尝试把佐老板设为所有者。失败时降级为 full_access 管理员。
      let userId = this.defaultAdminOpenId;
      if (adminMobile) {
        try {
          userId = await this.findUserByMobile(adminMobile) || this.defaultAdminOpenId;
        } catch (error) {
          console.warn('通过手机号查找管理员失败，使用默认管理员:', error.message);
          warnings.push(error.message);
        }
      }

      if (userId) {
        try {
          await this.transferDocumentOwner(docResult.documentId, userId);
          ownerTransferred = true;
        } catch (error) {
          console.warn('转移所有者失败，尝试添加为管理员:', error.message);
          warnings.push(error.message);

          try {
            await this.addDocumentManager(docResult.documentId, userId);
            adminGranted = true;
          } catch (fallbackError) {
            console.warn('添加管理员失败，但文档已创建:', fallbackError.message);
            warnings.push(fallbackError.message);
          }
        }
      }

      // 3. 尝试开启分享权限（可选功能，失败不影响文档创建）
      try {
        await this.setDocumentPermission(docResult.documentId);
        shareEnabled = true;
      } catch (error) {
        console.warn('设置分享权限失败，但文档已创建:', error.message);
        warnings.push(error.message);
      }
      
      return {
        success: true,
        documentId: docResult.documentId,
        url: docResult.url,
        ownerTransferred,
        adminGranted,
        shareEnabled,
        warnings,
        message: ownerTransferred
          ? '文档创建成功，已转移所有者；默认不公开，可手动开启对外分享！'
          : '文档创建成功，已尽量设置管理员；默认不公开，可手动开启对外分享！'
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
