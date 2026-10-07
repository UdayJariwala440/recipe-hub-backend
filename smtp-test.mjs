import nodemailer from 'nodemailer';

const t = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'recipehub22@gmail.com',
    pass: 'sjuj wgsd sscw pvzs',
  },
});

t.verify().then(() => console.log('OK')).catch((e) => console.error(e.message));