'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { UnauthorizedError } from '@/api/auth/auth.types';
import { getBankReadings } from "@/api/banks/banks";
import type { BankReading } from "@/api/banks/banks.types";
import { getActiveAlarms } from "@/api/alarms/alarms";
import type { AlarmEvent } from "@/api/alarms/alarms.types";
import { AlarmList } from "@/components/alarms/alarm-list";
import { VoltageChart } from "@/components/charts/voltage-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBankSocket } from "@/hooks/use-bank-socket";
import { cn } from "@/lib/utils";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function BankDetailsContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const bancoId = searchParams.get("bancoId");

	const [readings, setReadings] = useState<BankReading[]>([]);
	const [alarms, setAlarms] = useState<AlarmEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	useEffect(() => {
		if (!bancoId) return;

		let cancelled = false;

		async function loadDetails() {
			try {
				const ate = new Date();
				const de = new Date(ate.getTime() - TWENTY_FOUR_HOURS_MS);

				const [readingsResponse, alarmsResponse] = await Promise.all([
					getBankReadings(bancoId as string, de, ate, 1),
					getActiveAlarms(),
				]);

				if (!cancelled) {
					setReadings(readingsResponse.data);
					setAlarms(alarmsResponse.data.filter((alarm) => alarm.bancoId === bancoId));
				}
			} catch (error: unknown) {
				if (error instanceof UnauthorizedError) {
					router.replace('/sign-in');
					return;
				}
				if (!cancelled) setFetchError(error instanceof Error ? error.message : "Failed to load bank details");
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		loadDetails();

		return () => {
			cancelled = true;
		};
	}, [bancoId, router]);

	const isLoadingResolved = bancoId ? isLoading : false;
	const errorMsg = bancoId ? fetchError : "Nenhum banco selecionado";

	const { isConnected } = useBankSocket(bancoId, {
		onAlarm: (alarm) => {
			setAlarms((prev) => {
				const withoutAlarm = prev.filter((a) => a.id !== alarm.id);
				return alarm.status === "active" ? [alarm, ...withoutAlarm] : withoutAlarm;
			});
		},
		onReading: (reading) => {
			setReadings((prev) => {
				const cutoff = new Date(reading.timestamp).getTime() - TWENTY_FOUR_HOURS_MS;
				return [...prev.filter((r) => new Date(r.timestamp).getTime() >= cutoff), reading];
			});
		},
	});

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" onClick={() => router.back()}>
					<ArrowLeft className="size-4" />
				</Button>
				<div className="flex flex-1 items-center justify-between gap-3">
					<div>
						<h1 className="text-2xl font-semibold">Banco {bancoId}</h1>
						<p className="text-sm text-muted-foreground">Tensão nas últimas 24 horas</p>
					</div>
					{!isLoadingResolved && !errorMsg && (
						<div
							className={cn(
								"flex items-center gap-1.5 text-xs font-medium",
								isConnected ? "text-chart-1" : "text-muted-foreground"
							)}
							title={isConnected ? "Recebendo atualizações em tempo real" : "Desconectado"}
						>
							<span className={cn("size-2 rounded-full", isConnected ? "bg-chart-1" : "bg-muted-foreground")} />
							{isConnected ? "Ao vivo" : "Desconectado"}
						</div>
					)}
				</div>
			</div>

			{isLoadingResolved && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Carregando dados...
				</div>
			)}

			{errorMsg && !isLoadingResolved && <p className="text-sm text-destructive">{errorMsg}</p>}

			{!isLoadingResolved && !errorMsg && (
				<>
					<Card>
						<CardHeader>
							<CardTitle>Tensão (V)</CardTitle>
							<CardDescription>Últimas 24 horas</CardDescription>
						</CardHeader>
						<CardContent>
							<VoltageChart data={readings} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Alarmes</CardTitle>
							<CardDescription>Alarmes ativos para este banco</CardDescription>
						</CardHeader>
						<CardContent>
							<AlarmList alarms={alarms} />
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

export default function DetailsPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Carregando...
				</div>
			}
		>
			<BankDetailsContent />
		</Suspense>
	);
}
