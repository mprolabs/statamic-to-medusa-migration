import { NextRequest, NextResponse } from 'next/server'
import { defaultLocale, locales } from './lib/i18n/config'

export function middleware(request: NextRequest): NextResponse {
  // Get the pathname of the request (e.g. /products, /about, /)
  const pathname = request.nextUrl.pathname

  // Check if the pathname starts with a locale
  const pathnameIsMissingLocale = locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // If there is no locale in the pathname
  if (pathnameIsMissingLocale) {
    // Try to get the preferred locale from the user's accept-language header
    const acceptLanguageHeader = request.headers.get('accept-language')
    let preferredLocale = defaultLocale

    if (acceptLanguageHeader) {
      // Parse the accept-language header to get the user's preferred languages
      const acceptedLanguages = acceptLanguageHeader
        .split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2).toLowerCase())

      // Find the first locale from the user's preferred languages that we support
      const foundLocale = acceptedLanguages.find(lang =>
        locales.some(locale => locale.startsWith(lang))
      )

      if (foundLocale) {
        // Find the full locale that matches the found language
        const matchedLocale = locales.find(locale =>
          locale.startsWith(foundLocale)
        )

        if (matchedLocale) {
          preferredLocale = matchedLocale
        }
      }
    }

    // If the preferred locale is not the default, redirect to the locale version
    if (preferredLocale !== defaultLocale) {
      // e.g. incoming request is /products
      // redirect to /nl/products if nl is the preferred locale
      return NextResponse.redirect(
        new URL(
          `/${preferredLocale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`,
          request.url
        )
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring _next/ and api/
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
