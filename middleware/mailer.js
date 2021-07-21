const nodemailer = require('nodemailer');

module.exports = (email, message, subject, html) => {
  var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: 'insta-clone@hotmail.com',
      pass: 'instaclone321',
    },
  });

  var mailOptions = {
    from: 'testdevelopment11111@outlook.com',
    to: email,
    subject: `${subject}`,
    text: `${message}`,
    html: `${html}`,
  };
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log('Email sent to ' + info.response);
    }
  });
};
