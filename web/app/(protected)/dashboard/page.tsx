'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { UnauthorizedError } from '@/api/auth/auth.types';
import { getSites } from "@/api/sites/sites";
import type { SiteWithActiveAlarms } from "@/api/sites/sites.types";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
	const router = useRouter();

	const [sites, setSites] = useState<SiteWithActiveAlarms[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadSites() {
			try {
				const { result } = await getSites();
				if (!cancelled) setSites(result);
			} catch (error: unknown) {
				if (error instanceof UnauthorizedError) {
					router.replace('/sign-in');
					return;
				}
				if (!cancelled) setErrorMsg(error instanceof Error ? error.message : "Failed to load sites");
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}

		loadSites();

		return () => {
			cancelled = true;
		};
	}, [router]);

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold">Sites</h1>
				<p className="text-sm text-muted-foreground">Selecione um site para ver os bancos de baterias</p>
			</div>

			{isLoading && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="size-4 animate-spin" />
					Carregando sites...
				</div>
			)}

			{errorMsg && !isLoading && <p className="text-sm text-destructive">{errorMsg}</p>}

			{!isLoading && !errorMsg && sites.length === 0 && (
				<p className="text-sm text-muted-foreground">Nenhum site encontrado</p>
			)}

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{sites.map((site) => (
					<Card
						key={site.siteId}
						onClick={() => router.push(`/sites?siteId=${site.siteId}`)}
						className="cursor-pointer transition-shadow hover:ring-2 hover:ring-ring/50"
					>
						<CardHeader>
							<CardTitle>{site.nome}</CardTitle>
							<CardDescription>
								{site.cidade} - {site.uf}
							</CardDescription>
							<CardAction>
								<div
									className={cn(
										"flex items-center gap-1 text-sm font-medium",
										site.activeAlarmsCount > 0 ? "text-destructive" : "text-muted-foreground"
									)}
									title={`${site.activeAlarmsCount} alarme(s) ativo(s)`}
								>
									<AlertTriangle className="size-4" />
									{site.activeAlarmsCount}
								</div>
							</CardAction>
						</CardHeader>
					</Card>
				))}
			</div>
		</div>
	);
}
