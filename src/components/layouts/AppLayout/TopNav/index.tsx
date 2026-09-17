import { Dropdown, Modal } from "@arco-design/web-react";
import { IconDown, IconExport, IconUser } from "@arco-design/web-react/icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { logoutPlatform } from "@/api/auth";
import { clearAuthSession, useAuthState } from "@/components/auth/store";

export function TopNav() {
  const queryClient = useQueryClient();
  const authState = useAuthState();
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const username = authState.username || (authState.developmentBypass ? "admin" : "平台管理员");

  const logout = useMutation({
    meta: {
      feedback: {
        channel: "notification",
        id: "logout",
        action: "退出登录",
        errorFallback: "服务端退出失败，本地登录状态已清除",
      },
    },
    mutationFn: logoutPlatform,
    onSettled: () => {
      clearAuthSession();
      queryClient.clear();
      window.location.assign("/login");
    },
  });

  const confirmLogout = () => {
    setUserMenuVisible(false);
    Modal.confirm({
      title: "确认退出登录",
      content: "退出后需重新登录。",
      maskClosable: false,
      okButtonProps: { status: "danger" },
      onOk: () => logout.mutateAsync(),
    });
  };

  const userMenu = (
    <div className="topnav-user-card" role="menu" aria-label="用户菜单">
      <div className="topnav-user-card-header">
        <span className="topnav-user-card-avatar" aria-hidden="true">
          <IconUser />
        </span>
        <div className="topnav-user-card-profile">
          <strong>{username}</strong>
          {/* <span>广州-A</span> */}
        </div>
      </div>
      <button
        type="button"
        role="menuitem"
        className="topnav-user-card-action is-danger"
        onClick={confirmLogout}
      >
        <IconExport />
        <span>退出登录</span>
      </button>
    </div>
  );

  return (
    <header className="top-nav">
      <div className="topnav-left">
        <Link to="/overview-capacity" className="topnav-brand" aria-label="ANI BOSS">
          <span className="topnav-brand-mark">A</span>
          <span className="topnav-brand-name">ANI BOSS</span>
        </Link>
      </div>
      <div className="topnav-right">
        {/* <span className="topnav-user-divider" aria-hidden="true" /> */}
        <Dropdown
          droplist={userMenu}
          trigger="click"
          position="br"
          popupVisible={userMenuVisible}
          onVisibleChange={setUserMenuVisible}
        >
          <button
            type="button"
            className="topnav-user"
            aria-label={`打开 ${username} 用户菜单`}
            aria-haspopup="menu"
            aria-expanded={userMenuVisible}
          >
            <span className="topnav-user-avatar">
              <IconUser />
            </span>
            <span className="topnav-user-name">{username}</span>
            <IconDown className="topnav-user-chevron" />
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
