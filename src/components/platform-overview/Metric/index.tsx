import { Card, Statistic, Typography } from "@arco-design/web-react";
import clsx from "clsx";

interface MetricProps {
  label: string;
  value: string;
  hint: string;
  tone?: string;
  onClick?: () => void;
}

export function Metric({
  label,
  value,
  hint,
  tone = "",
  onClick,
}: MetricProps) {
  return (
    <Card
      hoverable={Boolean(onClick)}
      className={clsx(
        "h-full min-h-[112px] rounded-lg [&_.arco-card-body]:p-5",
        onClick && "cursor-pointer",
      )}
      onClick={onClick}
    >
      <Statistic
        title={label}
        value={value}
        styleValue={{
          color: tone === "danger" ? "#f53f3f" : "#1d2129",
          fontSize: 28,
          lineHeight: 1.2,
        }}
        extra={
          <Typography.Text
            className={clsx(
              "text-xs",
              tone === "danger" || tone === "warning"
                ? "text-orange-500"
                : "text-green-600",
            )}
          >
            {hint}
          </Typography.Text>
        }
      />
    </Card>
  );
}
