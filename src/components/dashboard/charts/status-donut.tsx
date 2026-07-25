import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusSlice {
  name: string;
  value: number;
  fill: string;
}

interface StatusDonutProps {
  data: StatusSlice[];
  total: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-background border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.payload.fill }} />
        <span className="font-semibold">{item.name}</span>
      </div>
      <p className="text-muted-foreground mt-0.5 pl-4">
        {item.value} project{item.value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function StatusDonut({ data, total }: StatusDonutProps) {
  return (
    <Card className="bg-card border-card-border shadow-sm h-full">
      <CardHeader className="pb-0 pt-5 px-5">
        <CardTitle className="text-sm font-semibold">Project Status</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Distribution across all projects
        </p>
      </CardHeader>
      <CardContent className="pb-4 pt-3 px-5">
        {total === 0 ? (
          <div className="h-[180px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No projects yet</p>
          </div>
        ) : (
          <>
            <div className="relative h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="transparent"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black leading-none">{total}</span>
                <span className="text-xs text-muted-foreground mt-0.5">projects</span>
              </div>
            </div>

            <div className="space-y-2.5 mt-1">
              {data.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold">{item.value}</span>
                    <span className="text-xs text-muted-foreground w-7 text-right">
                      {Math.round((item.value / total) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
