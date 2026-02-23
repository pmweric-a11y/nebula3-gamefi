'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLogin() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError

            if (data.user) {
                // admins 테이블에 이메일이 등록되어 있는지 확인 (보안 강화)
                const { data: adminData, error: adminError } = await supabase
                    .from('admins')
                    .select('id')
                    .eq('email', data.user.email)
                    .single()

                if (adminError || !adminData) {
                    // 관리자가 아니면 로그아웃 처리
                    await supabase.auth.signOut()
                    throw new Error('관리자 권한이 없습니다.')
                }

                router.push('/admin/dashboard')
            }
        } catch (err: any) {
            setError(err.message || '로그인 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)',
            padding: 24,
        }}>
            <div className="glass-card fade-in" style={{
                width: '100%',
                maxWidth: 400,
                padding: 40,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: 8,
                    }}>
                        관리자 로그인
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        대시보드에 접근하려면 로그인하세요.
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: 12,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--danger)',
                        fontSize: 14,
                        textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="label" htmlFor="email">이메일</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ marginTop: 8, width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '로그인'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <a href="/" style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        transition: 'color 0.2s',
                    }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        ← 퍼블릭 페이지로 돌아가기
                    </a>
                </div>
            </div>
        </div>
    )
}
