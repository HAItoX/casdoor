// 微前端认证集成
import * as Auth from "../auth/Auth";
import * as Setting from "../Setting";
import * as AuthBackend from "../auth/AuthBackend";
import * as ApplicationBackend from "../backend/ApplicationBackend";
import eventBus from "./eventBus";

// 生成带时间戳的日志前缀
const getLogPrefix = (module) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [MicroFrontend] [${module}]`;
};

// 获取当前用户信息
export const getAccountInfo = async () => {
  const logPrefix = getLogPrefix("auth.getAccountInfo");
  console.debug(`${logPrefix} 开始获取账户信息...`);

  try {
    const res = await AuthBackend.getAccount();

    let account = null;
    let accessToken = null;
    let themeData = null;

    if (res.status === "ok") {
      account = res.data;
      account.organization = res.data2;
      accessToken = res.data.accessToken;

      themeData = Setting.getThemeData(account.organization);

      console.debug(`${logPrefix} 成功获取账户信息:`, {
        username: account.name,
        hasAccessToken: !!accessToken,
        organization: account.organization?.name,
      });
    } else {
      console.warn(`${logPrefix} 获取账户信息失败:`, res.msg);
    }

    const serverUrl = Setting.ServerUrl;

    return {
      account,
      accessToken,
      themeData,
      serverUrl,
      onLoginSuccess: (newAccount, newAccessToken, redirectUrl) => {
        handleLoginSuccess(newAccount, newAccessToken, redirectUrl);
      },
      onUpdateAccount: (newAccount, newAccessToken) => {
        setAccountInfo(newAccount, newAccessToken, themeData);
        notifySubApps("accountUpdated", {
          account: newAccount,
          accessToken: newAccessToken,
        });
      },
    };
  } catch (error) {
    console.error(`${logPrefix} 获取账户信息时发生错误:`, error);

    return {
      account: null,
      accessToken: null,
      themeData: null,
      serverUrl: Setting.ServerUrl,
      onLoginSuccess: (newAccount, newAccessToken, redirectUrl) => {
        handleLoginSuccess(newAccount, newAccessToken, redirectUrl);
      },
      onUpdateAccount: (newAccount, newAccessToken) => {
        setAccountInfo(newAccount, newAccessToken, null);
        notifySubApps("accountUpdated", {
          account: newAccount,
          accessToken: newAccessToken,
        });
      },
    };
  }
};

// 设置用户信息
export const setAccountInfo = (account, accessToken, themeData) => {
  if (account) {
    localStorage.setItem("casdoor_account", JSON.stringify(account));
  } else {
    localStorage.removeItem("casdoor_account");
  }

  if (accessToken) {
    localStorage.setItem("casdoor_access_token", accessToken);
  } else {
    localStorage.removeItem("casdoor_access_token");
  }

  if (themeData) {
    localStorage.setItem("casdoor_theme_data", JSON.stringify(themeData));
  } else {
    localStorage.removeItem("casdoor_theme_data");
  }
};

// 设置OAuth客户端信息
export const setOAuthClientInfo = (clientId, clientSecret) => {
  if (clientId) {
    localStorage.setItem("casdoor_client_id", clientId);
  } else {
    localStorage.removeItem("casdoor_client_id");
  }

  if (clientSecret) {
    localStorage.setItem("casdoor_client_secret", clientSecret);
  } else {
    localStorage.removeItem("casdoor_client_secret");
  }
};

// 获取OAuth客户端信息
export const getOAuthClientInfo = () => {
  return {
    clientId: localStorage.getItem("casdoor_client_id"),
    clientSecret: localStorage.getItem("casdoor_client_secret"),
  };
};

// 登录成功处理
export const handleLoginSuccess = (account, accessToken, redirectUrl) => {
  setAccountInfo(account, accessToken);

  // 如果有重定向URL，跳转到该URL
  if (redirectUrl) {
    window.location.href = redirectUrl;
  }

  // 通知所有子应用登录成功
  notifySubApps("loginSuccess", { account, accessToken });
};

// 登出处理
export const handleLogout = () => {
  // 清除本地存储的用户信息
  setAccountInfo(null, null, null);

  // 通知所有子应用登出
  notifySubApps("logout");

  // 重定向到登录页
  window.location.href = "/login";
};

// 通知子应用事件
export const notifySubApps = (eventName, data = {}) => {
  // 通过qiankun的全局状态或事件总线通知子应用
  if (window.__POWERED_BY_QIANKUN__) {
    // 子应用环境下，通过props传递的方法通知主应用
    if (window.parent && window.parent.__QIANKUN_MASTER_EVENT_BUS__) {
      window.parent.__QIANKUN_MASTER_EVENT_BUS__.emit(eventName, data);
    }
  } else {
    // 主应用环境下，通过事件总线通知子应用
    if (window.__QIANKUN_MASTER_EVENT_BUS__) {
      window.__QIANKUN_MASTER_EVENT_BUS__.emit(eventName, data);
    }
  }
};

// 监听子应用事件
export const listenSubAppEvents = (eventName, callback) => {
  if (window.__QIANKUN_MASTER_EVENT_BUS__) {
    window.__QIANKUN_MASTER_EVENT_BUS__.on(eventName, callback);
  }
};

// 移除子应用事件监听
export const removeSubAppEventListener = (eventName, callback) => {
  if (window.__QIANKUN_MASTER_EVENT_BUS__) {
    window.__QIANKUN_MASTER_EVENT_BUS__.off(eventName, callback);
  }
};

// 初始化认证系统
export const initAuth = (config) => {
  Auth.initAuthWithConfig({
    serverUrl: config.serverUrl,
    appName: config.appName || "casdoor",
  });
};
