import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendNewResultEmail(
  to: string,
  patientName: string,
  testName: string,
  testDate: string
) {
  try {
    await resend.emails.send({
      from: 'Blood Work Portal <notifications@bloodworkportal.com>',
      to,
      subject: `New Blood Work Result Available: ${testName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Blood Work Result Available</h2>
          <p>Hello ${patientName},</p>
          <p>A new blood work result is now available in your portal:</p>
          <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
            <p><strong>Test Name:</strong> ${testName}</p>
            <p><strong>Test Date:</strong> ${new Date(testDate).toLocaleDateString()}</p>
          </div>
          <p>Please log in to your portal to view the complete results.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; margin-top: 1rem;">
            View Results
          </a>
          <p style="margin-top: 2rem; font-size: 0.875rem; color: #6b7280;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export async function sendResultUpdatedEmail(
  to: string,
  patientName: string,
  testName: string,
  testDate: string
) {
  try {
    await resend.emails.send({
      from: 'Blood Work Portal <notifications@bloodworkportal.com>',
      to,
      subject: `Blood Work Result Updated: ${testName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Blood Work Result Updated</h2>
          <p>Hello ${patientName},</p>
          <p>Your blood work result has been updated:</p>
          <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
            <p><strong>Test Name:</strong> ${testName}</p>
            <p><strong>Test Date:</strong> ${new Date(testDate).toLocaleDateString()}</p>
          </div>
          <p>Please log in to your portal to view the updated results.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer/dashboard" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; margin-top: 1rem;">
            View Results
          </a>
          <p style="margin-top: 2rem; font-size: 0.875rem; color: #6b7280;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
} 