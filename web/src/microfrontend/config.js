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
export const getGlobalProps = () => {
  const logPrefix = getLogPrefix("config.getGlobalProps");
  console.debug(`${logPrefix} 获取全局属性...`);

  const accountInfo = getAccountInfo();

  const globalProps = {
    account: accountInfo.account,
    accessToken: accountInfo.accessToken,
    themeData: accountInfo.themeData,
    serverUrl: accountInfo.serverUrl,
    // 提供给子应用的方法
    onLoginSuccess: accountInfo.onLoginSuccess,
    onUpdateAccount: accountInfo.onUpdateAccount,
  };

  console.debug(`${logPrefix} 全局属性详情:`, {
    hasAccount: !!globalProps.account,
    hasAccessToken: !!globalProps.accessToken,
    hasThemeData: !!globalProps.themeData,
    hasServerUrl: !!globalProps.serverUrl,
    hasOnLoginSuccess: typeof globalProps.onLoginSuccess === "function",
    hasOnUpdateAccount: typeof globalProps.onUpdateAccount === "function",
  });

  return globalProps;
};
