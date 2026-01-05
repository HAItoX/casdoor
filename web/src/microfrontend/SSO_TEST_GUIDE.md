# SSO登录流程测试指南

## 测试环境准备

### 1. 主应用配置
- Casdoor服务器地址: `http://localhost:8000`
- 主应用地址: `http://localhost:5555`
- 子应用地址: `http://localhost:5002`

### 2. 必需的配置文件
- `/Users/dger/Documents/HitoX/casdoor/web/src/microfrontend/config.js` - SSO配置
- `/Users/dger/Documents/HitoX/casdoor/web/src/microfrontend/auth.js` - 认证工具函数
- `/Users/dger/Documents/HitoX/casdoor/web/src/microfrontend/subAppsConfig.json` - 子应用配置
- `/Users/dger/Documents/HitoX/casdoor/web/src/App.js` - 主应用入口

## 测试步骤

### 测试1: 主应用登录并验证SSO配置

**步骤:**
1. 清除浏览器所有cookies和localStorage
2. 访问 `http://localhost:5555/login`
3. 使用Casdoor账号登录
4. 打开浏览器开发者工具，查看Console日志

**预期结果:**
- Console中显示 `[MicroFrontend] [auth.getAccountInfo] 成功获取账户信息`
- localStorage中包含以下键值:
  - `casdoor_account`: 用户信息JSON
  - `casdoor_access_token`: 访问令牌
  - `casdoor_refresh_token`: 刷新令牌
  - `casdoor_client_id`: OAuth客户端ID
  - `casdoor_client_secret`: OAuth客户端密钥

**验证命令:**
```javascript
// 在浏览器Console中执行
console.log("Account:", JSON.parse(localStorage.getItem("casdoor_account")));
console.log("Access Token:", localStorage.getItem("casdoor_access_token"));
console.log("Refresh Token:", localStorage.getItem("casdoor_refresh_token"));
console.log("Client ID:", localStorage.getItem("casdoor_client_id"));
```

### 测试2: 访问子应用并验证SSO登录

**步骤:**
1. 确保已在主应用登录
2. 访问 `http://localhost:5555/subapp/hitoColib`
3. 打开浏览器开发者工具，查看Console日志

**预期结果:**
- Console中显示 `[MicroFrontend] [SubAppContainer] 开始手动加载子应用`
- Console中显示 `[MicroFrontend] [config.getGlobalProps] 全局属性详情`，包含:
  - `hasAccount: true`
  - `hasAccessToken: true`
  - `hasSSOConfig: true`
  - `ssoEnabled: true`
  - `hasSSOLogin: true`
  - `hasRefreshToken: true`
  - `hasValidateToken: true`

**验证命令:**
```javascript
// 在子应用Console中执行
console.log("Props:", window.__POWERED_BY_QIANKUN__ ? window.qiankunProps : "Not in subapp");
```

### 测试3: Token验证功能

**步骤:**
1. 在主应用登录后，打开浏览器开发者工具
2. 在Console中执行以下代码:

```javascript
// 获取当前access token
const accessToken = localStorage.getItem("casdoor_access_token");
const serverUrl = "http://localhost:8000";

// 验证token
fetch(`${serverUrl}/api/userinfo`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  credentials: "include",
})
  .then(res => res.json())
  .then(data => {
    console.log("Token验证结果:", data);
    console.log("用户ID:", data.sub);
    console.log("用户名:", data.preferred_username || data.name);
  })
  .catch(error => {
    console.error("Token验证失败:", error);
  });
```

**预期结果:**
- 返回用户信息JSON对象
- 包含 `sub` (用户ID)、`preferred_username`、`email` 等字段

### 测试4: Token刷新功能

**步骤:**
1. 在主应用登录后，打开浏览器开发者工具
2. 在Console中执行以下代码:

