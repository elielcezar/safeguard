import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendTwoFactorCode(email, code) {
  try {
    await transporter.sendMail({
      from: `"SafeGuard" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Código de verificação — SafeGuard',
      text: `Seu código de verificação é: ${code}\n\nVálido por 10 minutos. Se você não solicitou este código, ignore este e-mail.`,
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px">
          <h2 style="margin-bottom:8px">Código de verificação</h2>
          <p style="color:#444">Use o código abaixo para concluir seu login no SafeGuard:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:10px;text-align:center;padding:24px;background:#f4f4f5;border-radius:8px;margin:24px 0">
            ${code}
          </div>
          <p style="color:#888;font-size:13px">Válido por 10 minutos. Se você não solicitou este código, ignore este e-mail.</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('[ERRO] Falha ao enviar e-mail 2FA:', error.message);
    return false;
  }
}
