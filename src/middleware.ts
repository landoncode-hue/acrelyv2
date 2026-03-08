import { type NextRequest, NextResponse } from "next/server";
import { getOrCreateCorrelationId } from "@/lib/correlation";
import { checkRateLimit } from "@/lib/rate-limit";
import { jwtVerify } from 'jose';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-in-production-min-64-chars-long-xxxxxxxxxxxxxxxxxxxxxxxxx'
);

export async function middleware(request: NextRequest) {
  return await proxy(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export async function proxy(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    const origin = request.headers.get('origin');

    // --- CORS CONFIGURATION ---
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : process.env.NODE_ENV === 'production'
        ? ['https://acrely.pinnaclegroups.ng', 'https://www.acrely.pinnaclegroups.ng']
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001'];

    // Helper to apply CORS headers
    const applyCorsHeaders = (res: NextResponse) => {
      if (origin && allowedOrigins.includes(origin)) {
        res.headers.set('Access-Control-Allow-Origin', origin);
        res.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
        res.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
        res.headers.set('Access-Control-Allow-Credentials', 'true');
      }
    };

    // Handle Preflight OPTIONS requests immediately
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      applyCorsHeaders(response);
      return response;
    }

    // Generate or extract correlation ID for request tracing
    const correlationId = getOrCreateCorrelationId(request);

    // Skip middleware for static files, API routes, and Next.js internals
    if (
      path.startsWith('/_next') ||
      path.startsWith('/api/health') || // Health check bypass
      path.startsWith('/static') ||
      path.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
    ) {
      const res = NextResponse.next();
      applyCorsHeaders(res);
      return res;
    }

    // Rate Limiting (Guard API and Dashboard)
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Only limit non-static, non-internal paths if not already skipped
    if (!checkRateLimit(ip)) {
      if (path.startsWith('/api')) {
        return new NextResponse(
          JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Inject correlation ID into response headers
    response.headers.set('x-correlation-id', correlationId);

    // Apply CORS headers to actual response
    applyCorsHeaders(response);

    // Decode JWT from session cookie
    let user: { id: string } | null = null;
    let profile: { role: string; is_staff: boolean; email_verified: boolean } | null = null;

    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionToken) {
      try {
        const { payload } = await jwtVerify(sessionToken, JWT_SECRET, { issuer: 'acrely' });
        user = { id: payload.sub as string };
        profile = {
          role: payload.role as string,
          is_staff: payload.is_staff as boolean,
          email_verified: payload.email_verified as boolean ?? false, // Read from JWT
        };
      } catch {
        // Token invalid or expired — treat as unauthenticated
        user = null;
        profile = null;
      }
    }

    // --- MAINTENANCE MODE CHECK ---
    const isMaintenancePage = path === '/maintenance';
    const isSysAdmin = profile?.role === 'sysadmin';
    const isStatic = path.startsWith('/_next') || path.startsWith('/static') || path.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/);

    if (!isStatic && !isMaintenancePage && !isSysAdmin) {
      // Mock maintenance
      const maintenanceSetting = { value: { enabled: false } };

      if (maintenanceSetting?.value?.enabled) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }

    // 1. Protected Routes (require User)
    if (path.startsWith("/dashboard") || path.startsWith("/portal") || path.startsWith("/api/protected") || path.startsWith("/api/staff") || path.startsWith("/api/reports")) {
      if (!user) {
        if (path.startsWith("/api")) {
          return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Login required' } }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Check email verification for staff
      if (profile && profile.is_staff && !profile.email_verified && !path.startsWith("/verify")) {
        return NextResponse.redirect(new URL("/verify", request.url));
      }

      // Role-based routing
      if (profile) {
        // Dashboard access
        if (path.startsWith("/dashboard") && !profile.is_staff && profile.role !== 'agent') {
          return NextResponse.redirect(new URL("/portal", request.url));
        }

        // Staff Management
        if (path.startsWith("/dashboard/staff") || path.startsWith("/api/staff")) {
          const allowedRoles = ['sysadmin', 'ceo', 'md'];
          if (!allowedRoles.includes(profile.role)) {
            console.warn(`[MIDDLEWARE] RBAC Denied: User role '${profile.role}' attempted to access ${path}`);
            if (path.startsWith("/api/")) {
              return NextResponse.json({ error: "Access Denied" }, { status: 403 });
            }
            return NextResponse.redirect(new URL("/unauthorized", request.url));
          }
        }

        // Reports Management
        if (path.startsWith("/dashboard/reports") || path.startsWith("/api/reports")) {
          const allowedRoles = ['sysadmin', 'ceo', 'md'];
          if (!allowedRoles.includes(profile.role)) {
            if (path.startsWith("/api/")) {
              return NextResponse.json({ error: "Access Denied" }, { status: 403 });
            }
            return NextResponse.redirect(new URL("/unauthorized", request.url));
          }
        }
      } else if (user) {
        // User exists but profile not found? Log and redirect to portal as safest fallback
        console.error(`[MIDDLEWARE] Profile missing for user ${user.id} at path ${path}`);
        if (!path.startsWith("/portal")) {
          // return NextResponse.redirect(new URL("/portal", request.url));
        }
      }
    }

    if (profile && path.startsWith("/portal")) {
      if (profile.is_staff) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Auth Routes redirect for logged in users
    if ((path.startsWith("/login") || path.startsWith("/apply")) && user) {
      if (profile?.is_staff || profile?.role === 'agent') {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
    }

    // Special handling for /verify to avoid loops
    if (path.startsWith("/verify") && user) {
      if (profile?.email_verified) {
        return NextResponse.redirect(new URL(profile.is_staff ? "/dashboard" : "/portal", request.url));
      }
      // If not verified, stay on /verify (don't let the next block redirect to dashboard)
      return response;
    }

    // Root redirect
    if (path === "/" && user) {
      if (profile?.is_staff || profile?.role === 'agent') {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
    }

    // Store role in cookie if available
    if (profile) {
      response.cookies.set('user-role', profile.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('[MIDDLEWARE ERROR]:', error);
    return NextResponse.next();
  }
}
