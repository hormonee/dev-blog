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
    const nickname = formData.get('nickname') as string

    // 비밀번호 정규표현식: 영문 대소문자, 숫자, 특수문자 최소 1개 포함하여 8~16자리
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*()_+\-={}\[\]\\|:;"'<>,.?\/]).{8,16}$/

    if (!email || !password || !nickname) {
        return { success: false, error: '모든 항목(이메일, 비밀번호, 닉네임)을 입력해주세요.', email, nickname }
    }

    // 닉네임 규칙 검증: 한글 8자(바이트 16) 이하, 특수문자 금지, 공백 금지
    const nicknameByteLength = [...nickname].reduce((acc: number, ch: string) => acc + (/[\u3131-\u318E\uAC00-\uD7A3]/.test(ch) ? 2 : 1), 0)
    if (nicknameByteLength > 16) {
        return { success: false, error: '닉네임은 한글 8자 이하(영문 16자 이하)로 입력해주세요.', email, nickname }
    }
    if (!/^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+$/.test(nickname)) {
        return { success: false, error: '닉네임에 특수문자나 공백은 사용할 수 없습니다.', email, nickname }
    }

    if (!passwordRegex.test(password)) {
        return { success: false, error: '비밀번호 규칙을 만족하지 않습니다. (영대소문자, 숫자, 특수문자 포함 8~16자)', email, nickname }
    }

    const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { success: false, error: '회원가입에 실패했습니다. 유효한 정보를 입력해주세요.', email, nickname }
    }

    // Auth 생성이 성공하면 profiles 테이블에 닉네임 저장
    if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            nickname
        })
        if (profileError) {
            return { success: false, error: '프로필(닉네임) 생성 중 오류가 발생했습니다.', email, nickname }
        }
    }

    // 성공적으로 가입된 경우 모달을 띄우기 위해 redirect 대신 success 값을 반환
    return { success: true, error: '', email, nickname }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
