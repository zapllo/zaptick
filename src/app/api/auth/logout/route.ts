import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the token cookie
  response.cookies.set({
    name: 'token',
    value: '',
    maxAge: 0,
    path: '/',
  });

  return response;
}
