// 微前端工具函数

// 生成带时间戳的日志前缀
const getLogPrefix = (module) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [MicroFrontend] [${module}]`;
};

// 加载子应用配置
export const loadSubAppConfig = async () => {
  const logPrefix = getLogPrefix("utils.loadSubAppConfig");
  console.debug(`${logPrefix} 开始加载子应用配置...`);

  try {
    // 从本地配置文件加载子应用配置
    const localApps = getLocalSubApps();
    console.debug(
      `${logPrefix} 本地配置加载完成，应用数量: ${localApps.length}`
    );
    localApps.forEach((app, index) => {
      console.debug(`${logPrefix} 本地应用 ${index + 1}/${localApps.length}:`, {
        name: app.name,
        entry: app.entry,
        container: app.container,
        activeRule: app.activeRule,
      });
    });

    // 从服务器加载子应用配置
    console.debug(`${logPrefix} 开始从服务器加载子应用配置...`);
    const serverApps = await getServerSubApps();
    console.debug(
      `${logPrefix} 服务器配置加载完成，应用数量: ${serverApps.length}`
    );
    serverApps.forEach((app, index) => {
      console.debug(
        `${logPrefix} 服务器应用 ${index + 1}/${serverApps.length}:`,
        {
          name: app.name,
          entry: app.entry,
          container: app.container,
          activeRule: app.activeRule,
        }
      );
    });

    // 合并本地和服务器配置，服务器配置优先级更高
    const mergedApps = [...localApps];
    console.debug(
      `${logPrefix} 开始合并配置，初始本地应用数量: ${mergedApps.length}`
    );

    serverApps.forEach((serverApp, index) => {
      const existingIndex = mergedApps.findIndex(
        (app) => app.name === serverApp.name
      );
      if (existingIndex >= 0) {
        // 如果本地已有同名应用，使用服务器配置覆盖
        console.debug(
          `${logPrefix} 服务器应用覆盖本地应用 (${index + 1}/${
            serverApps.length
          }):`,
          {
            appName: serverApp.name,
            oldEntry: mergedApps[existingIndex].entry,
            newEntry: serverApp.entry,
            oldContainer: mergedApps[existingIndex].container,
            newContainer: serverApp.container,
          }
        );
        mergedApps[existingIndex] = serverApp;
      } else {
        // 否则添加服务器配置的应用
        console.debug(
          `${logPrefix} 添加服务器应用 (${index + 1}/${serverApps.length}):`,
          {
            appName: serverApp.name,
            entry: serverApp.entry,
            container: serverApp.container,
            activeRule: serverApp.activeRule,
          }
        );
        mergedApps.push(serverApp);
      }
    });

    console.debug(
      `${logPrefix} 配置合并完成，最终应用数量: ${mergedApps.length}`
    );
    return mergedApps;
  } catch (error) {
    console.error(`${logPrefix} 加载子应用配置失败:`, {
      message: error.message,
      stack: error.stack,
      error,
    });
    // 出错时回退到本地配置
    const fallbackApps = getLocalSubApps();
    console.debug(
      `${logPrefix} 使用本地配置作为回退，回退应用数量: ${fallbackApps.length}`
    );
    return fallbackApps;
  }
};

// 从JSON文件导入子应用配置
import subAppsConfig from "./subAppsConfig.json";

// 获取本地子应用配置
export const getLocalSubApps = () => {
  const logPrefix = getLogPrefix("utils.getLocalSubApps");
  console.debug(`${logPrefix} 获取本地子应用配置...`);
  console.debug(`${logPrefix} 本地配置文件路径: ./subAppsConfig.json`);

  // 从JSON文件导入子应用配置
  console.debug(
    `${logPrefix} 本地子应用配置获取完成，应用数量: ${subAppsConfig.length}`
  );
  return subAppsConfig;
};

// 从服务器加载子应用配置（可选）
export const getServerSubApps = async () => {
  const logPrefix = getLogPrefix("utils.getServerSubApps");
  console.debug(`${logPrefix} 开始从服务器加载子应用配置...`);

  try {
    // 实际可以从服务器API获取子应用配置
    console.debug(`${logPrefix} 配置获取方式: 模拟（API调用已注释）`);
    // const response = await fetch('/api/subapps');
    // console.debug(`${logPrefix} 服务器响应状态: ${response.status}`);
    // return await response.json();

    const mockApps = [];
    console.debug(
      `${logPrefix} 服务器配置加载完成，返回模拟数据: ${mockApps.length} 个应用`
    );
    return mockApps;
  } catch (error) {
    console.error(`${logPrefix} 加载服务器子应用配置失败:`, {
      message: error.message,
      stack: error.stack,
      error,
    });
    console.debug(`${logPrefix} 服务器配置加载失败，返回空数组`);
    return [];
  }
};

// 生成唯一ID
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 深度合并对象
export const deepMerge = (target, source) => {
  const result = { ...target };
  if (target && source) {
    Object.keys(source).forEach((key) => {
      if (source[key] instanceof Object && !(source[key] instanceof Array)) {
        if (!(key in target)) {
          Object.assign(result, { [key]: source[key] });
        } else {
          result[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(result, { [key]: source[key] });
      }
    });
  }
  return result;
};

// 解析URL参数
export const parseUrlParams = (url) => {
  const params = {};
  const urlObj = new URL(url);
  for (const [key, value] of urlObj.searchParams.entries()) {
    params[key] = value;
  }
  return params;
};

// 获取当前环境
export const getCurrentEnv = () => {
  return process.env.NODE_ENV;
};
