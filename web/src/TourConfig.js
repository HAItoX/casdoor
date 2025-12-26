import React from "react";
import * as Setting from "./Setting";

export const TourObj = {
  home: [
    {
      title: "欢迎使用HitoFlow",
      description:
        "您可以在 https://snbb.hitox.top/ 了解更多关于HitoFlow的使用方法。",
      cover: (
        <img
          alt="casdoor.png"
          src={`${Setting.HitoXStaticBaseUrl}/logo/logo-site-dark.png`}
        />
      ),
    },
    {
      title: "统计卡片",
      description: "这里有四张用户信息的统计卡片。",
      id: "statistic",
    },
    {
      title: "导入用户",
      description:
        "您可以通过上传用户信息的XLSX文件来添加新用户或更新现有HitoX用户。",
      id: "echarts-chart",
    },
  ],
  webhooks: [
    {
      title: "Webhook列表",
      description:
        "事件系统允许您构建集成，订阅HitoFlow上的特定事件。当这些事件之一被触发时，我们将向配置的URL发送一个POST json负载。应用程序解析json负载并执行钩子函数。事件包括注册、登录、注销、更新用户，这些都存储在记录的action字段中。事件系统可用于从用户更新外部问题。",
    },
  ],
  syncers: [
    {
      title: "Syncer列表",
      description:
        "HitoFlow将用户存储在用户表中。当您计划将HitoFlow用作身份验证平台时，无需担心将应用程序用户数据迁移到HitoFlow。HitoFlow提供了syncer来快速帮助您将用户数据同步到HitoFlow。",
    },
  ],
  sysinfo: [
    {
      title: "CPU使用率",
      description: "您可以实时查看CPU使用率。",
      id: "cpu-card",
    },
    {
      title: "内存使用率",
      description: "您可以实时查看内存使用率。",
      id: "memory-card",
    },
    {
      title: "API延迟",
      description: "您可以实时查看每个API延迟的使用统计信息。",
      id: "latency-card",
    },
    {
      title: "API吞吐量",
      description: "您可以实时查看每个API吞吐量的使用统计信息。",
      id: "throughput-card",
    },
    {
      title: "关于HitoFlow",
      description: "您可以在此卡片中获取更多HitoFlow信息。",
      id: "about-card",
    },
  ],
  subscriptions: [
    {
      title: "订阅列表",
      description:
        "订阅有助于管理用户选择的计划，使控制应用程序功能访问变得容易。",
    },
  ],
  pricings: [
    {
      title: "价格列表",
      description: "HitoFlow可以通过计划、价格和订阅用作订阅管理系统。",
    },
  ],
  plans: [
    {
      title: "计划列表",
      description:
        "计划描述了应用程序的功能列表，包括自己的名称和价格。计划功能取决于具有一组权限的HitoFlow角色。这允许独立于命名和价格描述计划功能。例如：计划可能根据国家或日期有不同的价格。",
    },
  ],
  payments: [
    {
      title: "支付列表",
      description:
        "支付成功后，您可以在支付中看到产品的交易信息，如组织、用户、购买时间、产品名称等。",
    },
  ],
  products: [
    {
      title: "产品列表",
      description:
        "您可以添加您想要销售的产品（或服务）。以下将告诉您如何添加产品。",
    },
  ],
  sessions: [
    {
      title: "会话列表",
      description: "您可以在此列表中获取会话ID。",
    },
  ],
  tokens: [
    {
      title: "令牌列表",
      description:
        "HitoFlow基于OAuth。令牌是用户的OAuth令牌。您可以在此列表中获取访问令牌。",
    },
  ],
  enforcers: [
    {
      title: "执行器列表",
      description:
        "除了用于请求权限控制执行的API接口外，HitoFlow还提供了其他接口，帮助外部应用程序获取权限策略信息，这些接口也列在这里。",
    },
  ],
  adapters: [
    {
      title: "适配器列表",
      description:
        "HitoFlow支持使用UI连接适配器和管理策略规则。在Casbin中，策略存储被实现为适配器（也称为Casbin的中间件）。Casbin用户可以使用适配器从存储中加载策略规则，或向其保存策略规则。",
    },
  ],
  models: [
    {
      title: "模型列表",
      description:
        "模型定义了您的权限策略结构，以及请求应该如何匹配这些权限策略及其效果。然后您可以在权限中使用模型。",
    },
  ],
  permissions: [
    {
      title: "权限列表",
      description:
        "与单个HitoFlow组织关联的所有用户在该组织的应用程序之间共享，因此可以访问这些应用程序。有时您可能希望限制用户对某些应用程序或特定应用程序中某些资源的访问。在这种情况下，您可以使用Casbin实现的权限。",
    },
    {
      title: "添加权限",
      description:
        "在HitoFlow Web UI中，您可以在模型配置项中为您的组织添加模型，并在权限配置项中为您的组织添加策略。",
      id: "add-button",
    },
    {
      title: "上传权限",
      description:
        "使用Casbin在线编辑器，您可以获得适合您使用场景的模型和策略文件。您可以通过HitoFlow Web UI轻松将模型文件导入HitoFlow，供内置Casbin使用。",
      id: "upload-button",
    },
  ],
  roles: [
    {
      title: "角色列表",
      description:
        "每个用户可能有多个角色。您可以在用户个人资料上看到用户的角色。",
    },
  ],
  resources: [
    {
      title: "资源列表",
      description:
        "您可以在HitoFlow中上传资源。在上传资源之前，您需要配置存储提供商。请参阅存储提供商。",
    },
    {
      title: "上传资源",
      description: "用户可以将文件和图像等资源上传到之前配置的云存储中。",
      id: "upload-button",
    },
  ],
  providers: [
    {
      title: "提供商列表",
      description:
        "我们有6种提供商：OAuth提供商、SMS提供商、Email提供商、存储提供商、支付提供商、验证码提供商。",
    },
    {
      title: "添加提供商",
      description:
        "您必须将提供商添加到应用程序中，然后才能在应用程序中使用该提供商。",
      id: "add-button",
    },
  ],
  organizations: [
    {
      title: "组织列表",
      description:
        "组织是HitoFlow的基本单位，负责管理用户和应用程序。如果用户登录到一个组织，那么他可以访问该组织所属的所有应用程序，而无需再次登录。",
    },
  ],
  groups: [
    {
      title: "用户组列表",
      description: "在用户组列表页面中，您可以看到组织中的所有用户组。",
    },
  ],
  users: [
    {
      title: "用户列表",
      description: "作为身份验证平台，HitoFlow能够管理用户。",
    },
    {
      title: "导入用户",
      description:
        "您可以通过上传用户信息的XLSX文件来添加新用户或更新现有HitoFlow用户。",
      id: "upload-button",
    },
  ],
  applications: [
    {
      title: "应用列表",
      description:
        "如果您想使用HitoFlow为您的Web应用提供登录服务，您可以将它们添加为HitoFlow应用。用户可以访问其组织中的所有应用程序，无需两次登录。",
    },
  ],
};

