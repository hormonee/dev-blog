'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: '이메일과 비밀번호를 입력해주세요.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    // 로그인이 실패하면 에러 메시지 반환 (클라이언트에서 처리 가능)
    if (error) {
        return { error: '로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: '이메일과 비밀번호를 입력해주세요.' }
    }

    const { error, data } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { error: '회원가입에 실패했습니다. 유효한 정보를 입력해주세요.' }
    }

    // 성공적으로 가입된 경우
    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
