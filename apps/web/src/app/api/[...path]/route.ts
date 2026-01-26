import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_INTERNAL_URL || 'http://app-quantify-redundant-card-8ip7bw:3001'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params
  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${API_BASE_URL}/${path}${searchParams ? '?' + searchParams : ''}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from API' },
      { status: 500 }
    )
  }
}
