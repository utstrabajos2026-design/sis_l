/**
 * config/email.js
 * Configuración profesional de Nodemailer
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// ===============================
// CREAR TRANSPORTADOR SMTP
// ===============================

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ===============================
// VERIFICAR CONEXIÓN SMTP
// ===============================

transporter.verify((error, success) => {
  if (error) {
    console.error('Error SMTP:', error.message);
  } else {
    console.log('Servidor SMTP listo para enviar correos');
  }
});

// ===============================
// FUNCIÓN PRINCIPAL
// ===============================

/**
 * Envía un código de autenticación por email
 * @param {string} correo
 * @param {string} codigo
 * @returns {Promise<boolean>}
 */
async function enviarCodigoAutenticacion(correo, codigo) {
  try {

    // ===============================
    // MODO DESARROLLO
    // ===============================

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`[DEV] Código para ${correo}: ${codigo}`);
      return true;
    }

    // ===============================
    // CONFIGURAR MENSAJE
    // ===============================

    const verifyLink = `${process.env.APP_URL || 'http://localhost:3000'}/pages/verify-email.html?correo=${encodeURIComponent(correo)}`;

    const mailOptions = {
      from: `SIS-L <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Código de autenticación - SIS-L',

      // Texto plano
      text: `
Hola.

Tu código de autenticación es:

${codigo}

Este código expira en 10 minutos.

Si no solicitaste este acceso, ignora este correo.

SIS-L
      `,

      // HTML
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 12px;">

            <h2 style="color: #2c3e50; text-align: center;">
              Código de autenticación
            </h2>

            <p style="color: #555; text-align: center;">
              Sistema SIS-L
            </p>

            <div style="background: #f0f0f0; padding: 25px; border-radius: 10px; text-align: center; margin-top: 25px; margin-bottom: 25px;">
              <h1 style="letter-spacing: 8px; color: #111; margin: 0; font-size: 42px;">
                ${codigo}
              </h1>
            </div>

            <p style="color: #555; text-align: center;">
              Este código expira en <strong>10 minutos</strong>
            </p>

            <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
              <a href="${verifyLink}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Verificar correo
              </a>
            </div>

            <hr style="margin-top: 30px; margin-bottom: 20px; border: none; border-top: 1px solid #ddd;">

            <p style="font-size: 12px; color: #888; text-align: center;">
              Si no solicitaste este código puedes ignorar este correo.
            </p>

          </div>
        </div>
      `
    };

    // ===============================
    // ENVIAR CORREO
    // ===============================

    console.log('DESTINATARIO:', correo);
    const info = await transporter.sendMail(mailOptions);

    // ===============================
    // LOGS DETALLADOS
    // ===============================

    console.log('====================================');
    console.log('CORREO ENVIADO');
    console.log('====================================');
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    console.log('Response:', info.response);
    console.log('====================================');

    return true;

  } catch (error) {

    console.error('====================================');
    console.error('ERROR ENVIANDO EMAIL');
    console.error('====================================');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Comando:', error.command);
    console.error('====================================');

    return false;
  }
}

// ===============================
// ENVIAR LINK DE RECUPERACIÓN
// ===============================

/**
 * Envía un link de recuperación de contraseña por email
 * @param {string} correo
 * @param {string} nombre
 * @param {string} resetLink
 * @returns {Promise<boolean>}
 */
async function enviarLinkRecuperacion(correo, nombre, resetLink) {
  try {

    // ===============================
    // MODO DESARROLLO
    // ===============================

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`[DEV] Link de recuperación para ${correo}:\n${resetLink}`);
      return true;
    }

    // ===============================
    // CONFIGURAR MENSAJE
    // ===============================

    const mailOptions = {
      from: `SIS-L <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: correo,
      subject: 'Recupera tu contraseña - SIS-L',

      // Texto plano
      text: `
Hola ${nombre},

Solicitaste recuperar tu contraseña en SIS-L.

Haz clic en el siguiente link para establecer una nueva contraseña:

${resetLink}

Este link expira en 1 hora.

Si no solicitaste este cambio, ignora este correo y tu contraseña seguirá siendo la misma.

SIS-L
      `,

      // HTML
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 40px; border-radius: 12px;">

            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: bold;">🤟</span>
              <h2 style="color: #2c3e50; margin: 10px 0 0 0;">SIS-L</h2>
            </div>

            <h2 style="color: #2c3e50; text-align: center;">
              Recuperar contraseña
            </h2>

            <p style="color: #555; font-size: 16px;">
              Hola <strong>${nombre}</strong>,
            </p>

            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Recibimos una solicitud para recuperar tu contraseña en SIS-L. 
              Si fue así, haz clic en el botón a continuación para establecer una nueva contraseña.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="
                display: inline-block;
                background: #63FFB4;
                color: #0A0C12;
                padding: 14px 40px;
                border-radius: 100px;
                text-decoration: none;
                font-weight: bold;
                font-size: 16px;
                box-shadow: 0 0 30px rgba(99,255,180,.2);
              ">
                Cambiar contraseña →
              </a>
            </div>

            <p style="color: #888; font-size: 14px; text-align: center;">
              O copia y pega este link en tu navegador:<br>
              <code style="background: #f0f0f0; padding: 8px 12px; border-radius: 4px; word-break: break-all;">
                ${resetLink}
              </code>
            </p>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 25px; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-size: 13px;">
                <strong>⚠️ Seguridad:</strong> Este link expira en <strong>1 hora</strong>. 
                Si no solicitaste esto, ignora este correo.
              </p>
            </div>

            <hr style="margin-top: 30px; margin-bottom: 20px; border: none; border-top: 1px solid #ddd;">

            <p style="font-size: 12px; color: #888; text-align: center;">
              SIS-L © 2024 — Aprende Lengua de Señas Colombiana<br>
              Si tienes preguntas, contacta al soporte.
            </p>

          </div>
        </div>
      `
    };

    // ===============================
    // ENVIAR CORREO
    // ===============================

    console.log('DESTINATARIO:', correo);
    const info = await transporter.sendMail(mailOptions);

    // ===============================
    // LOGS DETALLADOS
    // ===============================

    console.log('====================================');
    console.log('CORREO DE RECUPERACIÓN ENVIADO');
    console.log('====================================');
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    console.log('Response:', info.response);
    console.log('====================================');

    return true;

  } catch (error) {

    console.error('====================================');
    console.error('ERROR ENVIANDO EMAIL DE RECUPERACIÓN');
    console.error('====================================');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('Comando:', error.command);
    console.error('====================================');

    return false;
  }
}

// ===============================
// EXPORTAR
// ===============================

module.exports = {
  enviarCodigoAutenticacion,
  enviarLinkRecuperacion
};
