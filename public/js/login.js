/**
 * login.js  —  Lógica exclusiva de la página de login/registro
 */

// Si ya tiene sesión, redirigir al inicio
if (localStorage.getItem('sis_l_token')) {
  window.location.href = '/index.html';
}

// ── Cambiar entre pestañas Login / Registro / Autenticación ───────────
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((t, i) =>
    t.classList.toggle('active', 
      (i === 0 && tab === 'login') || 
      (i === 1 && tab === 'registro')
    )
  );
  document.getElementById('sec-login').classList.toggle('active',        tab === 'login');
  document.getElementById('sec-registro').classList.toggle('active',     tab === 'registro');
  document.getElementById('sec-recuperacion').classList.toggle('active',  tab === 'recuperacion');
  hideMessages();
  
  if (tab === 'login') {
    document.getElementById('cardTitle').textContent = 'Bienvenido';
    document.getElementById('cardSub').textContent   = 'Ingresa con tu cuenta para continuar aprendiendo.';
  } else if (tab === 'registro') {
    document.getElementById('cardTitle').textContent = 'Crear cuenta';
    document.getElementById('cardSub').textContent   = 'Regístrate para guardar tu progreso en la BD.';

  } else if (tab === 'recuperacion') {
    document.getElementById('cardTitle').textContent = 'Recuperar contraseña';
    document.getElementById('cardSub').textContent   = 'Te enviaremos un link para cambiar tu contraseña.';
  }
}

// ── Cambiar a la sección de recuperación desde el link ────────────────
function switchToRecuperacion() {
  switchTab('recuperacion');
}

// ── Mostrar / ocultar mensajes ────────────────────────
function showError(msg) {
  const e = document.getElementById('errorMsg');
  e.textContent = msg;
  e.style.display = 'block';
  document.getElementById('successMsg').style.display = 'none';
}
function showSuccess(msg) {
  const s = document.getElementById('successMsg');
  s.textContent = msg;
  s.style.display = 'block';
  document.getElementById('errorMsg').style.display = 'none';
}
function hideMessages() {
  document.getElementById('errorMsg').style.display   = 'none';
  document.getElementById('successMsg').style.display = 'none';
}

// ── Login ─────────────────────────────────────────────
async function doLogin() {
  const btn    = document.getElementById('btnLogin');
  const correo = document.getElementById('loginCorreo').value.trim();
  const pass   = document.getElementById('loginPass').value;
  if (!correo || !pass) return showError('Completa todos los campos');

  btn.disabled = true; btn.textContent = 'Ingresando…';
  const data = await API.Auth.login(correo, pass);
  btn.disabled = false; btn.textContent = 'Entrar →';

  if (!data || !data.ok) return showError(data?.error || 'Correo o contraseña incorrectos');
  showSuccess('¡Bienvenido ' + data.usuario.nombre + '! Redirigiendo…');
  setTimeout(() => {
    const destino = localStorage.getItem('sis_l_redirect') || '/index.html';
    localStorage.removeItem('sis_l_redirect');
    window.location.href = destino;
  }, 1000);
}

// ── Registro ──────────────────────────────────────────
async function doRegistro() {
  const btn   = document.getElementById('btnReg');
  const datos = {
    nombre:     document.getElementById('regNombre').value.trim(),
    apellido:   document.getElementById('regApellido').value.trim(),
    documento:  document.getElementById('regDoc').value.trim(),
    correo:     document.getElementById('regCorreo').value.trim(),
    contrasena: document.getElementById('regPass').value,
    rol:        document.getElementById('regRol').value,
  };
  if (!datos.nombre || !datos.apellido || !datos.documento || !datos.correo || !datos.contrasena)
    return showError('Completa todos los campos');
  if (datos.contrasena.length < 6)
    return showError('La contraseña debe tener mínimo 6 caracteres');

  btn.disabled = true; btn.textContent = 'Creando cuenta…';
  const data = await API.Auth.registro(datos);
  btn.disabled = false; btn.textContent = 'Crear cuenta →';

  if (!data || !data.ok) return showError(data?.error || 'Error al registrarse');
  
  // Mostrar mensaje de "cuenta casi creada"
  showSuccess('¡Cuenta creada! Enviando código de autenticación…');
  
  // Enviar código de autenticación
  setTimeout(async () => {
    const codData = await API.Auth.enviarCodigoAutenticacion(datos.correo);
    if (!codData || !codData.ok) {
      return showError(codData?.error || 'Error al enviar el código de autenticación');
    }
    
    // Redirigir a la página de verificación
    window.location.href = '/pages/verify-email.html?correo=' + encodeURIComponent(datos.correo);
  }, 1500);
}

// ── Autenticación por correo ──────────────────────────
async function doEnviarCodigo() {
  const btn    = document.getElementById('btnEnviarCodigo');
  const correo = document.getElementById('authCorreo').value.trim();
  
  if (!correo) return showError('Ingresa tu correo electrónico');
  
  btn.disabled = true; btn.textContent = 'Enviando…';
  
  // Llamada a la API para enviar el código
  const data = await API.Auth.enviarCodigoAutenticacion(correo);
  
  btn.disabled = false; btn.textContent = 'Enviar código de autenticación →';
  
  if (!data || !data.ok) return showError(data?.error || 'Error al enviar el código');
  showSuccess('¡Código enviado a ' + correo + '! Revisa tu bandeja de entrada.');
}

// ── Enviar código de autenticación desde Registro ────────
async function doEnviarCodigoRegistro() {
  const btn    = document.getElementById('btnEnviarCodigoRegistro');
  const correo = document.getElementById('regCorreo').value.trim();
  
  if (!correo) return showError('Ingresa tu correo electrónico');
  
  btn.disabled = true; btn.textContent = 'Enviando…';
  
  // Llamada a la API para enviar el código
  const data = await API.Auth.enviarCodigoAutenticacion(correo);
  
  btn.disabled = false; btn.textContent = 'Autenticar correo';
  
  if (!data || !data.ok) return showError(data?.error || 'Error al enviar el código');
  showSuccess('¡Código enviado a ' + correo + '! Revisa tu bandeja de entrada.');
}

// ── Solicitar recuperación de contraseña ──────────────
async function doSolicitarRecuperacion() {
  const btn    = document.getElementById('btnSolicitarRecuperacion');
  const correo = document.getElementById('recupCorreo').value.trim();
  
  if (!correo) return showError('Ingresa tu correo electrónico');
  
  btn.disabled = true; btn.textContent = 'Enviando…';
  
  // Llamada a la API para solicitar recuperación
  const data = await API.Auth.solicitarRecuperacion(correo);
  
  btn.disabled = false; btn.textContent = 'Enviar link de recuperación →';
  
  if (!data || !data.ok) return showError(data?.error || 'Error al solicitar recuperación');
  showSuccess('¡Link de recuperación enviado! Revisa tu bandeja de entrada.');
  setTimeout(() => switchTab('login'), 3000);
}