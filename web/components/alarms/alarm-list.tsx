import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AlarmEvent, SeverityLevel } from "@/api/alarms/alarms.types";

const severityConfig: Record<SeverityLevel, { icon: string; badge: string; label: string }> = {
	low: { icon: "text-chart-1", badge: "bg-chart-1/10 text-chart-1", label: "Low" },
	medium: { icon: "text-chart-2", badge: "bg-chart-2/10 text-chart-2", label: "Medium" },
	high: { icon: "text-chart-4", badge: "bg-chart-4/10 text-chart-4", label: "High" },
	critical: { icon: "text-destructive", badge: "bg-destructive/10 text-destructive", label: "Critical" },
};

export function AlarmList({
	alarms,
	emptyMessage = "No active alarms",
	limit,
}: {
	alarms: AlarmEvent[];
	emptyMessage?: string;
	limit?: number;
}) {
	if (alarms.length === 0) {
		return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
	}

	const visible = limit ? alarms.slice(0, limit) : alarms;
	const hiddenCount = alarms.length - visible.length;

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-col gap-2">
				{visible.map((alarm) => {
					const config = severityConfig[alarm.severity];

					return (
						<li
							key={alarm.id}
							className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
						>
							<div className="flex min-w-0 items-center gap-2">
								<AlertTriangle className={cn("size-4 shrink-0", config.icon)} />
								<span className="truncate font-medium">{alarm.name}</span>
							</div>
							<div className="flex shrink-0 items-center gap-2">
								<span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", config.badge)}>
									{config.label}
								</span>
								<span className="text-xs text-muted-foreground">
									{new Date(alarm.timestamp).toLocaleString("en-US")}
								</span>
							</div>
						</li>
					);
				})}
			</ul>

			{hiddenCount > 0 && (
				<p className="text-xs text-muted-foreground">+{hiddenCount} more</p>
			)}
		</div>
	);
}
