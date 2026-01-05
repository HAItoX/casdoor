// 微前端主配置文件
import { registerMicroApps, start } from "qiankun";
import { loadSubAppConfig } from "./utils";
import { getAccountInfo } from "./auth";

// 生成带时间戳的日志前缀
const getLogPrefix = (module) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [MicroFrontend] [${module}]`;
};

// 子应用配置列表
const subApps = [
  // 这里将动态加载子应用配置
];

// 注册子应用（已禁用，改用手动加载）
export const registerSubApps = async () => {
  const logPrefix = getLogPrefix("config.registerSubApps");
  console.debug(`${logPrefix} 子应用注册已禁用，使用手动加载模式`);

  // 不再注册子应用，避免qiankun自动监听路由
  // 子应用将在SubAppContainer组件中通过loadMicroApp手动加载

  return [];
};

// 启动微前端框架
export const startMicroFrontend = () => {
  const logPrefix = getLogPrefix("config.startMicroFrontend");
  console.debug(`${logPrefix} 开始启动微前端框架...`);

  const qiankunConfig = {
    sandbox: {
      strictStyleIsolation: true, // 严格的样式隔离
      experimentalStyleIsolation: true, // 实验性样式隔离
    },
    prefetch: false, // 关闭预加载，避免过早加载子应用
    singular: true, // 单例模式，同一时间只加载一个子应用
    autoStart: false, // 禁用自动启动，手动控制子应用加载时机
  };

  console.debug(`${logPrefix} qiankun 启动配置:`, {
    sandbox: {
      strictStyleIsolation: qiankunConfig.sandbox.strictStyleIsolation,
      experimentalStyleIsolation:
        qiankunConfig.sandbox.experimentalStyleIsolation,
    },
    prefetch: qiankunConfig.prefetch,
    singular: qiankunConfig.singular,
    autoStart: qiankunConfig.autoStart,
  });

  start(qiankunConfig);
  console.debug(`${logPrefix} 微前端框架启动完成`);
};

// 获取子应用的全局 props
export const getGlobalProps = async () => {
  const logPrefix = getLogPrefix("config.getGlobalProps");
  console.debug(`${logPrefix} 获取全局属性...`);

  const accountInfo = await getAccountInfo();

  const globalProps = {
    account: accountInfo.account,
    accessToken: accountInfo.accessToken,
    themeData: accountInfo.themeData,
    serverUrl: accountInfo.serverUrl,

    // SSO配置（基于Token）
    ssoConfig: {
      enabled: true,
      provider: "casdoor",
      serverUrl: accountInfo.serverUrl,

      // Casdoor API端点
      apiEndpoints: {
        userInfo: `${accountInfo.serverUrl}/api/userinfo`,
        getAccount: `${accountInfo.serverUrl}/api/get-account`,
        token: `${accountInfo.serverUrl}/api/login`,
        refresh: `${accountInfo.serverUrl}/api/login/oauth/refresh_token`,
      },

      // Token配置
      tokenConfig: {
        accessToken: accountInfo.accessToken,
        tokenType: "Bearer",
        expiresIn: 86400, // 24小时
      },

      // 跨域配置
      corsConfig: {
        enabled: true,
        credentials: "include",
      },
    },

    // 提供给子应用的方法
    onLoginSuccess: accountInfo.onLoginSuccess,
    onUpdateAccount: accountInfo.onUpdateAccount,

    // SSO登录方法（子应用可以调用）
    ssoLogin: async () => {
      return await performSSOLogin(accountInfo);
    },

    // 刷新Token方法
    refreshToken: async () => {
      return await refreshAccessToken(accountInfo);
    },

    // 验证Token方法
    validateToken: async (token) => {
      return await validateAccessToken(token, accountInfo.serverUrl);
    },
  };

  console.debug(`${logPrefix} 全局属性详情:`, {
    hasAccount: !!globalProps.account,
    hasAccessToken: !!globalProps.accessToken,
    hasSSOConfig: !!globalProps.ssoConfig,
    ssoEnabled: globalProps.ssoConfig?.enabled,
    hasSSOLogin: typeof globalProps.ssoLogin === "function",
    hasRefreshToken: typeof globalProps.refreshToken === "function",
    hasValidateToken: typeof globalProps.validateToken === "function",
  });

  return globalProps;
};

// 执行SSO登录
async function performSSOLogin(accountInfo) {
  const logPrefix = getLogPrefix("config.performSSOLogin");

  try {
    if (!accountInfo.accessToken) {
      throw new Error("Access Token不存在");
    }

    console.debug(`${logPrefix} 开始验证Token...`, {
      hasToken: !!accountInfo.accessToken,
      tokenLength: accountInfo.accessToken?.length,
    });

    // 验证当前token是否有效
    const response = await fetch(`${accountInfo.serverUrl}/api/userinfo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accountInfo.accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token验证失败: ${response.status} ${errorText}`);
    }

    const userInfo = await response.json();

    if (!userInfo || !userInfo.sub) {
      throw new Error("用户信息无效");
    }

    console.debug(`${logPrefix} SSO登录成功:`, {
      userId: userInfo.sub,
      userName: userInfo.preferred_username || userInfo.name,
      email: userInfo.email,
      hasAccessToken: !!accountInfo.accessToken,
    });

    return {
      success: true,
      userInfo,
      accessToken: accountInfo.accessToken,
      tokenType: "Bearer",
    };
  } catch (error) {
    console.error(`${logPrefix} SSO登录失败:`, {
      message: error.message,
      stack: error.stack,
    });
    return {
      success: false,
      error: error.message,
    };
  }
}

// 刷新Access Token
async function refreshAccessToken(accountInfo) {
  const logPrefix = getLogPrefix("config.refreshAccessToken");

  try {
    const refreshToken = localStorage.getItem("casdoor_refresh_token");

    if (!refreshToken) {
      throw new Error("Refresh token不存在");
    }

    const clientId = localStorage.getItem("casdoor_client_id");
    const clientSecret = localStorage.getItem("casdoor_client_secret");

    if (!clientId) {
      throw new Error("Client ID不存在");
    }

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret || "",
    });

    const response = await fetch(
      `${accountInfo.serverUrl}/api/login/oauth/refresh_token?${params}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`刷新Token失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      throw new Error("刷新Token响应中没有access_token");
    }

    localStorage.setItem("casdoor_access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("casdoor_refresh_token", data.refresh_token);
    }

    console.debug(`${logPrefix} Token刷新成功:`, {
      hasAccessToken: !!data.access_token,
      hasRefreshToken: !!data.refresh_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    });

    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error(`${logPrefix} Token刷新失败:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// 验证Access Token
async function validateAccessToken(token, serverUrl) {
  const logPrefix = getLogPrefix("config.validateAccessToken");

  try {
    if (!token) {
      throw new Error("Token为空");
    }

    console.debug(`${logPrefix} 开始验证Token...`, {
      hasToken: !!token,
      tokenLength: token?.length,
    });

    const response = await fetch(`${serverUrl}/api/userinfo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`${logPrefix} Token验证失败:`, {
        status: response.status,
        errorText,
      });
      return {
        valid: false,
        error: `Token验证失败: ${response.status}`,
      };
    }

    const userInfo = await response.json();

    if (!userInfo || !userInfo.sub) {
      console.warn(`${logPrefix} Token验证成功但用户信息无效`);
      return {
        valid: false,
        error: "用户信息无效",
      };
    }

    console.debug(`${logPrefix} Token验证成功:`, {
      userId: userInfo.sub,
      userName: userInfo.preferred_username || userInfo.name,
    });

    return {
      valid: true,
      userInfo,
    };
  } catch (error) {
    console.error(`${logPrefix} Token验证时发生错误:`, {
      message: error.message,
      stack: error.stack,
    });
    return {
      valid: false,
      error: error.message,
    };
  }
}
