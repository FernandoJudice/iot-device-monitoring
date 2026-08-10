import type { Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import jwt from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { env } from "../config/env.js";
import type { JwtData } from "../auth/auth.types.js";
import { getBank } from "../banks/banks.service.js";

const BANK_SOCKET_PATH = /^\/ws\/bancos\/([^/]+)$/;

const subscribers = new Map<string, Set<WebSocket>>();

export function broadcastToBanco(bancoId: string, payload: unknown): void {
	const sockets = subscribers.get(bancoId);

	if (!sockets || sockets.size === 0) {
		return;
	}

	const data = JSON.stringify(payload);

	for (const socket of sockets) {
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(data);
		}
	}
}

function subscribe(bancoId: string, socket: WebSocket): void {
	let sockets = subscribers.get(bancoId);

	if (!sockets) {
		sockets = new Set();
		subscribers.set(bancoId, sockets);
	}

	sockets.add(socket);
}

function unsubscribe(bancoId: string, socket: WebSocket): void {
	const sockets = subscribers.get(bancoId);

	if (!sockets) return;

	sockets.delete(socket);

	if (sockets.size === 0) {
		subscribers.delete(bancoId);
	}
}

function rejectUpgrade(socket: Duplex, status: string): void {
	socket.write(`HTTP/1.1 ${status}\r\n\r\n`);
	socket.destroy();
}

export function createWebSocketServer(httpServer: HttpServer): WebSocketServer {
	const wss = new WebSocketServer({ noServer: true });

	httpServer.on("upgrade", async (request, socket, head) => {
		try {
			const url = new URL(request.url ?? "", `http://${request.headers.host}`);
			const match = url.pathname.match(BANK_SOCKET_PATH);

			if (!match || !match[1]) {
				rejectUpgrade(socket, "404 Not Found");
				return;
			}

			const bancoId = decodeURIComponent(match[1]);
			const token = url.searchParams.get("token");

			if (!token) {
				rejectUpgrade(socket, "401 Unauthorized");
				return;
			}

			let user: JwtData;

			try {
				user = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as JwtData;
			} catch {
				rejectUpgrade(socket, "401 Unauthorized");
				return;
			}

			if (user.role === "client") {
				const bank = await getBank(bancoId, user.contracts);

				if (!bank) {
					rejectUpgrade(socket, "403 Forbidden");
					return;
				}
			}

			wss.handleUpgrade(request, socket, head, (ws) => {
				subscribe(bancoId, ws);
				console.log(`WebSocket subscribed to banco ${bancoId}`);

				ws.on("close", () => unsubscribe(bancoId, ws));
				ws.on("error", () => unsubscribe(bancoId, ws));
			});
		} catch (error) {
			console.error("Error handling websocket upgrade:", error);
			socket.destroy();
		}
	});

	return wss;
}
