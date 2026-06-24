import { NextResponse } from 'next/server'
import { computeVelocityScore } from '../../../lib/velocity'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const postsPerHour = parseInt(searchParams.get('postsPerHour') || '0', 10)
  const avgPosts24h = parseInt(searchParams.get('avgPosts24h') || '0', 10)

  const result = computeVelocityScore(postsPerHour, avgPosts24h)
  return NextResponse.json({ success: true, data: result })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const postsPerHour = parseInt(body.postsPerHour || '0', 10)
    const avgPosts24h = parseInt(body.avgPosts24h || '0', 10)

    const result = computeVelocityScore(postsPerHour, avgPosts24h)
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
