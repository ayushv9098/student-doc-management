import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const feeAppUrl = process.env.FEE_APP_SUPABASE_URL
    const feeAppKey = process.env.FEE_APP_SUPABASE_SERVICE_KEY
    const studentAppUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const studentAppKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!feeAppUrl || !feeAppKey || !studentAppUrl || !studentAppKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const feeSupabase = createClient(feeAppUrl, feeAppKey)

    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await feeSupabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const studentSupabase = createClient(studentAppUrl, studentAppKey)

    const { data: students, error } = await studentSupabase
      .from('students')
      .select('full_name, father_name, mobile, class, scholar_id, samagra_id, roll_number')
      .eq('google_id', user.email)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    return NextResponse.json({ students: students || [] })

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  })
}