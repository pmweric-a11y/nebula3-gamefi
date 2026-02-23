'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Admin = {
    id: string
    email: string
    invited_by: string | null
    created_at: string
}

export default function AdminInvitePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null)

    const [admins, setAdmins] = useState<Admin[]>([])
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && user.email) {
                setCurrentUser({ email: user.email })
                fetchAdmins()
            } else {
                router.push('/admin/login')
            }
        }

        init()
    }, [router])

    async function fetchAdmins() {
        try {
            const { data, error } = await (supabase.from('admins') as any)
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setAdmins(data)
        } catch (error) {
            console.error('Error fetching admins:', error)
        } finally {
            setLoading(false)
        }
    }

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type })
        setTimeout(() => setMessage({ text: '', type: '' }), 4000)
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteEmail || !currentUser) return

        // 이미 등록된 이메일인지 확인
        if (admins.some(a => a.email === inviteEmail)) {
            showMessage('이미 등록된 관리자입니다.', 'error')
            return
        }

        setInviting(true)
        try {
            // 1. admins 테이블에 먼저 등록 (접근 허용 리스트)
            const { data: insertData, error: insertError } = await (supabase
                .from('admins') as any)
                .insert([{
                    email: inviteEmail,
                    invited_by: currentUser.email,
                }])
                .select()
                .single()

            if (insertError) throw insertError

            if (insertData) {
                setAdmins([insertData, ...admins])
                setInviteEmail('')
                showMessage(`관리자(${inviteEmail})가 추가되었습니다. 해당 이메일로 가입을 안내하세요.`, 'success')
            }

        } catch (error: any) {
            console.error('Error adding admin:', error)
            showMessage(`관리자 추가 실패: ${error.message || '알 수 없는 오류'}`, 'error')
        } finally {
            setInviting(false)
        }
    }

    const handleRemove = async (emailToRemove: string) => {
        if (!currentUser || emailToRemove === currentUser.email) {
            showMessage('자신의 계정은 삭제할 수 없습니다.', 'error')
            return
        }

        if (!confirm(`정말로 관리자 권한을 삭제하시겠습니까?\n(${emailToRemove})`)) return

        try {
            const { error } = await supabase
                .from('admins')
                .delete()
                .eq('email', emailToRemove)

            if (error) throw error

            setAdmins(admins.filter(a => a.email !== emailToRemove))
            showMessage('관리자 권한이 삭제되었습니다.', 'success')

            // 참고: Supabase Auth 에서 유저 자체를 삭제하려면 Service Key (백엔드) 가 필요합니다.
            // 우리는 앞서 로그인 시 `admins` 테이블을 확인하여 권한을 제어하므로, 
            // 여기서 레코드를 지우면 해당 유저는 로그인/대시보드 접근이 차단됩니다.
        } catch (error) {
            console.error('Error removing admin:', error)
            showMessage('권한 삭제 중 오류가 발생했습니다.', 'error')
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}>
            {/* 네비게이션 */}
            <nav style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => router.push('/admin/dashboard')} className="btn-ghost" style={{ padding: '4px 8px' }}>
                        ← 대시보드로 돌아가기
                    </button>
                    <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>관리자 계정 리스트</h1>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{currentUser?.email}</span>
            </nav>

            <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
                {message.text && (
                    <div className="fade-in" style={{
                        padding: 16, marginBottom: 24, borderRadius: 8,
                        background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
                        border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                    }}>
                        {message.text}
                    </div>
                )}

                <div className="glass-card fade-in" style={{ padding: 32, marginBottom: 32 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--primary-light)' }}>새 관리자 등록 (권한 부여)</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                        관리자 목록에 추가된 이메일만 서비스 대시보드에 접근할 수 있습니다.
                    </p>

                    <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                            placeholder="추가할 이메일 주소 입력"
                            className="input-field"
                            required
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn-primary" disabled={inviting}>
                            {inviting ? '추가 중...' : '권한 부여'}
                        </button>
                    </form>
                </div>

                <div className="glass-card fade-in" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>현재 관리자 목록 ({admins.length})</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {admins.map(admin => {
                            const isMe = admin.email === currentUser?.email;
                            return (
                                <div key={admin.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                                    border: isMe ? '1px solid var(--primary-light)' : '1px solid transparent'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ fontWeight: 600 }}>{admin.email}</span>
                                            {isMe && <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 6px' }}>나</span>}
                                        </div>
                                        {admin.invited_by && (
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                추가한 사람: {admin.invited_by} • {new Date(admin.created_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    {!isMe && (
                                        <button
                                            onClick={() => handleRemove(admin.email)}
                                            className="btn-danger"
                                            style={{ padding: '6px 12px', fontSize: 13 }}
                                        >
                                            권한 뺏기
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
