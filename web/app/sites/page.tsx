'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { getSiteBanks } from "@/api/banks/banks";
import type { BankWithLatestReading } from "@/api/banks/banks.types";
import { getActiveAlarms } from "@/api/alarms/alarms";
import type { AlarmEvent } from "@/api/alarms/alarms.types";
import { AlarmList } from "@/components/alarms/alarm-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const modoLabels: Record<string, string> = {
	flutuacao: "Flutuação",
	descarga: "Descarga",
	recarga: "Recarga",
};

function SiteBanksContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const siteId = searchParams.get("siteId");

	const [banks, setBanks] = useState<BankWithLatestReading[]>([]);
	const [alarms, setAlarms] = useState<AlarmEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState<string | null>(null);

	useEffect(() => {
		if (!siteId) return;

		let cancelled = false;

		async function loadBanks() {
			try {
				const [banksResponse, alarmsResponse] = await Promise.all([
					getSiteBanks(siteId as string),
					getActiveAlarms(),
				]);

				if (!cancelled) {
					setBanks(banksResponse.result);
					setAlarms(alarmsResponse.data);
				}
			} catch (error: unknown) {
				if (!cancelled) setFetchError(error instanceof Error ? error.message : "Failed to load banks");
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		loadBanks();

		return () => {
			cancelled = true;
		};
	}, [siteId]);

	const isLoadingResolved = siteId ? isLoading : false;
	const errorMsg = siteId ? fetchError : "Nenhum site selecionado";

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
			<div className="flex items-center gap-3">
				<Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
					<ArrowLeft className="size-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-semibold">Bancos de baterias</h1>
					<p className="text-sm text-muted-foreground">Site {siteId}</p>
				</div>
			</div>

			{isLoadingResolved && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Carregando bancos...
				</div>
			)}

			{errorMsg && !isLoadingResolved && <p className="text-sm text-destructive">{errorMsg}</p>}

			{!isLoadingResolved && !errorMsg && banks.length === 0 && (
				<p className="text-sm text-muted-foreground">Nenhum banco encontrado para este site</p>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{banks.map((bank) => {
					const bankAlarms = alarms.filter((alarm) => alarm.bancoId === bank.bancoId);
					const latest = bank.latestMessage;

					return (
						<Card
							key={bank.bancoId}
							onClick={() => router.push(`/details?bancoId=${bank.bancoId}`)}
							className="cursor-pointer transition-shadow hover:ring-2 hover:ring-ring/50"
						>
							<CardHeader>
								<CardTitle>{bank.bancoId}</CardTitle>
								<CardDescription>
									{latest
										? `${latest.tensaoV.toFixed(2)} V · ${latest.correnteA.toFixed(2)} A · ${latest.temperaturaC.toFixed(1)}°C · ${modoLabels[latest.modo] ?? latest.modo}`
										: "Sem leitura recente"}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-2">
								<Separator />
								<AlarmList alarms={bankAlarms} limit={3} emptyMessage="Sem alarmes ativos" />
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

export default function SitesPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Carregando...
				</div>
			}
		>
			<SiteBanksContent />
		</Suspense>
	);
}
