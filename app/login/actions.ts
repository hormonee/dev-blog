'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { field: 'none', error: '이메일과 비밀번호를 입력해주세요.', email, password: '' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    // 로그인이 실패하면 에러 메시지와 관계없이 항상 일관된 UX를 제공합니다.
    if (error) {
        // 비밀번호 칸을 비우기 위해 password 값에 빈 문자열 할당, 이메일은 유지
        return {
            field: 'password',
            error: '로그인에 실패했습니다. 이메일 또는 비밀번호를 다시 확인해주세요.',
            email,
            password: ''
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 비밀번호 정규표현식: 영문 대소문자, 숫자, 특수문자 최소 1개 포함하여 8~16자리
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-={}\[\]\\|:;"'<>,.?\/]).{8,16}$/

    if (!email || !password) {
        return { success: false, error: '이메일과 비밀번호를 입력해주세요.', email }
    }

    if (!passwordRegex.test(password)) {
        return { success: false, error: '비밀번호 규칙을 만족하지 않습니다. (영대소문자, 숫자, 특수문자 포함 8~16자)', email }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { success: false, error: '회원가입에 실패했습니다. 유효한 정보를 입력해주세요.', email }
    }

    // 성공적으로 가입된 경우 모달을 띄우기 위해 redirect 대신 success 값을 반환
    return { success: true, error: '', email }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
