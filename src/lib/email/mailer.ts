import nodemailer, { type Transporter } from 'nodemailer'

let cachedTransporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !port || !user || !pass) {
    return null
  }

  const portNumber = Number(port)
  if (!Number.isFinite(portNumber)) {
    return null
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: portNumber,
    secure: portNumber === 465,
    auth: { user, pass },
  })

  return cachedTransporter
}

export type SendMailOptions = {
  to: string[]
  subject: string
  html: string
  text?: string
}

export async function sendMail({ to, subject, html, text }: SendMailOptions): Promise<boolean> {
  if (!to.length) return false

  const transporter = getTransporter()
  if (!transporter) {
    console.warn('[mailer] SMTP not configured, skipping email:', subject)
    return false
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  if (!from) return false

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    })
    return true
  } catch (err) {
    console.error('[mailer] Failed to send email:', err)
    return false
  }
}
