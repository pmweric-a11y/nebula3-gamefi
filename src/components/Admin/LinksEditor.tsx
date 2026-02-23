'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ImageUploader from '../ImageUploader'

type Link = {
    id: number
    title: string
    image_url: string | null
    landing_url: string
    display_order: number
    is_active: boolean
    click_count: number
}

export default function LinksEditor() {
    const [links, setLinks] = useState<Link[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState({ text: '', type: '' })

    // 새 링크 추가용 상태
    const [newLink, setNewLink] = useState({
        title: '',
        landing_url: '',
        image_url: ''
    })
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        fetchLinks()
    }, [])

    async function fetchLinks() {
        try {
            const { data, error } = await supabase
                .from('links')
                .select('*')
                .order('display_order', { ascending: true })

            if (error) throw error
            if (data) setLinks(data)
        } catch (error) {
            console.error('Error fetching links:', error)
            showMessage('링크를 불러오는데 실패했습니다.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type })
        setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    }

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newLink.title || !newLink.landing_url) {
            showMessage('제목과 연동 URL은 필수입니다.', 'error')
            return
        }

        setAdding(true)
        try {
            // 현재 가장 높은 순서 찾기
            const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.display_order)) : 0

            const { data, error } = await supabase
                .from('links')
                .insert([{
                    ...newLink,
                    display_order: maxOrder + 1,
                    is_active: true
                }])
                .select()
                .single()

            if (error) throw error

            setLinks([...links, data])
            setNewLink({ title: '', landing_url: '', image_url: '' })
            showMessage('새 링크가 추가되었습니다.', 'success')
        } catch (error) {
            console.error('Error adding link:', error)
            showMessage('링크 추가에 실패했습니다.', 'error')
        } finally {
            setAdding(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('정말로 이 링크를 삭제하시겠습니까?')) return

        try {
            const { error } = await supabase.from('links').delete().eq('id', id)
            if (error) throw error

            setLinks(links.filter(l => l.id !== id))
            showMessage('링크가 삭제되었습니다.', 'success')
        } catch (error) {
            console.error('Error deleting link:', error)
            showMessage('링크 삭제에 실패했습니다.', 'error')
        }
    }

    const toggleActive = async (link: Link) => {
        try {
            const { error } = await supabase
                .from('links')
                .update({ is_active: !link.is_active })
                .eq('id', link.id)

            if (error) throw error

            setLinks(links.map(l => l.id === link.id ? { ...l, is_active: !l.is_active } : l))
        } catch (error) {
            console.error('Error toggling link status:', error)
            showMessage('상태 변경에 실패했습니다.', 'error')
        }
    }

    const handleOrderChange = async (id: number, direction: 'up' | 'down') => {
        const currentIndex = links.findIndex(l => l.id === id)
        if (currentIndex === -1) return

        if (direction === 'up' && currentIndex === 0) return
        if (direction === 'down' && currentIndex === links.length - 1) return

        const newLinks = [...links]
        const currentLink = newLinks[currentIndex]
        const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        const swapLink = newLinks[swapIndex]

        // 순서 값 교환
        const tempOrder = currentLink.display_order
        currentLink.display_order = swapLink.display_order
        swapLink.display_order = tempOrder

        // 배열 순서 교환 (UI 즉각 반영)
        newLinks[currentIndex] = swapLink
        newLinks[swapIndex] = currentLink
        setLinks(newLinks)

        // DB 업데이트
        try {
            await Promise.all([
                supabase.from('links').update({ display_order: currentLink.display_order }).eq('id', currentLink.id),
                supabase.from('links').update({ display_order: swapLink.display_order }).eq('id', swapLink.id)
            ])
        } catch (error) {
            console.error('Error updating order:', error)
            showMessage('순서 변경에 실패했습니다.', 'error')
            fetchLinks() // 실패 시 원래 데이터로 복구
        }
    }

    if (loading) return <div className="spinner" style={{ margin: '20px auto' }} />

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {message.text && (
                <div style={{
                    padding: 12,
                    borderRadius: 8,
                    background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
                    border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                }}>
                    {message.text}
                </div>
            )}

            {/* 새 링크 추가 폼 */}
            <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: 24,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)'
            }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary-light)' }}>
                    + 새 링크 추가
                </h3>
                <form onSubmit={handleAddLink} style={{ display: 'grid', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 16 }}>
                        <div>
                            <label className="label">제목 (필수)</label>
                            <input
                                type="text"
                                value={newLink.title}
                                onChange={e => setNewLink({ ...newLink, title: e.target.value })}
                                className="input-field"
                                placeholder="예: 내 포트폴리오"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">연동 URL (필수)</label>
                            <input
                                type="url"
                                value={newLink.landing_url}
                                onChange={e => setNewLink({ ...newLink, landing_url: e.target.value })}
                                className="input-field"
                                placeholder="https://..."
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <ImageUploader
                            label="아이콘/이미지 업로드 (선택)"
                            bucketName="images"
                            folderPath="links"
                            currentImageUrl={newLink.image_url}
                            onUploadSuccess={(url) => setNewLink({ ...newLink, image_url: url })}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={adding} style={{ justifySelf: 'start' }}>
                        {adding ? '추가 중...' : '링크 추가하기'}
                    </button>
                </form>
            </div>

            {/* 링크 목록 */}
            <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary-light)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>링크 목록 ({links.length})</span>
                </h3>

                {links.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        등록된 링크가 없습니다. 첫 링크를 추가해보세요!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {links.map((link, index) => (
                            <div key={link.id} className="glass-card" style={{
                                padding: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                opacity: link.is_active ? 1 : 0.5,
                                transition: 'var(--transition)',
                            }}>
                                {/* 순서 변경 컨트롤 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <button
                                        onClick={() => handleOrderChange(link.id, 'up')}
                                        disabled={index === 0}
                                        className="btn-ghost"
                                        style={{ padding: '2px 6px', fontSize: 12, border: 'none', background: 'transparent' }}
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => handleOrderChange(link.id, 'down')}
                                        disabled={index === links.length - 1}
                                        className="btn-ghost"
                                        style={{ padding: '2px 6px', fontSize: 12, border: 'none', background: 'transparent' }}
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* 이미지 썸네일 */}
                                <div style={{
                                    width: 48, height: 48,
                                    borderRadius: 8,
                                    background: 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}>
                                    {link.image_url ? (
                                        <img src={link.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: 20 }}>🔗</span>
                                    )}
                                </div>

                                {/* 링크 정보 */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {link.title}
                                    </h4>
                                    <a href={link.landing_url} target="_blank" rel="noreferrer" style={{
                                        color: 'var(--text-muted)', fontSize: 12,
                                        display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {link.landing_url}
                                    </a>
                                    <div style={{ fontSize: 11, color: 'var(--primary-light)', marginTop: 4 }}>
                                        클릭 수: {link.click_count}회
                                    </div>
                                </div>

                                {/* 액션 버튼들 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    <button
                                        onClick={() => toggleActive(link)}
                                        className="btn-ghost"
                                        style={{
                                            padding: '6px 12px',
                                            color: link.is_active ? 'var(--warning)' : 'var(--success)',
                                            borderColor: link.is_active ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                                        }}
                                    >
                                        {link.is_active ? '숨기기' : '보이기'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(link.id)}
                                        className="btn-danger"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
