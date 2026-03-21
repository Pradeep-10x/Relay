'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import {
	AtSignIcon,
	ChevronLeftIcon,
	GithubIcon,
	Grid2x2PlusIcon,
	UserIcon,
	LockIcon,
	MailIcon,
	AlertCircle,
	CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function AuthPage() {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState(true);
	
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [username, setUsername] = useState('');
	
	const [isLoading, setIsLoading] = useState(false);
	const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

	const showToast = (message: string, type: 'error' | 'success') => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 4000);
	};

	const isUsernameValid = username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
	const isPasswordValid = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
	const isEmailValid = /\S+@\S+\.\S+/.test(email);
	const isNameValid = name.trim().length > 0;
	
	const isFormValid = isLogin 
		? (isEmailValid && isPasswordValid) 
		: (isNameValid && isUsernameValid && isEmailValid && isPasswordValid);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setToast(null);
		
		if (!isFormValid) {
			const missing = [];
			if (!isLogin && !isNameValid) missing.push("Name");
			if (!isLogin && !isUsernameValid) missing.push("Username");
			if (!isEmailValid) missing.push("Email pattern");
			if (!isPasswordValid) missing.push("Password requirements");
			showToast(`Action needed: Please resolve ${missing.join(", ")}`, 'error');
			return;
		}

		setIsLoading(true);

		const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
		const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
		
		const payload = isLogin 
			? { email, password } 
			: { email, password, name, username };

		try {
			const res = await fetch(`${baseUrl}${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Authentication failed');
			}

			// Typically you'd store tokens or user context here if not relying on HttpOnly cookies solely for access.
			// Assuming Next.js app needs to redirect upon success.
			showToast(isLogin ? "Welcome back!" : "Account created successfully!", 'success');
			setTimeout(() => {
				router.push('/dashboard');
			}, 1500);
		} catch (err: any) {
			showToast(err.message, 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const containerVariants = {
		hidden: { opacity: 0, scale: 0.95, rotate: -2 },
		show: {
			opacity: 1,
			scale: 1,
			rotate: 0,
			transition: { staggerChildren: 0.1, type: "spring", stiffness: 260, damping: 20 }
		}
	} as any;
	
	const itemVariants = {
		hidden: { opacity: 0, y: 15, rotate: -2 },
		show: { opacity: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
	} as any;

	return (
		<main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
			<div className="bg-muted/60 relative hidden h-full flex-col border-r p-10 lg:flex">
				<div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent" />
				<div className="z-10 flex items-center gap-2">
					<img src="logo.svg" alt="Relay" width={40} height={40} />
					{/* <p className="text-xl font-semibold " >Relay</p> */}
				</div>
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>
			<div className="relative flex min-h-screen flex-col justify-center p-4">
				<div
					aria-hidden
					className="absolute inset-0 isolate contain-strict -z-10 opacity-60"
				>
					<div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)] absolute top-0 right-0 h-320 w-140 -translate-y-87.5 rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 [translate:5%_-50%] rounded-full" />
					<div className="bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] absolute top-0 right-0 h-320 w-60 -translate-y-87.5 rounded-full" />
				</div>
				<Button variant="ghost" className="absolute top-7 left-5" asChild>
					<a href="/">
						<ChevronLeftIcon className='size-4 me-2' />
						Home
					</a>
				</Button>
				<motion.div 
					key={isLogin ? 'login' : 'register'}
					initial="hidden"
					animate="show"
					variants={containerVariants}
					className="mx-auto w-full max-w-md space-y-6 bg-white dark:bg-zinc-950 p-8 sm:p-10 rounded-md shadow-xl border border-zinc-200 dark:border-zinc-800 relative z-10"
				>
					<motion.div variants={itemVariants} className="flex flex-col space-y-2">
						<img src="logo.svg" alt="Relay" width={48} height={48} className="mb-2" />
						<h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl text-foreground">
							{isLogin ? "Welcome back" : "Join Relay today"}
						</h1>
						<p className="text-muted-foreground text-sm font-medium">
							{isLogin ? "Sign in to continue to your dashboard." : "Create an account to unlock all features."}
						</p>
					</motion.div>

					<motion.div variants={itemVariants}>
						<Button 
							type="button" 
							className="w-full h-11 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800 transition-all font-medium shadow-sm rounded-lg"
						>
							<GoogleIcon className='size-5 me-2' />
							Continue with Google
						</Button>
					</motion.div>

					<motion.div variants={itemVariants}>
						<AuthSeparator />
					</motion.div>

					<motion.form 
						variants={itemVariants} 
						className="space-y-4" 
						onSubmit={handleSubmit}
					>

						{!isLogin && (
							<div className="space-y-4">
								<div className="relative group">
									<Input
										placeholder="Name"
										className="h-11 px-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 outline-none focus:outline-none ring-0 focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors shadow-sm"
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required={!isLogin}
									/>
								</div>
								<div className="relative group">
									<Input
										placeholder="Username"
										className="h-11 px-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 outline-none focus:outline-none ring-0 focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors shadow-sm"
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										required={!isLogin}
									/>
									<div className={cn("absolute left-0 top-full mt-2 w-max max-w-xs rounded-md bg-zinc-900 dark:bg-zinc-100 p-2 text-xs text-zinc-50 dark:text-zinc-900 shadow-lg z-50 transition-opacity", !isUsernameValid ? "hidden group-focus-within:block opacity-0 group-focus-within:opacity-100" : "hidden")}>
										Must be 3-20 characters long.<br/>
										Letters, numbers, and underscores only.
										<div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-zinc-900 dark:bg-zinc-100"></div>
									</div>
								</div>
							</div>
						)}

						<div className="relative group mt-2">
							<Input
								placeholder="Email address"
								className="h-11 px-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 outline-none focus:outline-none ring-0 focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors shadow-sm"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="relative group mt-2">
							<Input
								placeholder="Password"
								className="h-11 px-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 outline-none focus:outline-none ring-0 focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors shadow-sm"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<div className={cn("absolute left-0 top-full mt-2 w-max max-w-xs rounded-md bg-zinc-900 dark:bg-zinc-100 p-2 text-xs text-zinc-50 dark:text-zinc-900 shadow-lg z-50 transition-opacity", !isPasswordValid ? "hidden group-focus-within:block opacity-0 group-focus-within:opacity-100" : "hidden")}>
								Must remain strictly secure:<br/>
								• At least 8 characters<br/>
								• One uppercase & one lowercase letter<br/>
								• One number & one special character
								<div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-zinc-900 dark:bg-zinc-100"></div>
							</div>
						</div>

						<Button 
							type="submit" 
							className={cn(
								"w-full h-11 mt-6 rounded-lg font-semibold tracking-wide transition-all shadow-sm",
								(!isFormValid || isLoading) ? "opacity-50 cursor-not-allowed bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-zinc-100" : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
							)}
							disabled={isLoading}
						>
							<span>{isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}</span>
						</Button>
					</motion.form>

					<motion.div variants={itemVariants} className="mt-6 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
						<button 
							type="button" 
							onClick={() => {
								setIsLogin(!isLogin);
								setToast(null);
							}} 
							className="text-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors underline underline-offset-4 decoration-zinc-300 hover:decoration-zinc-900 dark:decoration-zinc-700 dark:hover:decoration-zinc-100"
						>
							{isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
						</button>
					</motion.div>

					<motion.p variants={itemVariants} className="text-zinc-500 dark:text-zinc-500 mx-auto max-w-xs text-center text-xs mt-8">
						By clicking continue, you agree to our
							Terms of Service
							and
							Privacy Policy
						.
					</motion.p>
				</motion.div>
			</div>

			<AnimatePresence>
				{toast && (
					<motion.div
						initial={{ opacity: 0, x: 50, scale: 0.95 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: 50, scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 30 }}
						className={cn(
							"fixed bottom-8 right-8 px-6 py-4 rounded-md shadow-xl z-50 flex items-center gap-3 border tracking-wide font-semibold text-sm",
							toast.type === 'error' 
								? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50" 
								: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50"
						)}
					>
						{toast.type === 'error' ? <AlertCircle className="size-5" /> : <CheckCircle2 className="size-5" />}
						{toast.message}
					</motion.div>
				)}
			</AnimatePresence>
		</main>
	);
}

function FloatingPaths({ position }: { position: number }) {
	const paths = Array.from({ length: 36 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		color: `rgba(15,23,42,${0.1 + i * 0.03})`,
		width: 0.5 + i * 0.03,
	}));

	return (
		<div className="pointer-events-none absolute inset-0">
			<svg
				className="h-full w-full text-slate-950 dark:text-white"
				viewBox="0 0 696 316"
				fill="none"
			>
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="currentColor"
						strokeWidth={path.width}
						strokeOpacity={0.1 + path.id * 0.03}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}

const GoogleIcon = (props: React.ComponentProps<'svg'>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		{...props}
	>
		<g>
			<path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
		</g>
	</svg>
);

const AppleIcon = (props: React.ComponentProps<'svg'>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 315" fill="currentColor" {...props}>
        <path d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615-.35 1.156-6.654 22.758-22.152 45.422-13.43 19.645-27.42 39.155-49.32 39.585-21.46.43-28.264-12.724-52.753-12.724-24.58 0-32.22 12.294-52.754 13.153-21.437.868-37.472-20.975-51.3-40.89C13.627 236.43 0 186.046 0 137.95c0-40.06 25.845-61.275 46.8-62.144 20.57-.866 39.73 13.43 52.33 13.43 12.603 0 35.843-16.48 60.556-14.075 10.375.438 39.52 4.187 58.12 31.437-1.576.974-34.808 20.352-34.004 60.432zM152.617 41.977c11.53-13.93 19.293-33.344 17.165-52.658-16.51 1.258-36.81 11.532-48.74 25.46-9.524 11.082-18.73 30.85-16.185 49.79 18.257 1.413 36.21-8.665 47.76-22.593z" />
    </svg>
);

const AuthSeparator = () => {
	return (
		<div className="flex w-full items-center justify-center">
			<div className="bg-border h-px w-full" />
			<span className="text-muted-foreground px-2 text-xs">OR</span>
			<div className="bg-border h-px w-full" />
		</div>
	);
};
