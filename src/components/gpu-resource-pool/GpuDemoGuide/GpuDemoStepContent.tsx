import { Alert } from "@arco-design/web-react";
import { getApiErrorMessage } from "@/api/client";
import type {
  GpuInventoryDevice,
  TenantGpuAllocation,
} from "../types";

interface GpuDemoStepContentProps {
  current: number;
  inventory: GpuInventoryDevice[];
  demoTenant?: TenantGpuAllocation;
  inventoryError: unknown;
  tenantError: unknown;
}

function ApiPath({ children }: { children: string }) {
  return (
    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
      {children}
    </code>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export function GpuDemoStepContent({
  current,
  inventory,
  demoTenant,
  inventoryError,
  tenantError,
}: GpuDemoStepContentProps) {
  const available = inventory.filter(
    (device) => device.status === "available",
  ).length;
  const inUse = inventory.filter((device) => device.status === "in_use").length;
  const unavailable = inventory.length - available - inUse;

  const contents = [
    <div className="space-y-4" key="start">
      <div>
        <div className="text-lg font-semibold text-gray-900">
          从平台准备资源，到租户创建实例
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          BOSS 负责查看资源池、维护调度规格，以及调整租户 GPU
          配额和聚合预留；Console 负责租户自查和创建 GPU 实例。
        </p>
      </div>
      <Alert
        type="info"
        content="向导只执行 ANI 已提供且身份范围匹配的接口。原型中的物理卡即时切分、指定卡分配和耗尽库存目前没有对应后端写接口，不会在这里模拟成功。"
      />
    </div>,
    <div className="space-y-4" key="pool">
      <div>
        <div className="text-lg font-semibold text-gray-900">
          先确认资源池是否有卡可用
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          页面通过 <ApiPath>/api/v1/gpu-inventory</ApiPath> 和{" "}
          <ApiPath>/api/v1/gpu-inventory/occupancy</ApiPath> 读取设备与占用汇总。
        </p>
      </div>
      {inventoryError ? (
        <Alert
          type="error"
          content={`资源池接口当前不可用：${getApiErrorMessage(inventoryError)}`}
        />
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <Metric label="总卡数" value={inventory.length} />
          <Metric label="空闲" value={available} />
          <Metric label="已占用" value={inUse} />
          <Metric label="故障/维护" value={unavailable} />
        </div>
      )}
    </div>,
    <div className="space-y-4" key="split">
      <div>
        <div className="text-lg font-semibold text-gray-900">要切再切</div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          已接入 <ApiPath>/api/v1/gpu-specs</ApiPath>
          的查询、新建和删除，可维护 Console 创建实例时使用的整卡或 vGPU
          调度规格。
        </p>
      </div>
      <Alert
        type="warning"
        content="调度规格只定义调度标签和共享策略，不会立即把某一张物理 GPU 切成 2、4 或 7 份。ANI 当前没有原型所需的设备级即时切分接口。"
      />
    </div>,
    <div className="space-y-4" key="assign">
      <div>
        <div className="text-lg font-semibold text-gray-900">分给租户</div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          BOSS 可通过{" "}
          <ApiPath>/api/v1/admin/tenants/:tenant_id/reservations</ApiPath>
          调整租户聚合 GPU 预留。
        </p>
      </div>
      {tenantError ? (
        <Alert
          type="error"
          content={`租户台账当前不可用：${getApiErrorMessage(tenantError)}`}
        />
      ) : demoTenant ? (
        <div className="grid grid-cols-3 gap-3">
          <Metric
            label="demo-corp 资源预留"
            value={demoTenant.allocatedGpuCount}
          />
          <Metric label="已用" value={demoTenant.used} />
          <Metric label="可创建" value={demoTenant.available} />
        </div>
      ) : (
        <Alert
          type="warning"
          content="当前租户台账中没有找到 demo-corp，暂不能执行原型中的演示租户步骤。"
        />
      )}
      <Alert
        type="info"
        content="聚合预留不是指定物理卡绑定；ANI 当前没有把某张空闲卡直接分配给租户的接口。"
      />
    </div>,
    <div className="space-y-4" key="quota">
      <div>
        <div className="text-lg font-semibold text-gray-900">再设配额上限</div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          通过 <ApiPath>/api/v1/admin/tenants/:tenant_id/quota</ApiPath>
          调整租户 GPU 总量上限。配额不能低于当前聚合预留。
        </p>
      </div>
      {tenantError ? (
        <Alert
          type="error"
          content={`租户台账当前不可用：${getApiErrorMessage(tenantError)}`}
        />
      ) : demoTenant ? (
        <div className="grid grid-cols-2 gap-3">
          <Metric label="demo-corp 配额上限" value={demoTenant.quotaTotal} />
          <Metric label="当前资源预留" value={demoTenant.allocatedGpuCount} />
        </div>
      ) : (
        <Alert
          type="warning"
          content="找到 demo-corp 后，才能从演示向导直接打开该租户的配额调整弹窗。"
        />
      )}
    </div>,
    <div className="space-y-4" key="console">
      <div>
        <div className="text-lg font-semibold text-gray-900">
          到 Console 做租户侧确认
        </div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          租户登录 Console 后，通过 <ApiPath>/api/v1/quotas/me</ApiPath> 和{" "}
          <ApiPath>/api/v1/reservations/me</ApiPath>
          查看自己的配额和预留，再进入实例创建流程。
        </p>
      </div>
      <Alert
        type="info"
        content="这两个接口要求 tenant scope，BOSS 的 platform token 不应代替租户调用。当前仓库也不包含 Console 页面，因此本步只说明交接点。"
      />
    </div>,
    <div className="space-y-4" key="admission">
      <div>
        <div className="text-lg font-semibold text-gray-900">不够就拦下来</div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Console 可在创建前调用{" "}
          <ApiPath>/api/v1/gpu-specs/availability</ApiPath>
          ，综合租户剩余预留与匹配节点库存展示规格是否可创建。
        </p>
      </div>
      <Alert
        type="warning"
        content="该接口是租户身份下的准入预检。原型中的“耗尽 A100 库存”只是本地演示动作，ANI 没有对应的 BOSS 测试接口，因此这里不会篡改真实库存。"
      />
    </div>,
    <div className="space-y-4" key="done">
      <div>
        <div className="text-lg font-semibold text-gray-900">流程边界已走完</div>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          BOSS 侧已经覆盖资源池查看、调度规格、租户配额和聚合预留；随后由
          Console 以租户身份完成自查、规格可用性预检与实例创建。
        </p>
      </div>
      <Alert
        type="success"
        content="当前向导中的可执行按钮全部复用真实接口与页面操作。待 ANI 补充设备级切分、指定卡分配或测试库存接口后，再把对应步骤升级为可执行动作。"
      />
    </div>,
  ];

  return (
    <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-6">
      {contents[current]}
    </div>
  );
}
