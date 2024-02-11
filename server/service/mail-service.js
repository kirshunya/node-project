const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendActivationMail(to, code) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "LuxuryGames",
      text: "",
      html: `
        <div>
            <h1>activate accaunt 24loto.com</h1>
            <h2>code: <b> ${code}</b> </h2>
        </div>
      `,
    });
  }

  async sendResetPasswordLetter(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Смена пароля LuxaryGames",
      text: "",
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Смена пароля!</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f1f1f1;
            }
            .container {
              max-width: 440px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #cccccc;
            }
            h1 {
              color: #007bff;
            }
            p {
              color: #333333;
            }
      
            .letter-main-logo {
              align-self: center;
              width: 230px;
              height: 65px;
              margin: 0 auto;
              margin-bottom: 10px;
            }
      
            .letter-body {
              padding: 20px 10px;
              border-radius: 10px;
              border: 1px solid #7d06d2;
              background: #fff;
            }
      
            .letter-body {
              background-color: #8e0238;
            }
      
            .letter-body__main {
            }
            .letter__title {
              font-size: 26px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
              color: #f2f2f2;
              text-align: center;
              margin-bottom: 30px;
            }
      
            .letter__title span {
              color: #e7d75b;
              font-size: 26px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
            }
      
            .letter__text {
              color: #f2f2f2;
              text-align: center;
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              margin-bottom: 30px;
            }
      
            .letter__text a {
              color: #ecd83c;
            }
      
            .letter__link {
              color: #fff !important;
              font-size: 22px;
              font-style: normal;
              font-weight: 500;
              line-height: normal;
              border-radius: 10px;
              background: #797ecd;
              text-align: center;
              padding: 5px 10px;
              text-decoration: none;
              max-width: 200px;
              align-self: center;
              display: block;
              margin: 0 auto;
              margin-bottom: 10px;
            }
      
            .letter__alert {
              color: #ff3030;
              text-align: center;
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              margin-bottom: 30px;
            }
      
            .letter-body__footer {
              /* border-top: 1px solid #797ecd; */
            }
      
            .letter-body__footer .letter__text {
              margin-bottom: 0px;
              color: #e7d75b;
              font-size: 14px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
              margin-top: 20px;
              margin-bottom: 0;
              text-align: center;
            }
            .letter-body__footer .letter__text {
              margin-bottom: 0px;
              color: #e7d75b;
              font-size: 14px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
              margin-top: 20px;
              margin-bottom: 0;
              text-align: center;
            }
            .letter__info {
              color: #000;
              text-align: center;
              font-size: 12px;
              font-style: normal;
              font-weight: 500;
              line-height: normal;
              margin-bottom: 10px;
            }
            .letter__copirighting {
              color: #000;
              text-align: center;
              font-size: 14px;
              font-style: normal;
              font-weight: 500;
              line-height: normal;
            }
      
            .letter__box {
              margin-bottom: 5px;
            }
      
            .letter__label {
              font-size: 12px;
              color: #fff;
              margin-bottom: 4px;
              margin-left: 5px;
            }
      
            .letter__email {
              background-color: #7f0232;
              border: 1px solid #ffffff36;
              border-radius: 20px;
              padding: 10px 10px;
              color: #fff;
              text-align: center;
              cursor: pointer;
            }
            .letter__username {
              background-color: #7f0232;
              border: 1px solid #ffffff36;
              border-radius: 20px;
              padding: 10px 10px;
              color: #fff;
              text-align: center;
              cursor: pointer;
            }
            .letter__password {
              background-color: #7f0232;
              border: 1px solid #ffffff36;
              border-radius: 20px;
              padding: 10px 10px;
              color: #fff;
              text-align: center;
              cursor: pointer;
            }
            .letter__logo-img {
              max-width: 200px;
              margin: 0 auto;
            }
            .letter__logo-img img {
              max-width: 200px;
            }
            .change-pass-button {
              background: linear-gradient(180deg, #88143f 0%, #780d35 100%);
              border: 1px solid #fff;
              display: block;
              margin-top: 15px;
              padding: 10px 20px;
              background-color: #007bff;
              color: #fff !important;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="letter-body">
              <div class="letter-body__main">
                <div class="letter__logo-img">
                  <img src="https://24loto.com/img/logo.png" alt="logo" />
                </div> 
                <h2 class="letter__title">
                  Смена пароля на <span>LuxaryGames</span>
                </h2>
                <p class="letter__text">
                  Для смены пароля на <a>${process.env.CLIENT_URL}</a> нажмите кнопку
                  внизу
                </p>
      
                <a class="change-pass-button" href="${link}">Сменить пароль</a>
              </div>
              <div class="letter-body__footer">
                <div class="letter__text">
                  Если вы не отправляли это письмо проигнорируйте его и не давайте
                  свой пароль третим лицам!
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
      `,
    });
  }

  async sendRegistrationMail(to, username, password) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "LuxuryGames",
      text: "",
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Аккаунт зарегистрирован!</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f1f1f1;
            }
            .container {
              max-width: 440px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border: 1px solid #cccccc;
            }
            h1 {
              color: #007bff;
            }
            p {
              color: #333333;
            }

            .letter-main-logo {
              align-self: center;
              width: 230px;
              height: 65px;
              margin: 0 auto;
              margin-bottom: 10px;
            }

            .letter-body {
              padding: 20px 10px;
              border-radius: 10px;
              border: 1px solid #7d06d2;
              background: #fff;
            }

            .letter-body {
              background-color: #8e0238;
            }

            .letter-body__main {
            }
            .letter__title {
              font-size: 26px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
              color: #f2f2f2;
              text-align: center;
              margin-bottom: 30px;
            }

            .letter__title span {
              color: #e7d75b;
              font-size: 26px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
            }

            .letter__text {
              color: #f2f2f2;
              text-align: center;
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              margin-bottom: 30px;
            }

            .letter__link {
              color: #fff !important;
              font-size: 22px;
              font-style: normal;
              font-weight: 500;
              line-height: normal;
              border-radius: 10px;
              background: #797ecd;
              text-align: center;
              padding: 5px 10px;
              text-decoration: none;
              max-width: 200px;
              align-self: center;
              display: block;
              margin: 0 auto;
              margin-bottom: 10px;
            }

            .letter__alert {
              color: #ff3030;
              text-align: center;
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              line-height: normal;
              margin-bottom: 30px;
            }

            .letter-body__footer {
              /* border-top: 1px solid #797ecd; */
            }

            .letter-body__footer .letter__text {
              margin-bottom: 0px;
              color: #e7d75b;
              font-size: 26px;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
              margin-top: 20px;
              margin-bottom: 0;
              text-align: center;
            }
            .letter__info {
              color: #000;
              text-align: center;
              font-size: 12px;
              font-style: normal;
              font-weight: 500;
              line-height: normal;
              margin-bottom: 10px;
            }
            .letter__copirighting {
              color: #000;
              text-align: center;
              font-size: 14px;
              font-style: normal;
              font-weight: 500;
              line-height: normal;
            }

            .letter__box {
              margin-bottom: 5px;
            }

            .letter__label {
              font-size: 12px;
              color: #fff;
              margin-bottom: 4px;
              margin-left: 5px;
            }

            .letter__email {
              background-color: #7f0232;
              border: 1px solid #ffffff36;
              border-radius: 20px;
              padding: 10px 10px;
              color: #fff;
              text-align: center;
              cursor: pointer;
            }
            .letter__username {
              background-color: #7f0232;
              border: 1px solid #ffffff36;
              border-radius: 20px;
              padding: 10px 10px;
              color: #fff;
              text-align: center;
              cursor: pointer;
            }

            .letter__password {
              background-color: #7f0232;
              border: 1px solid #ffffff36;
              border-radius: 20px;
              padding: 10px 10px;
              color: #fff;
              text-align: center;
              cursor: pointer;
            }
            .letter__logo-img {
              max-width: 200px;
              margin: 0 auto;
            }
            .letter__logo-img img {
              max-width: 200px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="letter-body">
              <div class="letter-body__main">
                <div class="letter__logo-img">
                  <img src="https://24loto.com/img/logo.png" alt="logo" />
                </div> 
                <h2 class="letter__title">
                  Ви зарегистрировали аккаунт на <span>LuxaryGames</span>
                </h2>
                <p class="letter__text">
                  Спасибо за регистрацию аккаунта на нашем сайте! <br />
                  <b>Ваши дание для входа:</b>
                </p>
                <div class="letter__box">
                  <div class="letter__label">Username:</div>
                  <div class="letter__username"><b>${username}</b></div>
                </div>
                <div class="letter__box">
                  <div class="letter__label">Пароль:</div>
                  <div class="letter__password"><b>${password}</b></div>
                </div>
              </div>
              <div class="letter-body__footer">
                <div class="letter__text">Приятной игры!</div>
              </div>
            </div>
          </div>
        </body>
      </html>
      `,
    });
  }
}

module.exports = new MailService();
