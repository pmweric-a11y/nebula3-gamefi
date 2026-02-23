'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ImageUploader from '../ImageUploader'

type PageSettings = {
    id: number
    background_image_url: string | null
    header_title: string | null
    header_subtitle: string | null
    footer_logo_url: string | null
    footer_text: string | null
    footer_email: string | null
    footer_link_url: string | null
    footer_link_label: string | null
}

export default function PageSettingsEditor() {
    const [settings, setSettings] = useState<PageSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            const { data, error } = await supabase.from('page_settings').select('*').single()
            if (error && error.code !== 'PGRST116') throw error
            if (data) setSettings(data)
        } catch (error) {
            console.error('Error fetching settings:', error)
            setMessage({ text: '설정을 불러오는데 실패했습니다.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setSettings(prev => prev ? { ...prev, [name]: value } : null)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!settings) return

        setSaving(true)
        setMessage({ text: '', type: '' })

        try {
            if (settings.id) {
                const { error } = await supabase
                    .from('page_settings')
                    .update(settings)
                    .eq('id', settings.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('page_settings')
                    .insert([settings])
                if (error) throw error
            }
            setMessage({ text: '성공적으로 저장되었습니다.', type: 'success' })
        } catch (error) {
            console.error('Error saving settings:', error)
            setMessage({ text: '저장 중 오류가 발생했습니다.', type: 'error' })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage({ text: '', type: '' }), 3000)
        }
    }

    if (loading) return <div className="spinner" style={{ margin: '20px auto' }} />

    return (
        <form onSubmit={handleSave} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {/* 헤더 섹션 */}
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary-light)' }}>헤더 설정</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label className="label">제목 (Title)</label>
                            <input
                                type="text"
                                name="header_title"
                                value={settings?.header_title || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="환영합니다"
                            />
                        </div>
                        <div>
                            <label className="label">소개 (Subtitle)</label>
                            <textarea
                                name="header_subtitle"
                                value={settings?.header_subtitle || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="나를 소개하는 짧은 글을 적어보세요."
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="divider" />

                {/* 배경 이미지 섹션 */}
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary-light)' }}>배경 설정</h3>
                    <div>
                        <ImageUploader
                            label="배경 이미지 업로드"
                            bucketName="images"
                            folderPath="backgrounds"
                            currentImageUrl={settings?.background_image_url}
                            onUploadSuccess={(url) => setSettings(prev => prev ? { ...prev, background_image_url: url } : null)}
                        />
                    </div>
                </div>

                <div className="divider" />

                {/* 푸터 섹션 */}
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--primary-light)' }}>푸터 설정</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <ImageUploader
                                label="푸터 로고 이미지 업로드"
                                bucketName="images"
                                folderPath="footers"
                                currentImageUrl={settings?.footer_logo_url}
                                onUploadSuccess={(url) => setSettings(prev => prev ? { ...prev, footer_logo_url: url } : null)}
                            />
                        </div>
                        <div>
                            <label className="label">푸터 텍스트</label>
                            <input
                                type="text"
                                name="footer_text"
                                value={settings?.footer_text || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="© 2026 My Linktree. All rights reserved."
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="label">연락처 이메일</label>
                                <input
                                    type="email"
                                    name="footer_email"
                                    value={settings?.footer_email || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="hello@example.com"
                                />
                            </div>
                            <div>
                                <label className="label">외부 링크 라벨</label>
                                <input
                                    type="text"
                                    name="footer_link_label"
                                    value={settings?.footer_link_label || ''}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Privacy Policy"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">외부 링크 URL</label>
                            <input
                                type="url"
                                name="footer_link_url"
                                value={settings?.footer_link_url || ''}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://example.com/privacy"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? '저장 중...' : '변경사항 저장'}
                </button>
            </div>
        </form>
    )
}
