'use client'

import { useActionState } from 'react'
import { login } from './actions'
import Link from 'next/link'

const initialState = {
    error: null,
}

export default function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-[#1e2330] shadow-xl border border-gray-800">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                <p className="text-gray-400">Enter your details to access your account.</p>
            </div>

            <form action={formAction} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="yourname@example.com"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#151923] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <Link href="#" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#151923] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                </div>

                {state?.error && (
                    <div className="text-red-500 text-sm mt-2 font-medium">
                        {state.error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#1e2330] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-blue-500 hover:text-blue-400 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    )
}
