// 子应用SSO登录示例代码
// 这个文件展示了如何在子应用中集成Casdoor的SSO登录功能

// 1. 在子应用的生命周期中接收主应用传递的props
export async function mount(props) {
  console.log("[子应用] 开始挂载...");

  // 从主应用接收SSO配置
  const {
    account,
    accessToken,
    ssoConfig,
    ssoLogin,
    refreshToken,
    validateToken,
    onLoginSuccess,
    onUpdateAccount,
  } = props;

  console.log("[子应用] 接收到的props:", {
    hasAccount: !!account,
    hasAccessToken: !!accessToken,
    hasSSOConfig: !!ssoConfig,
    ssoEnabled: ssoConfig?.enabled,
  });

  // 2. 检查用户是否已登录
  if (account && accessToken) {
    console.log("[子应用] 用户已登录，直接使用主应用的认证信息");
    handleAuthenticatedUser(account, accessToken, props);
  } else {
    console.log("[子应用] 用户未登录，执行SSO登录");
    await performSSOLogin(props);
  }

  // 3. 设置token自动刷新
  setupTokenRefresh(props);

  render(props);
}

// 处理已认证用户
function handleAuthenticatedUser(account, accessToken, props) {
  console.log("[子应用] 处理已认证用户:", {
    username: account.name,
    email: account.email,
    hasAccessToken: !!accessToken,
  });

  // 将用户信息保存到子应用的本地存储
  localStorage.setItem("subapp_user", JSON.stringify(account));
  localStorage.setItem("subapp_access_token", accessToken);

  // 如果子应用有自己的用户系统，需要进行用户映射
  syncUserWithLocalSystem(account, accessToken);
}

// 执行SSO登录
async function performSSOLogin(props) {
  console.log("[子应用] 开始执行SSO登录...");

  try {
    // 调用主应用提供的SSO登录方法
    const result = await props.ssoLogin();

    if (result.success) {
      console.log("[子应用] SSO登录成功:", {
        userId: result.userInfo.sub,
        userName: result.userInfo.preferred_username,
        hasAccessToken: !!result.accessToken,
      });

      // 保存用户信息和token
      localStorage.setItem("subapp_user", JSON.stringify(result.userInfo));
      localStorage.setItem("subapp_access_token", result.accessToken);

      // 同步到本地用户系统
      await syncUserWithLocalSystem(result.userInfo, result.accessToken);

      // 通知主应用登录成功（可选）
      if (props.onLoginSuccess) {
        props.onLoginSuccess(result.userInfo, result.accessToken);
      }

      return result;
    } else {
      console.error("[子应用] SSO登录失败:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("[子应用] SSO登录异常:", error);
    throw error;
  }
}

// 同步用户到本地系统
async function syncUserWithLocalSystem(casdoorUser, accessToken) {
  console.log("[子应用] 开始同步用户到本地系统...");

  try {
    // 调用子应用的后端API进行用户同步
    const response = await fetch("/api/sync-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        casdoorUserId: casdoorUser.sub,
        username: casdoorUser.preferred_username || casdoorUser.name,
        email: casdoorUser.email,
        phone: casdoorUser.phone,
        avatar: casdoorUser.avatar,
        displayName: casdoorUser.displayName,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log("[子应用] 用户同步成功:", {
        localUserId: result.localUserId,
        username: result.username,
      });

      // 保存本地用户ID
      localStorage.setItem("subapp_local_user_id", result.localUserId);
      localStorage.setItem("subapp_local_token", result.localToken);

      return result;
    } else {
      console.error("[子应用] 用户同步失败:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("[子应用] 用户同步异常:", error);
    throw error;
  }
}

// 设置token自动刷新
function setupTokenRefresh(props) {
  console.log("[子应用] 设置token自动刷新...");

  // 每30分钟检查一次token是否需要刷新
  setInterval(async () => {
    try {
      const currentToken = localStorage.getItem("subapp_access_token");

      if (!currentToken) {
        console.warn("[子应用] 没有access token，跳过刷新");
        return;
      }

      // 验证token是否有效
      const validationResult = await props.validateToken(currentToken);

      if (!validationResult.valid) {
        console.log("[子应用] Token已过期，尝试刷新...");

        // 刷新token
        const refreshResult = await props.refreshToken();

        if (refreshResult.success) {
          console.log("[子应用] Token刷新成功");
          localStorage.setItem("subapp_access_token", refreshResult.accessToken);

          // 更新本地token
          await refreshLocalToken(refreshResult.accessToken);
        } else {
          console.error("[子应用] Token刷新失败:", refreshResult.error);
          // 跳转到登录页
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error("[子应用] Token检查异常:", error);
    }
  }, 30 * 60 * 1000); // 30分钟
}

// 刷新本地token
async function refreshLocalToken(newAccessToken) {
  console.log("[子应用] 刷新本地token...");

  try {
    const response = await fetch("/api/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${newAccessToken}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      console.log("[子应用] 本地token刷新成功");
      localStorage.setItem("subapp_local_token", result.localToken);
      return result;
    } else {
      console.error("[子应用] 本地token刷新失败:", result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("[子应用] 本地token刷新异常:", error);
    throw error;
  }
}

// 渲染子应用
function render(props) {
  console.log("[子应用] 开始渲染...");
  const container = document.getElementById("root");
  container.innerHTML = `
    <div>
      <h1>子应用SSO登录示例</h1>
      <div id="user-info"></div>
      <button id="logout-btn">登出</button>
    </div>
  `;

  // 显示用户信息
  const userInfo = JSON.parse(localStorage.getItem("subapp_user"));
  if (userInfo) {
    document.getElementById("user-info").innerHTML = `
      <p>用户名: ${userInfo.preferred_username || userInfo.name}</p>
      <p>邮箱: ${userInfo.email}</p>
    `;
  }

  // 绑定登出按钮
  document.getElementById("logout-btn").addEventListener("click", () => {
    handleLogout(props);
  });
}

// 处理登出
function handleLogout(props) {
  console.log("[子应用] 处理登出...");

  // 清除本地存储
  localStorage.removeItem("subapp_user");
  localStorage.removeItem("subapp_access_token");
  localStorage.removeItem("subapp_local_user_id");
  localStorage.removeItem("subapp_local_token");

  // 通知主应用登出
  if (props.onUpdateAccount) {
    props.onUpdateAccount(null, null);
  }

  // 跳转到主应用的登录页
  window.location.href = "/login";
}

// 导出qiankun生命周期
export async function bootstrap() {
  console.log("[子应用] 开始bootstrap...");
}

export async function unmount(props) {
  console.log("[子应用] 开始unmount...");
  // 清理定时器等资源
}

// 导出供外部使用的函数
export {
  performSSOLogin,
  syncUserWithLocalSystem,
  handleLogout,
};
