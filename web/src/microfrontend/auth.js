// 微前端认证集成
import * as Auth from "../auth/Auth";
import * as Setting from "../Setting";
import * as AuthBackend from "../auth/AuthBackend";
import * as ApplicationBackend from "../backend/ApplicationBackend";
import eventBus from "./eventBus";

// 获取当前用户信息
export const getAccountInfo = () => {
  // 从全局状态或localStorage获取当前用户信息
  // 注意：这里需要根据主应用的实际实现进行调整
  const account = localStorage.getItem("casdoor_account")
    ? JSON.parse(localStorage.getItem("casdoor_account"))
    : null;
  const accessToken = localStorage.getItem("casdoor_access_token") || null;
  const themeData = localStorage.getItem("casdoor_theme_data")
    ? JSON.parse(localStorage.getItem("casdoor_theme_data"))
    : null;
  const serverUrl = Setting.ServerUrl;

  return {
    account,
    accessToken,
    themeData,
    serverUrl,
    // 提供给子应用的方法
    onLoginSuccess: (newAccount, newAccessToken, redirectUrl) => {
      handleLoginSuccess(newAccount, newAccessToken, redirectUrl);
    },
    onUpdateAccount: (newAccount, newAccessToken) => {
      setAccountInfo(newAccount, newAccessToken, themeData);
      // 通知所有子应用账户信息已更新
      notifySubApps("accountUpdated", {
        account: newAccount,
        accessToken: newAccessToken,
      });
    },
  };
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
