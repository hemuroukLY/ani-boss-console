import { Alert, Button, Card, Divider, Form, Input, Message } from "@arco-design/web-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { ApiError } from "@/api/client";
import { loginPlatform } from "@/api/auth";
import { AuthCenterLayout } from "@/components/shell/AuthCenterLayout";
import {
  isAuthenticated,
  setAuthSession,
  setDevelopmentAuthBypass,
} from "../store";

interface PlatformLoginValues {
  username: string;
  password: string;
}

function normalizeRedirect(redirect?: string) {
  return (
    redirect?.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("\\")
  )
    ? redirect
    : "/";
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "INVALID_CREDENTIALS") return "用户名或密码错误";
    if (error.code === "AUTH_NOT_CONFIGURED") return "平台登录服务尚未配置";
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "网络异常，请稍后重试";
  }
  return error instanceof Error ? error.message : "登录失败，请稍后重试";
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
    <AuthCenterLayout>
      <Card className="w-full max-w-[400px]" title="登录 ANI BOSS">
        <Form<PlatformLoginValues>
          layout="vertical"
          initialValues={{ username: "root", password: "Correct@123" }}
          disabled={login.isPending}
          onSubmit={(values) => login.mutate(values)}
        >
          <Form.Item
            label="平台管理员用户名"
            field="username"
            rules={[{ required: true, message: "请输入平台管理员用户名" }]}
          >
            <Input
              placeholder="请输入用户名"
              maxLength={64}
              allowClear
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            label="密码"
            field="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              placeholder="请输入密码"
              maxLength={256}
              autoComplete="current-password"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" long loading={login.isPending}>
            登录
          </Button>
        </Form>

        {import.meta.env.DEV ? (
          <>
            <Divider />
            <Alert
              type="warning"
              content="开发预览模式不会携带平台令牌，仅适用于 ANI 开发鉴权模式。"
            />
            <Button type="text" long className="mt-3" onClick={skipLogin}>
              跳过登录（仅开发模式）
            </Button>
          </>
        ) : null}
      </Card>
    </AuthCenterLayout>
  );
}
