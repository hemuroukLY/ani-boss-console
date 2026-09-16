import { Button, Divider, Form, Input, Message } from "@arco-design/web-react";
import { IconDriveFile, IconLock } from "@arco-design/web-react/icon";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import backgroundImageUrl from "@/assets/auth/background-01-cqy.png";
import logoUrl from "@/assets/brand/logo.png";
import { loginPlatform } from "@/api/auth";
import { parseApiError } from "@/lib/api-error";
import { isAuthenticated, setAuthSession, setDevelopmentAuthBypass } from "../store";
import styles from "./index.module.less";

interface PlatformLoginValues {
  username: string;
  password: string;
}

function normalizeRedirect(redirect?: string) {
  return redirect?.startsWith("/") && !redirect.startsWith("//") && !redirect.includes("\\")
    ? redirect
    : "/";
}

function getLoginErrorMessage(error: unknown) {
  const apiError = parseApiError(error);
  if (apiError.code === "INVALID_CREDENTIALS") return "用户名或密码错误";
  if (apiError.code === "AUTH_NOT_CONFIGURED") return "平台登录服务尚未配置";
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "网络异常，请稍后重试";
  }
  return apiError.message || "登录失败，请稍后重试";
}

export function LoginPage({ redirect }: { redirect?: string }) {
  const target = normalizeRedirect(redirect);

  useEffect(() => {
    if (isAuthenticated()) window.location.replace(target);
  }, [target]);

  const login = useMutation({
    mutationFn: (values: PlatformLoginValues) => loginPlatform(values),
    onSuccess: (tokens, values) => {
      setAuthSession(tokens, values.username);
      Message.success("登录成功");
      window.location.replace(target);
    },
    onError: (error) => Message.error(getLoginErrorMessage(error)),
  });

  const skipLogin = () => {
    setDevelopmentAuthBypass(true);
    Message.info("已进入开发预览模式");
    window.location.replace(target);
  };

  return (
    <main className={styles.page}>
      <img className={styles.background} src={backgroundImageUrl} alt="" aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.brand}>
          <img className={styles.brandLogo} src={logoUrl} alt="" />
          <span>常青云平台</span>
        </div>
      </header>

      <section className={styles.loginCard} aria-labelledby="login-page-title">
        <img className={styles.cardLogo} src={logoUrl} alt="常青云" />
        <h1 id="login-page-title" className={styles.title}>
          登录常青云平台
        </h1>

        <Form<PlatformLoginValues>
          className={styles.form}
          layout="vertical"
          requiredSymbol={false}
          initialValues={{ username: "root", password: "Correct@123" }}
          disabled={login.isPending}
          onSubmit={(values) => login.mutate(values)}
        >
          <Form.Item
            label="账号"
            field="username"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input
              size="large"
              placeholder="请输入账号"
              maxLength={64}
              allowClear
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            className={styles.passwordItem}
            label={
              <span className={styles.passwordLabel}>
                <span>密码</span>
                <span className={styles.forgotPassword} aria-disabled="true">
                  忘记密码？
                </span>
              </span>
            }
            field="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              size="large"
              placeholder="请输入密码"
              maxLength={256}
              autoComplete="current-password"
            />
          </Form.Item>
          <Button
            className={styles.submitButton}
            type="primary"
            size="large"
            htmlType="submit"
            long
            loading={login.isPending}
          >
            立即登录
          </Button>
        </Form>

        <div hidden>
          <Divider className={styles.divider}>OR</Divider>
          <div className={styles.alternativeMethods} aria-label="其他登录方式">
            <span className={styles.alternativeMethod} aria-disabled="true">
              <IconDriveFile />
              Ukey登录
            </span>
            <span className={styles.alternativeMethod} aria-disabled="true">
              <IconLock />
              AD/LDAP账户
            </span>
          </div>
        </div>

        {import.meta.env.DEV ? (
          <Button className={styles.developmentButton} type="text" size="mini" onClick={skipLogin}>
            跳过登录（开发预览）
          </Button>
        ) : null}
      </section>

      <footer className={styles.footer}>Copyright © 2021-2025 广州常青云科技有限公司</footer>
    </main>
  );
}
