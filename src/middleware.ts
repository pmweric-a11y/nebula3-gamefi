import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // /admin 으로 시작하는 경로에 대해서만 체크
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // /admin/login 은 제외
        if (request.nextUrl.pathname === '/admin/login') {
            if (user) {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            }
            return response
        }

        if (!user) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }

        // 2차 검증: admins 테이블에 존재하는가?
        const { data: adminData } = await supabase
            .from('admins')
            .select('id')
            .eq('email', user.email!)
            .single()

        if (!adminData) {
            await supabase.auth.signOut()
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
