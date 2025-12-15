import i18next from "i18next";
import React from "react";
import {
  TeamOutlined,
  UserOutlined,
  GlobalOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import * as Setting from "../Setting";
import GridCards from "./GridCards";

const ShortcutsPage = () => {
  const items = [
    {
      link: "/organizations",
      name: i18next.t("general:Organizations"),
      description: i18next.t("general:User containers"),
    },
    {
      link: "/users",
      name: i18next.t("general:Users"),
      description: i18next.t("general:Users under all organizations"),
    },
    {
      link: "/providers",
      name: i18next.t("general:Providers"),
      description: i18next.t("general:OAuth providers"),
    },
    {
      link: "/applications",
      name: i18next.t("general:Applications"),
      description: i18next.t(
        "general:Applications that require authentication"
      ),
    },
  ];

  const getItems = () => {
    const iconMap = {
      "/organizations": (
        <TeamOutlined style={{ fontSize: "100px", color: "#1890ff" }} />
      ),
      "/users": (
        <UserOutlined style={{ fontSize: "100px", color: "#52c41a" }} />
      ),
      "/providers": (
        <GlobalOutlined style={{ fontSize: "100px", color: "#faad14" }} />
      ),
      "/applications": (
        <AppstoreOutlined style={{ fontSize: "100px", color: "#f5222d" }} />
      ),
    };

    return items.map((item) => {
      item.icon = iconMap[item.link] || (
        <AppstoreOutlined style={{ fontSize: "100px" }} />
      );
      item.createdTime = "";
      return item;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <GridCards items={getItems()} />
    </div>
  );
};

export default ShortcutsPage;
