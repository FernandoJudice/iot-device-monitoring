'use client';

import { useEffect, useRef, useState } from "react";

import { getWebSocketUrl } from "@/api/api-client";
import type { AlarmEvent } from "@/api/alarms/alarms.types";
import type { BankReading } from "@/api/banks/banks.types";

type BankSocketMessage =
	| { type: "alarm"; data: AlarmEvent }
	| { type: "reading"; data: BankReading };

type BankSocketHandlers = {
	onAlarm?: (alarm: AlarmEvent) => void;
	onReading?: (reading: BankReading) => void;
};

/**
 * Subscribes to live updates (alarms and readings) for a single bank over
 * a WebSocket connection to the api (`GET /ws/bancos/:bancoId`).
 */
export function useBankSocket(bancoId: string | null, handlers: BankSocketHandlers) {
	const handlersRef = useRef(handlers);
	useEffect(() => {
		handlersRef.current = handlers;
	});

	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (!bancoId) return;

		const socket = new WebSocket(getWebSocketUrl(`/ws/bancos/${bancoId}`));

		socket.onopen = () => setIsConnected(true);
		socket.onclose = () => setIsConnected(false);
		socket.onerror = () => setIsConnected(false);

		socket.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as BankSocketMessage;

				if (message.type === "alarm") {
					handlersRef.current.onAlarm?.(message.data);
				} else if (message.type === "reading") {
					handlersRef.current.onReading?.(message.data);
				}
			} catch (error) {
				console.error("Failed to parse websocket message", error);
			}
		};

		return () => {
			socket.close();
		};
	}, [bancoId]);

	return { isConnected: isConnected && Boolean(bancoId) };
}
