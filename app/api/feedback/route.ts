import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()

  // 1. Save feedback to Supabase
  const { data, error } = await supabase
    .from('feedback')
    .insert([body])

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  // 2. Send email notification — wrapped so a failure never blocks the user
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
      `
    })
  } catch (emailErr: any) {
    // Log but don't fail — feedback is already saved
    console.error('[feedback] email send failed:', emailErr.message)
  }

  return Response.json({ data, success: true })
}
