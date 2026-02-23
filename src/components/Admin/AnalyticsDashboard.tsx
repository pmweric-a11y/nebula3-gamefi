'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type LinkStat = {
    id: number
    title: string
    click_count: number
}

export default function AnalyticsDashboard() {
    const [totalViews, setTotalViews] = useState<number>(0)
    const [topLinks, setTopLinks] = useState<LinkStat[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    async function fetchAnalytics() {
        try {
            setLoading(true)

            // 1. 전체 페이지 뷰 수 조회
            const { count, error: viewsError } = await supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true })

            if (viewsError) throw viewsError
            if (count !== null) setTotalViews(count)

            // 2. 링크별 클릭 수 조회 (상위 5개)
            const { data: linksData, error: linksError } = await supabase
                .from('links')
                .select('id, title, click_count')
                .order('click_count', { ascending: false })
                .limit(5)

            if (linksError) throw linksError
            if (linksData) setTopLinks(linksData)

        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <div className="spinner" style={{ width: 30, height: 30 }} />
            </div>
        )
    }

    const totalClicks = topLinks.reduce((sum, link) => sum + link.click_count, 0)

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* 요약 카드 섹션 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 20
            }}>
                <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>총 페이지 방문</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary-light)' }}>
                        {totalViews.toLocaleString()}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>총 링크 클릭</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--success)' }}>
                        {totalClicks.toLocaleString()}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>평균 클릭률</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)' }}>
                        {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%
                    </div>
                </div>
            </div>

            {/* 상세 통계 섹션 */}
            <div className="glass-card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>인기 링크 TOP 5</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {topLinks.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>데이터가 없습니다.</p>
                    ) : (
                        topLinks.map((link, index) => {
                            const percentage = totalClicks > 0 ? (link.click_count / totalClicks) * 100 : 0
                            return (
                                <div key={link.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ fontWeight: 500 }}>
                                            <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>{index + 1}.</span>
                                            {link.title}
                                        </span>
                                        <span style={{ fontWeight: 600 }}>{link.click_count.toLocaleString()}회</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: 8,
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: 4,
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                                            borderRadius: 4,
                                            transition: 'width 1s ease-out'
                                        }} />
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={fetchAnalytics} className="btn-ghost" style={{ fontSize: 13, padding: '6px 12px' }}>
                    데이터 새로고침
                </button>
            </div>
        </div>
    )
}
