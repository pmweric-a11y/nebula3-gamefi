'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

type Link = {
  id: number
  title: string
  image_url: string | null
  landing_url: string
  display_order: number
  is_active: boolean
  click_count: number
}

export default function PublicPage() {
  const [settings, setSettings] = useState<PageSettings | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, linksRes] = await Promise.all([
          supabase.from('page_settings').select('*').single(),
          supabase.from('links').select('*').eq('is_active', true).order('display_order'),
        ])

        if (settingsRes.data) setSettings(settingsRes.data)
        if (linksRes.data) setLinks(linksRes.data)

        // 방문 로그 기록
        await supabase.from('page_views').insert({
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        })
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function handleLinkClick(link: Link) {
    // 클릭 카운트 증가
    await supabase
      .from('links')
      .update({ click_count: link.click_count + 1 })
      .eq('id', link.id)

    window.open(link.landing_url, '_blank', 'noopener,noreferrer')
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

  const bgStyle = settings?.background_image_url
    ? {
      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%), url(${settings.background_image_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }
    : {
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a3e 50%, #0f0f1a 100%)',
    }

  return (
    <div style={{
      minHeight: '100vh',
      ...bgStyle,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* 상단 관리자 링크 */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
      }}>
        <a
          href="/admin/login"
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          관리자
        </a>
      </div>

      <main style={{
        flex: 1,
        maxWidth: 640,
        margin: '0 auto',
        width: '100%',
        padding: '60px 24px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 40,
      }}>
        {/* 헤더 섹션 */}
        <header style={{ textAlign: 'center' }} className="fade-in">
          <h1 style={{
            fontSize: 'clamp(28px, 6vw, 42px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            marginBottom: 12,
            background: 'linear-gradient(135deg, #f8fafc 30%, var(--primary-light) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {settings?.header_title || 'Welcome'}
          </h1>
          {settings?.header_subtitle && (
            <p style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 480,
              margin: '0 auto',
            }}>
              {settings.header_subtitle}
            </p>
          )}
        </header>

        {/* 바디 링크 섹션 */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {links.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px 0',
              color: 'var(--text-muted)',
            }}>
              등록된 링크가 없습니다
            </div>
          ) : (
            links.map((link, idx) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                id={`link-btn-${link.id}`}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  padding: 20,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  animation: `fadeIn 0.4s ease ${idx * 0.07}s both`,
                  textAlign: 'center',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  const target = e.currentTarget
                  target.style.transform = 'translateY(-4px)'
                  target.style.background = 'var(--bg-card-hover)'
                  target.style.borderColor = 'var(--primary-light)'
                  target.style.boxShadow = '0 12px 40px rgba(99,102,241,0.25)'
                }}
                onMouseLeave={e => {
                  const target = e.currentTarget
                  target.style.transform = 'translateY(0)'
                  target.style.background = 'var(--bg-card)'
                  target.style.borderColor = 'var(--border)'
                  target.style.boxShadow = 'var(--shadow-card)'
                }}
              >
                {link.image_url && (
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}>
                    <img
                      src={link.image_url}
                      alt={link.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                }}>
                  {link.title}
                </span>
                <span style={{
                  fontSize: 11,
                  color: 'var(--primary-light)',
                  opacity: 0.8,
                }}>
                  방문하기 →
                </span>
              </button>
            ))
          )}
        </section>
      </main>

      {/* 푸터 섹션 */}
      {(settings?.footer_text || settings?.footer_email || settings?.footer_link_url) && (
        <footer style={{
          textAlign: 'center',
          padding: '24px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            maxWidth: 640,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            {settings?.footer_logo_url && (
              <img
                src={settings.footer_logo_url}
                alt="Logo"
                style={{ height: 36, objectFit: 'contain', marginBottom: 4 }}
              />
            )}
            {settings?.footer_text && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {settings.footer_text}
              </p>
            )}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {settings?.footer_email && (
                <a
                  href={`mailto:${settings.footer_email}`}
                  id="footer-email-link"
                  style={{
                    fontSize: 13,
                    color: 'var(--primary-light)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--primary-light)')}
                >
                  ✉️ {settings.footer_email}
                </a>
              )}
              {settings?.footer_link_url && (
                <a
                  href={settings.footer_link_url}
                  id="footer-ext-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    color: 'var(--primary-light)',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--primary-light)')}
                >
                  {settings.footer_link_label || settings.footer_link_url}
                </a>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