```javascript
// 获取refresh token和client信息
const refreshToken = localStorage.getItem("casdoor_refresh_token");
const clientId = localStorage.getItem("casdoor_client_id");
const clientSecret = localStorage.getItem("casdoor_client_secret");
const serverUrl = "http://localhost:8000";

// 刷新token
const params = new URLSearchParams({
  grant_type: "refresh_token",
  refresh_token: refreshToken,
  client_id: clientId,
  client_secret: clientSecret || "",
});

fetch(`${serverUrl}/api/login/oauth/refresh_token?${params}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
})
  .then(res => res.json())
  .then(data => {
    console.log("Token刷新结果:", data);
    console.log("New Access Token:", data.access_token);
    console.log("New Refresh Token:", data.refresh_token);
    console.log("Token Type:", data.token_type);
    console.log("Expires In:", data.expires_in);
    
    // 更新localStorage
    if (data.access_token) {
      localStorage.setItem("casdoor_access_token", data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem("casdoor_refresh_token", data.refresh_token);
    }
  })
  .catch(error => {
    console.error("Token刷新失败:", error);
  });
```

**预期结果:**
- 返回新的access token和refresh token
- 新的access token被保存到localStorage

### 测试5: 子应用接收SSO配置

**步骤:**
1. 访问子应用 `http://localhost:5555/subapp/hitoColib`
2. 在子应用的Console中执行:

```javascript
// 检查子应用是否接收到SSO配置
if (window.__POWERED_BY_QIANKUN__) {
  console.log("子应用已加载");
  
  // 检查props
  const props = window.qiankunProps || {};
  console.log("SSO配置:", props.ssoConfig);
  console.log("用户信息:", props.account);
  console.log("Access Token:", props.accessToken);
  console.log("SSO登录方法:", typeof props.ssoLogin);
  console.log("刷新Token方法:", typeof props.refreshToken);
  console.log("验证Token方法:", typeof props.validateToken);
}
```

**预期结果:**
- 显示完整的SSO配置对象
- 包含用户信息和access token
- 所有方法都显示为 `function`

### 测试6: 子应用调用SSO登录

**步骤:**
1. 在子应用Console中执行:

```javascript
// 调用SSO登录方法
if (window.qiankunProps && window.qiankunProps.ssoLogin) {
  window.qiankunProps.ssoLogin()
    .then(result => {
      console.log("SSO登录结果:", result);
      if (result.success) {
        console.log("用户信息:", result.userInfo);
        console.log("Access Token:", result.accessToken);
      } else {
        console.error("登录失败:", result.error);
      }
    })
    .catch(error => {
      console.error("SSO登录异常:", error);
    });
}
```

**预期结果:**
- 返回 `success: true`
- 包含用户信息和access token

### 测试7: 完整登录流程测试

**步骤:**
1. 清除浏览器所有cookies和localStorage
2. 访问 `http://localhost:5555/subapp/hitoColib`
3. 观察是否自动跳转到登录页
4. 在登录页完成登录
5. 观察是否自动跳转回子应用
6. 检查子应用是否正常加载

**预期结果:**
- 未登录时自动跳转到登录页
- 登录后自动跳转回子应用
- 子应用正常加载并显示内容

### 测试8: Token过期自动刷新

**步骤:**
1. 在主应用登录
2. 手动修改localStorage中的access token为无效值:

```javascript
localStorage.setItem("casdoor_access_token", "invalid_token");
```

3. 访问子应用
4. 观察Console日志

**预期结果:**
- 检测到token无效
- 自动尝试刷新token
- 使用新的token继续操作

### 测试9: 跨域测试

**步骤:**
1. 确保主应用和子应用在不同域名或端口
2. 在主应用登录
3. 访问子应用
4. 检查Network标签，查看API请求

**预期结果:**
- 所有API请求都包含 `credentials: include`
- 请求头中包含 `Authorization: Bearer <token>`
- 没有CORS错误

### 测试10: 登出功能测试

**步骤:**
1. 在主应用登录
2. 访问子应用
3. 在主应用点击登出
4. 检查子应用是否也被登出

**预期结果:**
- 主应用登出后，子应用也被登出
- localStorage中的所有认证信息被清除
- 跳转到登录页

## 常见问题排查

### 问题1: Token验证失败
**症状:** `Token验证失败: 401 Unauthorized`

**排查步骤:**
1. 检查access token是否存在: `localStorage.getItem("casdoor_access_token")`
2. 检查token是否过期
3. 尝试刷新token
4. 检查Casdoor服务器是否正常运行

### 问题2: Token刷新失败
**症状:** `刷新Token失败: 400 Bad Request`

**排查步骤:**
1. 检查refresh token是否存在: `localStorage.getItem("casdoor_refresh_token")`
2. 检查client ID是否存在: `localStorage.getItem("casdoor_client_id")`
3. 检查API端点是否正确: `/api/login/oauth/refresh_token`
4. 检查请求参数格式是否正确

### 问题3: 子应用未接收到SSO配置
**症状:** 子应用Console中 `hasSSOConfig: false`

**排查步骤:**
1. 检查主应用是否已登录
2. 检查config.js中的getGlobalProps函数是否正确返回
3. 检查SubAppContainer.js是否正确传递props
4. 检查子应用是否正确实现生命周期函数

### 问题4: CORS错误
**症状:** `Access to fetch at '...' has been blocked by CORS policy`

**排查步骤:**
1. 检查Casdoor服务器的CORS配置
2. 检查请求是否包含 `credentials: include`
3. 检查请求头是否正确
4. 确保主应用和子应用的域名在允许列表中

## 性能测试

### 测试Token刷新性能
```javascript
// 测试token刷新耗时
console.time("Token刷新");
const result = await window.qiankunProps.refreshToken();
console.timeEnd("Token刷新");
console.log("刷新结果:", result);
```

### 测试并发请求
```javascript
// 测试多个子应用同时加载
const apps = ["hitoColib", "react", "vue"];
const promises = apps.map(app => fetch(`/subapp/${app}`));
await Promise.all(promises);
console.log("所有子应用加载完成");
```

## 安全测试

### 测试1: Token泄露防护
- 检查token是否只存储在localStorage中
- 检查token是否在URL中暴露
- 检查token是否在日志中打印

### 测试2: XSS防护
- 尝试在用户名中注入恶意脚本
- 检查是否正确转义输出

### 测试3: CSRF防护
- 检查API请求是否包含CSRF token
- 检查是否验证请求来源

## 总结

完成以上所有测试后，SSO登录流程应该完全可用。如果遇到问题，请参考常见问题排查部分，或者查看Console日志获取更详细的错误信息。
