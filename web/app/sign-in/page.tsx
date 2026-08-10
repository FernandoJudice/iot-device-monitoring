'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldSet,
} from '@/components/ui/field';

import { SignInSchema, type TSignIn } from '@/api/auth/auth.types';
import { signIn } from '@/api/auth/login';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


export default function SignInPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMsg(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    const result = SignInSchema.safeParse(data);

    if (!result.success) {
      setErrorMsg(result.error.issues[0]?.message ?? 'Invalid form data');
      setIsSubmitting(false);
      return;
    }

    const credentials: TSignIn = result.data;

    try {
      const response = await signIn(credentials);

      if (response) {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full min-w-[600px]">
      <Card className="p-6 mx-auto mt-12 min-w-[600px]">
		<CardHeader>
			<CardTitle>Log In</CardTitle>
			<CardDescription>
				Entre seu e-mail e senha para acessar o site
			</CardDescription>
		</CardHeader>
		<CardContent>
			<form onSubmit={onSubmit}>
			<FieldSet>
				<FieldGroup>
				{errorMsg && <FieldError>{errorMsg}</FieldError>}

				<FieldSet>
					<Field>
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="user@email.com"
						required
					/>
					</Field>

					<Field>
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						required
					/>
					</Field>
				</FieldSet>

				<Field orientation="horizontal">
					<Button type="submit" size="lg" disabled={isSubmitting}>
					{isSubmitting ? 'Signing in...' : 'Submit'}
					</Button>
				</Field>
				</FieldGroup>
			</FieldSet>
			</form>
		</CardContent>
      </Card>
    </div>
  );
}
