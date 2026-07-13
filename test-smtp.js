require('dotenv').config()
const nodemailer = require('nodemailer')

async function main() {
  console.log('Testing SMTP with user:', process.env.SMTP_USER)
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  try {
    await transport.verify()
    console.log('SMTP connection verified successfully')
    const info = await transport.sendMail({
      to: process.env.SMTP_USER,
      from: process.env.SMTP_USER,
      subject: 'Test email from STOREFRONT OS debug script',
      text: 'If you got this, SMTP credentials work fine.',
    })
    console.log('Test email sent:', info.messageId)
  } catch (err) {
    console.error('SMTP TEST FAILED:')
    console.error(err)
  }
}

main()
