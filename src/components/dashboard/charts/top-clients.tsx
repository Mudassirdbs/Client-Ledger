import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Briefcase } from "lucide-react";

interface ClientStat {
  name: string;
  totalValue: number;
  amountPaid: number;
  projectCount: number;
}

interface TopClientsProps {
  clients: ClientStat[];
}

const fmtFull = (v: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(v);

const RANK_STYLES = [
  { bg: "bg-amber-500/15", text: "text-amber-500", border: "border-amber-500/30" },
  { bg: "bg-slate-400/15", text: "text-slate-400", border: "border-slate-400/30" },
  { bg: "bg-orange-600/15", text: "text-orange-500", border: "border-orange-500/30" },
];

export function TopClients({ clients }: TopClientsProps) {
  return (
    <Card className="bg-card border-card-border shadow-sm">
      <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-sm font-semibold">Top Clients</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranked by total project value — most hired at top
          </p>
        </div>
        <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No clients yet. Add a project to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {clients.map((client, index) => {
              const rate =
                client.totalValue > 0
                  ? Math.round((client.amountPaid / client.totalValue) * 100)
                  : 0;
              const rank = RANK_STYLES[index] ?? {
                bg: "bg-muted",
                text: "text-muted-foreground",
                border: "border-border",
              };

              return (
                <div
                  key={client.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${rank.bg} ${rank.border}`}
                  >
                    <span className={`text-xs font-bold ${rank.text}`}>
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold truncate leading-none">
                        {client.name}
                      </span>
                      <span className="text-xs font-bold tabular-nums shrink-0 ml-3">
                        {fmtFull(client.totalValue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-8 text-right">
                        {rate}%
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center gap-0.5 pl-2 border-l border-border">
                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-bold leading-none">{client.projectCount}</span>
                    <span className="text-[10px] text-muted-foreground leading-none">
                      {client.projectCount === 1 ? "proj" : "projs"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
