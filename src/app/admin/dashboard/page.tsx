'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PageSettingsEditor from '@/components/Admin/PageSettingsEditor'
import LinksEditor from '@/components/Admin/LinksEditor'
import AnalyticsDashboard from '@/components/Admin/AnalyticsDashboard'

export default function AdminDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'links' | 'analytics'>('overview')

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email ?? '')
            }
            setLoading(false)
        }
        fetchUser()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-dark)',
            }}>
                <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-dark)',
            color: 'var(--text-primary)',
        }}>
            {/* 상단 네비게이션 */}
            <nav style={{
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backdropFilter: 'blur(10px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1
                        style={{ fontSize: 18, fontWeight: 700, margin: 0, cursor: 'pointer' }}
                        onClick={() => setActiveTab('overview')}
                    >
                        관리자 대시보드
                    </h1>
                    <div className="badge badge-success">Admin</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        {userEmail}
                    </span>
                    <button
                        onClick={() => router.push('/admin/invite')}
                        className="btn-ghost"
                        style={{ padding: '6px 12px', fontSize: 13, borderColor: 'var(--primary-light)', color: 'var(--primary-light)' }}
                    >
                        관리자 계정 관리
                    </button>
                    <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
                        로그아웃
                    </button>
                </div>
            </nav>

            <div style={{
                maxWidth: 1000,
                margin: '0 auto',
                padding: '40px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
            }}>
                {/* 탭 네비게이션 */}
                <div style={{
                    display: 'flex',
                    gap: 16,
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: 16,
                }}>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '8px 16px' }}
                    >
                        개요
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '8px 16px' }}
                    >
                        페이지 설정
                    </button>
                    <button
                        onClick={() => setActiveTab('links')}
                        className={activeTab === 'links' ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '8px 16px' }}
                    >
                        링크 관리
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={activeTab === 'analytics' ? 'btn-primary' : 'btn-ghost'}
                        style={{ padding: '8px 16px' }}
                    >
                        분석
                    </button>
                </div>

                <main>
                    {activeTab === 'overview' && (
                        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>환영합니다!</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    상단 탭을 클릭하여 항목을 편집하거나 아래 바로가기를 이용하세요.
                                </p>
                                <div style={{ marginTop: 16 }}>
                                    <a href="/" target="_blank" rel="noreferrer" className="btn-ghost" style={{ display: 'inline-flex', gap: 8 }}>
                                        <span>퍼블릭 페이지 보기</span>
                                        <span>↗</span>
                                    </a>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: 24,
                            }}>
                                <div className="glass-card" style={{ padding: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        🎨 페이지 설정
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                                        배경 이미지, 헤더 제목, 소개 글, 푸터를 편집합니다.
                                    </p>
                                    <button onClick={() => setActiveTab('settings')} className="btn-primary" style={{ width: '100%' }}>설정 열기</button>
                                </div>

                                <div className="glass-card" style={{ padding: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        🔗 링크 관리
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                                        새로운 링크를 추가하거나 기존 링크를 수정/삭제합니다.
                                    </p>
                                    <button onClick={() => setActiveTab('links')} className="btn-primary" style={{ width: '100%' }}>목록 보기</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="fade-in glass-card" style={{ padding: 32 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>페이지 설정</h2>
                            <PageSettingsEditor />
                        </div>
                    )}

                    {activeTab === 'links' && (
                        <div className="fade-in glass-card" style={{ padding: 32 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>링크 관리</h2>
                            <LinksEditor />
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="fade-in glass-card" style={{ padding: 32 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>분석</h2>
                            <AnalyticsDashboard />
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
