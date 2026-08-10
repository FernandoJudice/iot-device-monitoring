'use client';

import { useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import type { BankReading } from "@/api/banks/banks.types";

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 28, left: 48 };
const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

type Point = { x: number; y: number; timestamp: number; tensaoV: number };

function formatTime(timestamp: number) {
	return new Date(timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function VoltageChart({ data }: { data: BankReading[] }) {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	const sorted = useMemo(
		() =>
			[...data]
				.map((reading) => ({ timestamp: new Date(reading.timestamp).getTime(), tensaoV: reading.tensaoV }))
				.sort((a, b) => a.timestamp - b.timestamp),
		[data]
	);

	const { points, yTicks, xTicks } = useMemo(() => {
		if (sorted.length === 0) {
			return { points: [] as Point[], yTicks: [] as { value: number; y: number }[], xTicks: [] as { timestamp: number; x: number }[] };
		}

		const timestamps = sorted.map((d) => d.timestamp);
		const voltages = sorted.map((d) => d.tensaoV);

		const minX = Math.min(...timestamps);
		const maxX = Math.max(...timestamps);

		const rawMinY = Math.min(...voltages);
		const rawMaxY = Math.max(...voltages);
		const range = rawMaxY - rawMinY || 1;
		const pad = Math.max(range * 0.15, 0.2);
		const minY = rawMinY - pad;
		const maxY = rawMaxY + pad;

		const scaleX = (t: number) => (maxX === minX ? PLOT_WIDTH / 2 : ((t - minX) / (maxX - minX)) * PLOT_WIDTH);
		const scaleY = (v: number) => PLOT_HEIGHT - ((v - minY) / (maxY - minY)) * PLOT_HEIGHT;

		const points: Point[] = sorted.map((d) => ({
			x: scaleX(d.timestamp),
			y: scaleY(d.tensaoV),
			timestamp: d.timestamp,
			tensaoV: d.tensaoV,
		}));

		const yTicks = Array.from({ length: 4 }, (_, i) => {
			const value = minY + ((maxY - minY) * i) / 3;
			return { value, y: scaleY(value) };
		});

		const xTicks = [minX, (minX + maxX) / 2, maxX].map((t) => ({ timestamp: t, x: scaleX(t) }));

		return { points, yTicks, xTicks };
	}, [sorted]);

	if (points.length === 0) {
		return (
			<div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
				Nenhuma leitura no período
			</div>
		);
	}

	function handlePointerMove(event: ReactPointerEvent<SVGRectElement>) {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * PLOT_WIDTH;

		let closest = 0;
		let closestDist = Infinity;
		points.forEach((point, index) => {
			const dist = Math.abs(point.x - x);
			if (dist < closestDist) {
				closestDist = dist;
				closest = index;
			}
		});

		setHoverIndex(closest);
	}

	const active = points[hoverIndex ?? points.length - 1];
	const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
	const areaPath = `${linePath} L${points[points.length - 1].x},${PLOT_HEIGHT} L${points[0].x},${PLOT_HEIGHT} Z`;

	return (
		<div className="relative w-full">
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				className="h-[260px] w-full overflow-visible"
				role="img"
				aria-label="Tensão ao longo do tempo"
			>
				<g transform={`translate(${PADDING.left},${PADDING.top})`}>
					{yTicks.map((tick, i) => (
						<g key={i}>
							<line x1={0} x2={PLOT_WIDTH} y1={tick.y} y2={tick.y} className="stroke-border" strokeWidth={1} />
							<text x={-8} y={tick.y} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
								{tick.value.toFixed(1)}V
							</text>
						</g>
					))}

					{xTicks.map((tick, i) => (
						<text
							key={i}
							x={tick.x}
							y={PLOT_HEIGHT + 18}
							textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
							className="fill-muted-foreground text-[10px]"
						>
							{formatTime(tick.timestamp)}
						</text>
					))}

					<path d={areaPath} fill="var(--color-chart-1)" fillOpacity={0.1} stroke="none" />
					<path
						d={linePath}
						fill="none"
						stroke="var(--color-chart-1)"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{hoverIndex !== null && (
						<line x1={active.x} x2={active.x} y1={0} y2={PLOT_HEIGHT} className="stroke-foreground/30" strokeWidth={1} />
					)}

					<circle cx={active.x} cy={active.y} r={5} fill="var(--color-chart-1)" stroke="var(--color-card)" strokeWidth={2} />

					<rect
						x={0}
						y={0}
						width={PLOT_WIDTH}
						height={PLOT_HEIGHT}
						fill="transparent"
						onPointerMove={handlePointerMove}
						onPointerLeave={() => setHoverIndex(null)}
					/>
				</g>
			</svg>

			<div
				className="pointer-events-none absolute top-2 flex flex-col items-start gap-0.5 rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-sm"
				style={{ left: `${Math.min(Math.max(((active.x + PADDING.left) / WIDTH) * 100, 8), 88)}%` }}
			>
				<span className="font-medium text-popover-foreground">{active.tensaoV.toFixed(2)} V</span>
				<span className="text-muted-foreground">{formatTime(active.timestamp)}</span>
			</div>
		</div>
	);
}
