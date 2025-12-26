// Copyright 2021 The HitoFlowAuthors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import "core-js/es";
import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./App.less";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import "./backend/FetchFilter";

// 导入微前端配置
import { registerSubApps, startMicroFrontend } from "./microfrontend/config";
import "./microfrontend/eventBus";

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
  };
}

const container = document.getElementById("root");

const app = createRoot(container);

// 注册并启动微前端框架
const initMicroFrontend = async () => {
  try {
    // 先注册子应用
    await registerSubApps();
    // 然后启动微前端框架
    startMicroFrontend();
    console.log("[MicroFrontend] 微前端框架初始化成功");
  } catch (error) {
    console.error("[MicroFrontend] 微前端框架初始化失败:", error);
  }
};

// 初始化微前端框架
initMicroFrontend();

// 渲染React应用
app.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
