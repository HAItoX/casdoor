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

// 注册子应用
export const registerSubApps = async () => {
  const logPrefix = getLogPrefix("config.registerSubApps");
  console.debug(`${logPrefix} 开始注册子应用...`);

  // 动态加载子应用配置
  const loadedApps = await loadSubAppConfig();
  console.debug(
    `${logPrefix} 加载完成的子应用配置，数量: ${loadedApps.length}`
  );
  loadedApps.forEach((app, index) => {
    console.debug(
      `${logPrefix} 子应用配置 ${index + 1}/${loadedApps.length}:`,
      {
        name: app.name,
        entry: app.entry,
        container: app.container,
        activeRule: app.activeRule,
        props: app.props || {},
      }
    );
  });

  // 为每个子应用添加全局属性
  console.debug(`${logPrefix} 开始为子应用添加全局属性...`);
  const appsWithProps = loadedApps.map((app) => {
    const globalProps = getGlobalProps();
    const appWithProps = {
      ...app,
      props: {
        ...app.props,
        ...globalProps,
      },
    };
    console.debug(`${logPrefix} 子应用配置最终版 ${appWithProps.name}:`, {
      container: appWithProps.container,
      activeRule: appWithProps.activeRule,
      hasGlobalProps: Object.keys(globalProps).length > 0,
      globalPropsKeys: Object.keys(globalProps),
    });
    return appWithProps;
  });

  // 注册子应用到qiankun框架
  console.debug(`${logPrefix} 开始向qiankun框架注册子应用...`);
  registerMicroApps(appsWithProps, {
    beforeLoad: [
      (app) => {
        const hookLogPrefix = getLogPrefix(`config.beforeLoad.${app.name}`);
        console.debug(`${hookLogPrefix} 开始加载子应用...`);
        console.debug(`${hookLogPrefix} 子应用加载配置详情:`, {
          name: app.name,
          entry: app.entry,
          container: app.container,
          activeRule: app.activeRule,
          hasProps: Object.keys(app.props || {}).length > 0,
        });

        // 检查容器元素是否存在
        const containerElement = document.querySelector(app.container);
        console.debug(`${hookLogPrefix} 加载前容器检查:`, {
          container: app.container,
          exists: !!containerElement,
          elementDetails: containerElement
            ? {
                id: containerElement.id,
                className: containerElement.className,
                tagName: containerElement.tagName,
              }
            : null,
        });

        // 更新子应用的全局属性（确保最新的认证信息）
        const updatedGlobalProps = getGlobalProps();
        app.props = {
          ...app.props,
          ...updatedGlobalProps,
        };
        console.debug(
          `${hookLogPrefix} 更新子应用全局属性，新增/更新属性数: ${
            Object.keys(updatedGlobalProps).length
          }`
        );

        return Promise.resolve();
      },
    ],
    beforeMount: [
      (app) => {
        const hookLogPrefix = getLogPrefix(`config.beforeMount.${app.name}`);
        console.debug(`${hookLogPrefix} 开始挂载子应用...`);

        // 再次检查容器元素是否存在
        const containerElement = document.querySelector(app.container);
        console.debug(`${hookLogPrefix} 挂载前容器检查:`, {
          container: app.container,
          exists: !!containerElement,
          elementDetails: containerElement
            ? {
                id: containerElement.id,
                className: containerElement.className,
                tagName: containerElement.tagName,
                hasChildNodes: containerElement.hasChildNodes(),
                childNodesCount: containerElement.childNodes.length,
              }
            : null,
        });

        // 如果容器不存在，记录更详细的DOM结构信息
        if (!containerElement) {
          console.error(
            `${hookLogPrefix} 容器元素不存在! 当前页面DOM结构检查:`
          );
          console.error(
            `${hookLogPrefix} 页面body子元素数量:`,
            document.body.childNodes.length
          );
          console.error(
            `${hookLogPrefix} 页面body所有子元素:`,
            document.body.innerHTML
          );
        }

        return Promise.resolve();
      },
    ],
    afterMount: [
      (app) => {
        const hookLogPrefix = getLogPrefix(`config.afterMount.${app.name}`);
        console.debug(`${hookLogPrefix} 子应用挂载完成!`);

        // 挂载后再次检查容器
        const containerElement = document.querySelector(app.container);
        console.debug(`${hookLogPrefix} 挂载后容器状态:`, {
          container: app.container,
          exists: !!containerElement,
          hasChildNodes: containerElement
            ? containerElement.hasChildNodes()
            : false,
          childNodesCount: containerElement
            ? containerElement.childNodes.length
            : 0,
        });

        return Promise.resolve();
      },
    ],
    beforeUnmount: [
      (app) => {
        const hookLogPrefix = getLogPrefix(`config.beforeUnmount.${app.name}`);
        console.debug(`${hookLogPrefix} 开始卸载子应用...`);
        return Promise.resolve();
      },
    ],
    afterUnmount: [
      (app) => {
        const hookLogPrefix = getLogPrefix(`config.afterUnmount.${app.name}`);
        console.debug(`${hookLogPrefix} 子应用卸载完成!`);

        // 卸载后检查容器
        const containerElement = document.querySelector(app.container);
        console.debug(`${hookLogPrefix} 卸载后容器状态:`, {
          container: app.container,
          exists: !!containerElement,
          hasChildNodes: containerElement
            ? containerElement.hasChildNodes()
            : false,
        });

        return Promise.resolve();
      },
    ],
  });

  console.debug(
    `${logPrefix} 子应用注册完成，共注册: ${appsWithProps.length} 个子应用`
  );
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
