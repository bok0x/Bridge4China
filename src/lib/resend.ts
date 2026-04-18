import { Resend } from 'resend'

// Lazy singleton — only instantiated at runtime when RESEND_API_KEY is available
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
  }
  return _resend
}
