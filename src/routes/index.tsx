import { Avatar, Button, Input, Tag } from '@arco-design/web-react'
import {
  IconApps,
  IconDashboard,
  IconDown,
  IconExclamationCircle,
  IconMenuFold,
  IconMenuUnfold,
  IconNotification,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconStorage,
  IconUserGroup,
} from '@arco-design/web-react/icon'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState, type ReactNode } from 'react'

export const Route = createFileRoute('/')({ component: HomePage })

type PageItem = { name: string; group?: string }
type NavItem = {
  key: string
  label: string
  icon: ReactNode
  pages: PageItem[]
}

const navigation: NavItem[] = [
  {
    key: 'overview',
    label: '平台运营总览',
    icon: <IconDashboard />,
    pages: [
      '运营总览',
      '资源池与容量态势',
      'GPU 资源池态势',
      'AI 服务运营态势',
      '知识库运营态势',
      '平台告警与待处理',
    ].map((name) => ({ name })),
  },
  {
    key: 'tenant',
    label: '租户管理',
    icon: <IconUserGroup />,
    pages: ['租户列表', '配额策略', '租户管理员', '租户计费与用量'].map(
      (name) => ({ name }),
    ),
  },
  {
    key: 'ops',
    label: '资源池与基础设施',
    icon: <IconStorage />,
    pages: [
      { group: '资源池', name: '平台资源池总览' },
      { group: '资源池', name: 'GPU 资源池管理' },
      { group: '资源池', name: '节点状态' },
      { group: '基础设施', name: '存储基础设施' },
      { group: '基础设施', name: '租户存储配额' },
      { group: '基础设施', name: '网络基础设施' },
      { group: '镜像仓库运维', name: '镜像配额' },
      { group: '镜像仓库运维', name: '漏洞扫描' },
      { group: '镜像仓库运维', name: '垃圾回收' },
    ],
  },
  {
    key: 'health',
    label: '运维与可观测',
    icon: <IconApps />,
    pages: [
      ...[
        '平台健康',
        'GPU 监控',
        '推理监控',
        '知识库监控',
        '日志',
        'Trace',
      ].map((name) => ({ group: '监控', name })),
      ...['告警规则', '运维 Skills', '任务历史', '故障处理'].map((name) => ({
        group: '运维作业',
        name,
      })),
    ],
  },
  {
    key: 'metering',
    label: '平台计量与结算',
    icon: <IconApps />,
    pages: [{ name: '计量总览' }],
  },
  {
    key: 'audit',
    label: '安全审计与合规',
    icon: <IconExclamationCircle />,
    pages: [
      '平台审计日志',
      'API Key 审计',
      '推理调用审计',
      '合规导出与取证',
    ].map((name) => ({ name })),
  },
  {
    key: 'settings',
    label: '平台设置',
    icon: <IconSettings />,
    pages: ['平台运营账号', '登录与 IdP（预留）', '会话与安全策略（预留）'].map(
      (name) => ({ name }),
    ),
  },
  {
    key: 'integration',
    label: '平台集成与通知',
    icon: <IconNotification />,
    pages: ['运维 Webhook', '企业通知集成', '运营系统对接'].map((name) => ({
      name,
    })),
  },
]

function HomePage() {
  const [activeNav, setActiveNav] = useState(navigation[0].key)
  const [activePage, setActivePage] = useState(navigation[0].pages[0].name)
  const [collapsed, setCollapsed] = useState(false)
  const currentNav =
    navigation.find((item) => item.key === activeNav) ?? navigation[0]
  const groupedPages = useMemo(() => {
    const groups = new Map<string, PageItem[]>()
    currentNav.pages.forEach((page) =>
      groups.set(page.group ?? '', [
        ...(groups.get(page.group ?? '') ?? []),
        page,
      ]),
    )
    return [...groups.entries()]
  }, [currentNav])
  const selectNav = (item: NavItem) => {
    setActiveNav(item.key)
    setActivePage(item.pages[0].name)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <span>ANI BOSS</span>
        </div>
        <nav className="top-navigation" aria-label="一级菜单">
          {navigation.map((item) => (
            <button
              key={item.key}
              className={
                item.key === activeNav ? 'top-nav-item active' : 'top-nav-item'
              }
              onClick={() => selectNav(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <Button type="text" icon={<IconNotification />} />
          <Avatar size={28}>管</Avatar>
          <span>平台管理员</span>
          <IconDown />
        </div>
      </header>
      <div className="workspace">
        <aside className={collapsed ? 'sidebar collapsed' : 'sidebar'}>
          <div className="side-scroll">
            {groupedPages.map(([group, pages]) => (
              <section className="menu-group" key={group || 'pages'}>
                {group && (
                  <div className="menu-group-title">
                    <span>{group}</span>
                    <IconDown />
                  </div>
                )}
                {pages.map((page) => (
                  <button
                    key={page.name}
                    title={page.name}
                    className={
                      page.name === activePage
                        ? 'side-item active'
                        : 'side-item'
                    }
                    onClick={() => setActivePage(page.name)}
                  >
                    <span className="side-dot" />
                    <span>{page.name}</span>
                  </button>
                ))}
              </section>
            ))}
          </div>
          <button
            className="collapse-button"
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
            <span>{collapsed ? '' : '收起侧栏'}</span>
          </button>
        </aside>
        <main className="content">
          <div className="breadcrumb">
            {currentNav.label}
            <span>/</span>
            <strong>{activePage}</strong>
          </div>
          {activeNav === 'overview' && activePage === '运营总览' ? (
            <>
              <div className="page-heading">
                <div>
                  <h1>{activePage}</h1>
                  <p>查看和管理全平台的{activePage}信息</p>
                </div>
                <Button type="primary">主要操作</Button>
              </div>
              <section className="summary-grid">
                {['资源总数', '运行中', '待处理', '今日新增'].map(
                  (label, index) => (
                    <article className="summary-card" key={label}>
                      <span>{label}</span>
                      <strong>{[128, 116, 7, 12][index]}</strong>
                      <small>
                        {index === 2 ? '需要及时关注' : '较昨日 +8.2%'}
                      </small>
                    </article>
                  ),
                )}
              </section>
              <section className="data-card">
                <div className="card-toolbar">
                  <div>
                    <h2>{activePage}</h2>
                    <p>页面功能区域骨架</p>
                  </div>
                  <div className="toolbar-actions">
                    <Input
                      prefix={<IconSearch />}
                      placeholder="请输入关键字搜索"
                      allowClear
                    />
                    <Button icon={<IconRefresh />}>刷新</Button>
                  </div>
                </div>
                <div className="table-head">
                  <span>名称</span>
                  <span>所属区域</span>
                  <span>状态</span>
                  <span>更新时间</span>
                  <span>操作</span>
                </div>
                {[
                  'ani-boss-primary',
                  'platform-resource-02',
                  'ops-service-03',
                ].map((name, index) => (
                  <div className="table-row" key={name}>
                    <strong>{name}</strong>
                    <span>华东一区</span>
                    <span>
                      <Tag color={index === 2 ? 'orange' : 'green'}>
                        {index === 2 ? '待处理' : '运行中'}
                      </Tag>
                    </span>
                    <span>2026-08-25 14:3{index}</span>
                    <Button type="text">查看详情</Button>
                  </div>
                ))}
              </section>
            </>
          ) : (
            <section className="placeholder-page">
              <IconApps className="placeholder-icon" />
              <h1>{activePage}</h1>
              <p>页面建设中</p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
