import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 401 })
    }

    // Token se user verify karo
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const googleEmail = user.email

    // Sirf us user ke students fetch karo
    const { data: students, error } = await supabase
      .from('students')
      .select('full_name, father_name, mobile, class, scholar_id, samagra_id, roll_number')
      .eq('google_id', googleEmail)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    return NextResponse.json({ students: students || [] })

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}