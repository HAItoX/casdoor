// 子应用容器组件
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { getGlobalProps } from "./config";
import { getLocalSubApps } from "./utils";
import { loadMicroApp } from "qiankun";

// 生成带时间戳的日志前缀
const getLogPrefix = (module) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [MicroFrontend] [${module}]`;
};

const SubAppContainer = ({ match }) => {
  // 从路由参数中提取appName
  const appName = match?.params?.appName || "";
  // 生成activeRule（如/subapp/react）
  const activeRule = `/subapp/${appName}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const microAppRef = useRef(null);
  const containerRef = useRef(null);

  // 获取当前子应用的配置信息（在渲染阶段获取，确保立即生效）
  const localApps = getLocalSubApps();
  const currentApp = localApps.find(
    (app) =>
      app.activeRule === activeRule ||
      app.name.toLowerCase() === appName.toLowerCase()
  );

  // 确定容器ID（立即计算，不依赖状态更新）
  const containerId = currentApp?.container || "#subapp-container";
  const containerElementId = containerId.replace("#", "");

  useLayoutEffect(() => {
    const logPrefix = getLogPrefix("SubAppContainer.useLayoutEffect");
    // 重置状态
    setLoading(true);
    setError(null);

    console.debug(`${logPrefix} 当前应用信息:`, {
      appName,
      activeRule,
      hasCurrentApp: !!currentApp,
      currentAppName: currentApp?.name,
      containerId,
      containerElementId,
      activeRuleMatch: currentApp?.activeRule === activeRule,
      nameMatch: currentApp?.name.toLowerCase() === appName.toLowerCase(),
    });

    // 手动加载子应用的函数
    const loadApp = async () => {
      try {
        // 等待容器元素真正存在（使用轮询机制）
        let containerElement = containerRef.current;
        let retryCount = 0;
        const maxRetries = 20; // 最多重试20次
        const retryInterval = 50; // 每次间隔50ms

        while (!containerElement && retryCount < maxRetries) {
          console.debug(`${logPrefix} 等待容器元素...`, {
            retryCount,
            maxRetries,
            containerRefCurrent: containerRef.current,
          });
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
          containerElement = containerRef.current;
          retryCount++;
        }

        if (!containerElement) {
          console.error(`${logPrefix} 容器元素不存在!`, {
            containerId,
            containerElementId,
            retryCount,
            maxRetries,
            containerRefCurrent: containerRef.current,
          });
          throw new Error(
            `容器元素 ${containerId} 不存在，重试${maxRetries}次后仍然未找到`
          );
        }
        console.debug(`${logPrefix} 容器元素检查:`, {
          containerId,
          containerElementId,
          elementExists: !!containerElement,
          elementDetails: containerElement
            ? {
                id: containerElement.id,
                className: containerElement.className,
                tagName: containerElement.tagName,
                hasChildNodes: containerElement.hasChildNodes(),
              }
            : null,
          refCurrent: containerRef.current,
        });

        if (!currentApp) {
          console.error(`${logPrefix} 未找到子应用配置! 所有本地应用:`, {
            total: localApps.length,
            apps: localApps.map((app) => ({
              name: app.name,
              activeRule: app.activeRule,
              container: app.container,
            })),
            searchCriteria: {
              appName,
              activeRule,
            },
          });
          throw new Error(`未找到子应用配置: ${appName}`);
        }

        // 获取全局属性
        const globalProps = await getGlobalProps();

        // 手动加载子应用
        console.debug(`${logPrefix} 开始手动加载子应用:`, {
          appName: currentApp.name,
          entry: currentApp.entry,
          container: containerId,
          containerElement: containerElement,
          hasProps: Object.keys(currentApp.props || {}).length > 0,
          hasGlobalProps: Object.keys(globalProps).length > 0,
        });

        const microApp = loadMicroApp({
          name: currentApp.name,
          entry: currentApp.entry,
          container: containerId,
          props: {
            ...currentApp.props,
            ...globalProps,
          },
        });

        // 检查子应用状态
        console.debug(`${logPrefix} 子应用实例创建完成:`, {
          appName: currentApp.name,
          status: microApp.getStatus(),
          instanceId: microApp._instanceId || "未知",
        });

        // 保存子应用实例
        microAppRef.current = microApp;

        // 检查子应用实例的方法
        console.debug(`${logPrefix} 子应用实例可用方法:`, {
          hasGetStatus: typeof microAppRef.current.getStatus === "function",
          hasOnStateChange:
            typeof microAppRef.current.onStateChange === "function",
          hasOnStatusChange:
            typeof microAppRef.current.onStatusChange === "function",
          instanceKeys: Object.keys(microAppRef.current),
        });

        // 监听子应用的生命周期事件（使用正确的API）
        if (typeof microAppRef.current.onStateChange === "function") {
          // 新的API可能是onStateChange
          microAppRef.current.onStateChange((state) => {
            console.debug(`${logPrefix} 子应用状态变化:`, {
              appName: currentApp.name,
              state,
              timestamp: new Date().toISOString(),
            });
          });
        } else if (typeof microAppRef.current.onStatusChange === "function") {
          // 兼容旧的API
          microAppRef.current.onStatusChange((status) => {
            console.debug(`${logPrefix} 子应用状态变化:`, {
              appName: currentApp.name,
              status,
              timestamp: new Date().toISOString(),
            });
          });
        } else {
          console.warn(`${logPrefix} 子应用实例不支持状态变化监听`);
        }

        console.debug(`${logPrefix} 子应用加载完成:`, currentApp.name);
        setLoading(false);
      } catch (err) {
        console.error(`${logPrefix} 子应用加载失败:`, {
          message: err.message,
          stack: err.stack,
          error: err,
        });
        setError(err);
        setLoading(false);
      }
    };

    // 加载子应用
    console.debug(`${logPrefix} 准备加载子应用:`, {
      hasAppName: !!appName,
      hasCurrentApp: !!currentApp,
      shouldLoad: !!appName && !!currentApp,
    });

    if (appName && currentApp) {
      loadApp();
    } else {
      console.debug(`${logPrefix} 不加载子应用的原因:`, {
        missingAppName: !appName,
        missingCurrentApp: !currentApp,
        appName,
      });
      setLoading(false);
      setError(new Error(`无效的子应用名称: ${appName}`));
    }

    // 组件卸载时卸载子应用
    return () => {
      if (microAppRef.current) {
        console.debug(`${logPrefix} 卸载子应用:`, {
          appName: currentApp?.name || appName,
          currentStatus: microAppRef.current.getStatus(),
        });

        // 检查容器状态
        const containerElement = containerRef.current;
        console.debug(`${logPrefix} 卸载前容器状态:`, {
          containerExists: !!containerElement,
          hasChildNodes: containerElement
            ? containerElement.hasChildNodes()
            : false,
        });

        try {
          // 尝试卸载子应用，捕获可能的DOM错误
          microAppRef.current.unmount();
          console.debug(
            `${logPrefix} 子应用卸载完成:`,
            currentApp?.name || appName
          );
        } catch (err) {
          // 处理 removeChild 相关错误
          if (
            err.name === "NotFoundError" &&
            err.message.includes("removeChild")
          ) {
            console.warn(`${logPrefix} 子应用卸载时DOM操作错误:`, {
              message: err.message,
              explanation:
                "这通常是由于子应用DOM已经被移除导致的，不会影响功能",
            });
          } else {
            // 其他错误正常记录
            console.error(`${logPrefix} 子应用卸载失败:`, {
              message: err.message,
              stack: err.stack,
              error: err,
            });
          }
        } finally {
          // 无论是否成功，都清除引用
          microAppRef.current = null;
        }
      } else {
        console.debug(`${logPrefix} 无已加载的子应用需要卸载:`, appName);
      }
    };
  }, [appName, activeRule, currentApp, containerId, containerElementId]);

  const renderLogPrefix = getLogPrefix("SubAppContainer.render");
  console.debug(`${renderLogPrefix} 渲染容器:`, {
    containerElementId,
    appName,
    hasCurrentApp: !!currentApp,
    currentAppName: currentApp?.name,
    containerId,
    activeRule,
  });

  return (
    <div
      ref={containerRef}
      id={containerElementId}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        padding: "20px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 渲染加载状态 */}
      {loading && <div>加载子应用 {appName} 中...</div>}

      {/* 渲染错误状态 */}
      {error && (
        <div style={{ color: "red" }}>
          <div>加载子应用 {appName} 失败:</div>
          <div>{error.message || "未知错误"}</div>
        </div>
      )}
    </div>
  );
};

export default SubAppContainer;
