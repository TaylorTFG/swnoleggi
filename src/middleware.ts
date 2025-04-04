import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Non facciamo nulla qui, lasciamo che NextAuth gestisca l'autenticazione
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    // Proteggi tutte le rotte tranne quelle pubbliche
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
}; 