import LoginForm from './login-form'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#0f1219] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <div className="flex justify-center items-center gap-2">
                    {/* Logo Placeholder */}
                    <div className="w-8 h-8 bg-blue-600 rounded-md transform rotate-45"></div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">DevBlog</h2>
                </div>
            </div>

            <LoginForm />
        </div>
    )
}
