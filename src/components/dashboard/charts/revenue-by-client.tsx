import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientBarData {
  name: string;
  collected: number;
  outstanding: number;
}

interface RevenueByClientProps {
  data: ClientBarData[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(v);

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const collected = payload.find((p: any) => p.dataKey === "collected")?.value ?? 0;
  const outstanding = payload.find((p: any) => p.dataKey === "outstanding")?.value ?? 0;
  return (
    <div className="bg-background border border-border rounded-lg px-3 py-2.5 text-xs shadow-xl min-w-[160px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-emerald-500 shrink-0" />
            <span className="text-muted-foreground">Collected</span>
          </div>
          <span className="font-semibold tabular-nums">{fmtFull(collected)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-amber-500 shrink-0" />
            <span className="text-muted-foreground">Outstanding</span>
          </div>
          <span className="font-semibold tabular-nums">{fmtFull(outstanding)}</span>
        </div>
        <div className="pt-1 border-t border-border flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Total</span>
          <span className="font-bold tabular-nums">{fmtFull(collected + outstanding)}</span>
        </div>
      </div>
    </div>
  );
}

export function RevenueByClient({ data }: RevenueByClientProps) {
  return (
    <Card className="bg-card border-card-border shadow-sm h-full">
      <CardHeader className="pb-0 pt-5 px-5">
        <CardTitle className="text-sm font-semibold">Revenue by Client</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Collected vs outstanding per client
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-4 pt-4">
        <div className="h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid
                horizontal={false}
                stroke="currentColor"
                strokeOpacity={0.06}
              />
              <XAxis
                type="number"
                tickFormatter={fmt}
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.45 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "currentColor", opacity: 0.75 }}
                axisLine={false}
                tickLine={false}
                width={78}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "currentColor", opacity: 0.04 }}
              />
              <Bar dataKey="collected" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="outstanding" stackId="a" fill="#f59e0b" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-5 justify-center mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            Collected
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            Outstanding
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
