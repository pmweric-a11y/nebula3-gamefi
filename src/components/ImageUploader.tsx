'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

interface ImageUploaderProps {
    bucketName: string
    folderPath?: string
    currentImageUrl?: string | null
    onUploadSuccess: (url: string) => void
    label?: string
}

export default function ImageUploader({
    bucketName,
    folderPath = '',
    currentImageUrl,
    onUploadSuccess,
    label = '이미지 업로드'
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError(null)
            setUploading(true)

            const file = event.target.files?.[0]
            if (!file) return

            // 파일 검증 (크기, 타입)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('파일 크기는 5MB 이하여야 합니다.')
            }
            if (!file.type.startsWith('image/')) {
                throw new Error('이미지 파일만 업로드 가능합니다.')
            }

            // 파일명 생성 (충돌 방지)
            const fileExt = file.name.split('.').pop()
            const fileName = `${uuidv4()}.${fileExt}`
            const filePath = folderPath ? `${folderPath}/${fileName}` : fileName

            // Storage에 업로드
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('Upload details:', uploadError)
                throw new Error(`이미지 업로드에 실패했습니다: ${uploadError.message} (Storage 권한/설정을 확인하세요)`)
            }

            // public URL 가져오기
            const { data } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath)

            // 부모 컴포넌트에 URL 전달
            onUploadSuccess(data.publicUrl)

        } catch (err: any) {
            console.error('Error uploading image:', err)
            setError(err.message || '업로드 중 오류가 발생했습니다.')
        } finally {
            setUploading(false)
            // input 초기화 (같은 파일 다시 선택 가능하도록)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="label">{label}</label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* 현재 이미지 미리보기 */}
                {currentImageUrl && (
                    <div style={{
                        width: 64, height: 64,
                        borderRadius: 8, overflow: 'hidden',
                        border: '1px solid var(--border)',
                        background: 'var(--bg-card)',
                        flexShrink: 0
                    }}>
                        <img
                            src={currentImageUrl}
                            alt="Current"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}

                <div style={{ flex: 1 }}>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-ghost"
                        disabled={uploading}
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            borderStyle: 'dashed',
                            padding: '16px',
                        }}
                    >
                        {uploading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> 업로드 중...
                            </span>
                        ) : (
                            <span>↑ 클릭하여 파일 찾아보기 (최대 5MB)</span>
                        )}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{error}</p>}
        </div>
    )
}
