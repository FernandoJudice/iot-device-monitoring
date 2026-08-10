'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { getAccessToken } from '@/api/auth/tokenStore';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const isAuthenticated = getAccessToken() !== null;

	useEffect(() => {
		if (!isAuthenticated) {
			router.replace('/sign-in');
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated) {
		return (
			<div className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
				<Loader2 className="size-4 animate-spin" />
				Redirecionando...
			</div>
		);
	}

	return <>{children}</>;
}
