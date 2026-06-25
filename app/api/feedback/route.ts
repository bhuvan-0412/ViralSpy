import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return null
  }
  return createClient(url, key)
}

const getResend = () => {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
}

export async function POST(req: Request) {
  const body = await req.json()

  const supabase = getSupabase()
  let data = null

  if (supabase) {
    const { data: insertData, error } = await supabase.from('feedback').insert([body])
    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
    data = insertData
  } else {
    console.warn('[feedback] Supabase client not initialized, skipped database save.')
  }

  // 2. Send email notification — wrapped so a failure never blocks the user
  const resend = getResend()
  if (resend) {
    try {
      await resend.emails.send({
        from: 'ViralSpy Feedback <onboarding@resend.dev>',
        to: 'thotabhuvan@gmail.com',
        subject: `New Feedback from ${body.user_name || 'Anonymous'}`,
        html: `
          <h2>New ViralSpy Feedback</h2>
          <table border="1" cellpadding="8" style="border-collapse:collapse">
            <tr><td><b>Name</b></td><td>${body.user_name || '—'}</td></tr>
            <tr><td><b>Email</b></td><td>${body.user_email || '—'}</td></tr>
            <tr><td><b>Overall Experience</b></td><td>${body.overall_experience || '—'}</td></tr>
            <tr><td><b>Design Rating</b></td><td>${body.design_rating || '—'}</td></tr>
            <tr><td><b>Brief Quality</b></td><td>${body.brief_quality || '—'}</td></tr>
            <tr><td><b>Navigation</b></td><td>${body.navigation_ease || '—'}</td></tr>
            <tr><td><b>Loading Speed</b></td><td>${body.loading_speed || '—'}</td></tr>
            <tr><td><b>Technical Issues</b></td><td>${body.technical_issues || '—'}</td></tr>
            <tr><td><b>Trend Data Usefulness</b></td><td>${body.trend_data_usefulness || '—'}</td></tr>
            <tr><td><b>Mobile Experience</b></td><td>${body.mobile_experience || '—'}</td></tr>
            <tr><td><b>Device Used</b></td><td>${body.device_used || '—'}</td></tr>
            <tr><td><b>Would Recommend</b></td><td>${body.recommend_likelihood || '—'}</td></tr>
            <tr><td><b>Visit Again</b></td><td>${body.visit_again || '—'}</td></tr>
            <tr><td><b>Overall Satisfaction</b></td><td>${body.overall_satisfaction || '—'}</td></tr>
            <tr><td><b>Improvement Area</b></td><td>${body.improvement_area || '—'}</td></tr>
            <tr><td><b>Suggestions</b></td><td>${body.suggestions || '—'}</td></tr>
            <tr><td><b>Submitted At</b></td><td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
          </table>
        `,
      })
    } catch (emailErr: any) {
      // Log but don't fail — feedback is already saved
      console.error('[feedback] email send failed:', emailErr.message)
    }
  } else {
    console.warn('[feedback] Resend API key missing, skipped email send')
  }

  return Response.json({ data, success: true })
}