export const TourUrlList = [
  "home",
  "organizations",
  "groups",
  "users",
  "applications",
  "providers",
  "resources",
  "roles",
  "permissions",
  "models",
  "adapters",
  "enforcers",
  "tokens",
  "sessions",
  "products",
  "payments",
  "plans",
  "pricings",
  "subscriptions",
  "sysinfo",
  "syncers",
  "webhooks",
];

const pathNameMap = {
  home: "首页",
  organizations: "组织",
  groups: "用户组",
  users: "用户",
  applications: "应用",
  providers: "提供商",
  resources: "资源",
  roles: "角色",
  permissions: "权限",
  models: "模型",
  adapters: "适配器",
  enforcers: "执行器",
  tokens: "令牌",
  sessions: "会话",
  products: "产品",
  payments: "支付",
  plans: "计划",
  pricings: "价格",
  subscriptions: "订阅",
  sysinfo: "系统信息",
  syncers: "同步器",
  webhooks: "Webhook",
};

export function getNextUrl(pathName = window.location.pathname) {
  return TourUrlList[TourUrlList.indexOf(pathName.replace("/", "")) + 1] || "";
}

let orgIsTourVisible = true;

export function setOrgIsTourVisible(visible) {
  orgIsTourVisible = visible;
  if (orgIsTourVisible === false) {
    setIsTourVisible(false);
  }
}

export function setIsTourVisible(visible) {
  localStorage.setItem("isTourVisible", visible);
  window.dispatchEvent(new Event("storageTourChanged"));
}

export function setTourLogo(tourLogoSrc) {
  if (tourLogoSrc !== "") {
    TourObj["home"][0]["cover"] = <img alt="casdoor.png" src={tourLogoSrc} />;
  }
}

export function getTourVisible() {
  return localStorage.getItem("isTourVisible") !== "false";
}

export function getNextButtonChild(nextPathName) {
  return nextPathName !== ""
    ? `前往 "${pathNameMap[nextPathName]} 列表"`
    : "完成";
}

export function getSteps() {
  const path = window.location.pathname.replace("/", "");
  const res = TourObj[path];
  if (res === undefined) {
    return [];
  } else {
    return res;
  }
}
