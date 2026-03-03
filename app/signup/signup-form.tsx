'use client'

import { useActionState, useState, useEffect } from 'react'
import { signup } from '@/app/login/actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const initialState = {
    success: false,
    error: '',
    email: ''
}

export default function SignupForm() {
    const [state, formAction, isPending] = useActionState(signup, initialState)
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    const [passwordValue, setPasswordValue] = useState('')
    const [emailValue, setEmailValue] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    // 서버액션 결과에 email이 반환되면 반영 (입력값 유지 버그 방지)
    useEffect(() => {
        if (state?.email !== undefined && state?.email !== '') {
            setEmailValue(state.email)
        }
    }, [state])

    // 비밀번호 정규식 검증
    const hasUpperCase = /[A-Z]/.test(passwordValue)
    const hasLowerCase = /[a-z]/.test(passwordValue)
    const hasNumber = /\d/.test(passwordValue)
    const hasSpecialChar = /[~!@#$%^&*()_+\-={}\[\]\\|:;"'<>,.?\/]/.test(passwordValue)
    const isValidLength = passwordValue.length >= 8 && passwordValue.length <= 16

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-[#1e2330] shadow-xl border border-gray-800 relative">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create an account</h1>
                <p className="text-gray-400">Enter your details to create your account.</p>
            </div>

            <form action={formAction} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        placeholder="yourname@example.com"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-[#151923] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={passwordValue}
                            onChange={(e) => setPasswordValue(e.target.value)}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            placeholder="Create a password"
                            required
                            className="w-full px-4 py-3 pr-12 rounded-lg bg-[#151923] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242A3 3 0 009.878 9.878z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-2.31 0-4.46-.77-6.23-2.062M2.458 12l2.05-2.05m15.034 4.10L17.492 12" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {(isPasswordFocused || passwordValue.length > 0) && (
                        <div className="mt-3 p-4 bg-[#151923] rounded-lg border border-gray-700 text-sm transition-all duration-300 ease-in-out">
                            <p className="text-gray-300 mb-2 font-medium">비밀번호 규칙:</p>
                            <ul className="space-y-1.5 text-xs">
                                <li className={`flex items-center gap-2 ${hasUpperCase ? 'text-green-400' : 'text-gray-500'}`}>
                                    {hasUpperCase ? '✓' : '○'} 영문 대문자 포함
                                </li>
                                <li className={`flex items-center gap-2 ${hasLowerCase ? 'text-green-400' : 'text-gray-500'}`}>
                                    {hasLowerCase ? '✓' : '○'} 영문 소문자 포함
                                </li>
                                <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                                    {hasNumber ? '✓' : '○'} 숫자 포함
                                </li>
                                <li className={`flex items-center gap-2 ${hasSpecialChar ? 'text-green-400' : 'text-gray-500'}`}>
                                    {hasSpecialChar ? '✓' : '○'} 특수문자 포함
                                </li>
                                <li className={`flex items-center gap-2 ${isValidLength ? 'text-green-400' : 'text-gray-500'}`}>
                                    {isValidLength ? '✓' : '○'} 8~16자 이내
                                </li>
                            </ul>
                        </div>
                    )}
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
                    {isPending ? 'Creating account...' : 'Sign Up'}
                </button>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium">
                            Log in
                        </Link>
                    </p>
                </div>
            </form>

            {/* 회원가입 성공 모달 */}
            {state?.success && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 rounded-2xl backdrop-blur-sm">
                    <div className="bg-[#1e2330] border border-gray-700 p-6 rounded-xl shadow-2xl w-full text-center max-w-sm">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">인증 메일 발송 완료</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            <span className="text-blue-400 font-medium">{state?.email}</span>(으)로<br />
                            인증 메일을 보냈습니다.<br />이메일을 확인하여 가입을 완료해주세요.
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            로그인 화면으로 이동
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
