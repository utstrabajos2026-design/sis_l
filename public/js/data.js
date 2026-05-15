/**
 * data.js  —  Datos de señas LSC para el módulo de aprendizaje
 * Fuente de verdad única usada por lecciones, práctica y quizzes.
 * Arquitectura MVW: este archivo es parte de la capa MODEL (datos).
 */

window.LSC_DATA = {

  // ─────────────────────────────────────────
  // ALFABETO DACTILOLÓGICO
  // ─────────────────────────────────────────
  alfabeto: [
    { letra:'A', emoji:'✊', desc:'Puño cerrado, pulgar al lado.', tip:'El pulgar queda apoyado sobre los dedos cerrados.' },
    { letra:'B', emoji:'🖐', desc:'Cuatro dedos juntos y pulgar doblado hacia la palma.', tip:'Dedos extendidos y juntos, mano vertical.' },
    { letra:'C', emoji:'🤏', desc:'Los dedos forman una "C" abierta.', tip:'Como si fueras a agarrar un vaso grande.' },
    { letra:'D', emoji:'👆', desc:'Índice extendido, demás dedos cerrados tocando el pulgar.', tip:'La forma circular que crean los otros dedos representa la letra D.' },
    { letra:'E', emoji:'🤌', desc:'Todos los dedos doblados hacia la palma.', tip:'El pulgar se mete debajo de los cuatro dedos.' },
    { letra:'F', emoji:'👌', desc:'Pulgar e índice forman un círculo, demás dedos extendidos.', tip:'Similar al símbolo OK.' },
    { letra:'G', emoji:'👉', desc:'Índice y pulgar extendidos horizontalmente.', tip:'Como señalar hacia un lado.' },
    { letra:'H', emoji:'✌️', desc:'Índice y corazón extendidos horizontalmente.', tip:'Dedos apuntando hacia el lado, no arriba.' },
    { letra:'I', emoji:'🤙', desc:'Meñique extendido, demás dedos cerrados.', tip:'Solo el meñique apunta hacia arriba.' },
    { letra:'J', emoji:'🤙', desc:'Meñique extendido, se traza una "J" en el aire.', tip:'Mueve la mano para trazar la forma de la letra.' },
    { letra:'K', emoji:'✌️', desc:'Índice y corazón extendidos, pulgar entre ellos.', tip:'El pulgar toca el corazón desde abajo.' },
    { letra:'L', emoji:'🤙', desc:'Índice hacia arriba y pulgar horizontal.', tip:'Forman un ángulo de 90°, como la letra L.' },
    { letra:'M', emoji:'✊', desc:'Pulgar debajo de índice, corazón y anular.', tip:'Tres dedos sobre el pulgar.' },
    { letra:'N', emoji:'✊', desc:'Pulgar debajo de índice y corazón.', tip:'Dos dedos sobre el pulgar.' },
    { letra:'Ñ', emoji:'🤘', desc:'Como la N con un movimiento ondulante.', tip:'Añade un giro de muñeca a la seña N.' },
    { letra:'O', emoji:'👌', desc:'Todos los dedos forman un círculo.', tip:'Como si sostuvieras una pelota pequeña.' },
    { letra:'P', emoji:'👇', desc:'Índice apuntando hacia abajo, pulgar extendido.', tip:'La mano en posición K pero hacia abajo.' },
    { letra:'Q', emoji:'👇', desc:'Índice y pulgar apuntando hacia abajo.', tip:'Como la G pero orientada hacia el suelo.' },
    { letra:'R', emoji:'🤞', desc:'Índice y corazón cruzados.', tip:'Dedos cruzados como al pedir suerte.' },
    { letra:'S', emoji:'✊', desc:'Puño cerrado con pulgar sobre los dedos.', tip:'Similar a A pero el pulgar va encima.' },
    { letra:'T', emoji:'👊', desc:'Pulgar entre índice y corazón.', tip:'El pulgar sale entre los dos primeros dedos.' },
    { letra:'U', emoji:'✌️', desc:'Índice y corazón juntos y extendidos.', tip:'Los dedos completamente pegados, apuntando arriba.' },
    { letra:'V', emoji:'✌️', desc:'Índice y corazón extendidos en V.', tip:'Separados y apuntando arriba, como la victoria.' },
    { letra:'W', emoji:'🖐', desc:'Índice, corazón y anular extendidos y separados.', tip:'Tres dedos haciendo W.' },
    { letra:'X', emoji:'☝️', desc:'Índice extendido y doblado hacia adentro.', tip:'El índice se curva como un gancho.' },
    { letra:'Y', emoji:'🤙', desc:'Pulgar y meñique extendidos.', tip:'Como el símbolo de surfista / llámame.' },
    { letra:'Z', emoji:'☝️', desc:'Índice extendido, se traza una Z en el aire.', tip:'Dibuja la Z en el espacio frente a ti.' },
  ],

  // ─────────────────────────────────────────
  // SALUDOS
  // ─────────────────────────────────────────
  saludos: [
    { word:'HOLA',         emoji:'👋', desc:'Mano abierta, se agita suavemente a los lados.',  tip:'Movimiento natural y relajado como al saludar.' },
    { word:'ADIÓS',        emoji:'🖐', desc:'Mano abierta se abre y cierra varias veces.',      tip:'Dedos juntos y se doblan repetidamente.' },
    { word:'GRACIAS',      emoji:'🙏', desc:'Mano abierta toca la barbilla y se extiende.',     tip:'Como lanzar un beso desde la boca.' },
    { word:'POR FAVOR',    emoji:'🤲', desc:'Palma plana hace un círculo en el pecho.',          tip:'Movimiento circular en el centro del pecho.' },
    { word:'LO SIENTO',    emoji:'✊', desc:'Puño cerrado gira sobre el corazón.',               tip:'Pequeños círculos sobre el esternón.' },
    { word:'SÍ',           emoji:'☝️', desc:'Puño cerrado asiente (arriba-abajo).',              tip:'Imita el movimiento de la cabeza al decir sí.' },
    { word:'NO',           emoji:'✌️', desc:'Índice y corazón extendidos, se cierran al pulgar.', tip:'Dos dedos que cierran como tijeras.' },
    { word:'¿CÓMO ESTÁS?', emoji:'🤷', desc:'Ambas manos abiertas se mueven alternativamente.',tip:'Giro de muñecas con palmas hacia arriba.' },
    { word:'BIEN',         emoji:'👍', desc:'Pulgar hacia arriba.',                              tip:'El clásico gesto de aprobación.' },
    { word:'MAL',          emoji:'👎', desc:'Pulgar hacia abajo.',                               tip:'Opuesto al gesto de BIEN.' },
    { word:'MI NOMBRE ES', emoji:'🏷', desc:'Señalar al propio pecho luego deletrear nombre.',  tip:'Índice apunta al pecho primero.' },
    { word:'MUCHO GUSTO',  emoji:'🤝', desc:'Ambas manos se frotan suavemente.',                tip:'Como lavarse las manos lentamente.' },
  ],

  // ─────────────────────────────────────────
  // NÚMEROS
  // ─────────────────────────────────────────
  numeros: [
    { word:'0', emoji:'👌', desc:'Todos los dedos forman un O.',         tip:'Como la letra O del alfabeto.' },
    { word:'1', emoji:'☝️', desc:'Solo el índice extendido.',             tip:'El clásico "uno" con el dedo.' },
    { word:'2', emoji:'✌️', desc:'Índice y corazón extendidos.',          tip:'Señal de la paz / victoria.' },
    { word:'3', emoji:'🤟', desc:'Pulgar, índice y corazón extendidos.',  tip:'Tres dedos desde el lado del pulgar.' },
    { word:'4', emoji:'🖐', desc:'Cuatro dedos extendidos (sin pulgar).', tip:'La mano abierta sin el pulgar.' },
    { word:'5', emoji:'🖐', desc:'Cinco dedos extendidos.',               tip:'Mano completamente abierta.' },
    { word:'6', emoji:'🤙', desc:'Pulgar y meñique extendidos.',          tip:'Los dos dedos extremos.' },
    { word:'7', emoji:'🤌', desc:'Pulgar toca el corazón.',               tip:'Pellizco entre pulgar y dedo del corazón.' },
    { word:'8', emoji:'🤌', desc:'Pulgar toca el anular.',                tip:'Pellizco entre pulgar y anular.' },
    { word:'9', emoji:'👌', desc:'Pulgar toca el índice doblado.',        tip:'Índice se dobla sobre el pulgar.' },
    { word:'10',emoji:'🤙', desc:'Pulgar y meñique + agitar la mano.',    tip:'El número 10 en LSC tiene movimiento.' },
  ],

  // ─────────────────────────────────────────
  // FRASES COMUNES
  // ─────────────────────────────────────────
  frases: [
    { word:'¿DÓNDE ESTÁ EL BAÑO?', emoji:'🚻', desc:'Seña D + B + apuntar con gesto interrogativo.',     tip:'En LSC las preguntas se expresan con expresión facial.' },
    { word:'NECESITO AYUDA',        emoji:'🆘', desc:'Seña NECESITAR + AYUDA (mano sobre otra mano).',   tip:'Mano A sobre la mano abierta de la otra.' },
    { word:'NO ENTIENDO',           emoji:'🤔', desc:'Seña NO + manos en la sien indicando confusión.',  tip:'El gesto de "no sé" con la cabeza.' },
    { word:'¿PUEDES REPETIR?',      emoji:'🔁', desc:'Giro circular con la mano índice extendido.',      tip:'Movimiento circular frente al pecho.' },
    { word:'ME LLAMO...',            emoji:'🏷', desc:'Señalar pecho + deletrear nombre en dactilología.',tip:'Siempre apuntar al pecho primero.' },
    { word:'TENGO HAMBRE',           emoji:'🍽', desc:'Mano en C baja por el cuello hacia el estómago.', tip:'El movimiento representa la garganta.' },
    { word:'TENGO SED',              emoji:'💧', desc:'Índice en C toca la barbilla.',                   tip:'El índice toca labios y baja.' },
    { word:'HOY',                    emoji:'📅', desc:'Ambos índices apuntan al suelo.',                 tip:'Señalar el presente, el suelo.' },
    { word:'MAÑANA',                 emoji:'☀️', desc:'Pulgar extendido se mueve hacia adelante.',       tip:'El pulgar sale hacia el horizonte.' },
    { word:'AYER',                   emoji:'🌙', desc:'Pulgar extendido se mueve hacia atrás.',          tip:'El pulgar señala el pasado, hacia atrás.' },
  ],

  // ─────────────────────────────────────────
  // COLORES
  // ─────────────────────────────────────────
  colores: [
    { word:'ROJO',    emoji:'🔴', desc:'Índice baja por los labios.',            tip:'El color de los labios.' },
    { word:'AZUL',    emoji:'🔵', desc:'La mano B se agita ligeramente.',        tip:'La forma B con pequeño movimiento.' },
    { word:'VERDE',   emoji:'🟢', desc:'La mano G se agita.',                    tip:'Mano G con movimiento lateral.' },
    { word:'AMARILLO',emoji:'🟡', desc:'La mano Y se agita.',                    tip:'Seña Y con movimiento.' },
    { word:'NEGRO',   emoji:'⚫', desc:'Índice cruza la frente de lado a lado.',  tip:'Una línea sobre las cejas.' },
    { word:'BLANCO',  emoji:'⚪', desc:'Los dedos se juntan desde el pecho.',     tip:'Agarra la camisa blanca imaginaria.' },
    { word:'NARANJA', emoji:'🟠', desc:'La mano C se abre y cierra en la mejilla.',tip:'Como exprimir una naranja.' },
    { word:'MORADO',  emoji:'🟣', desc:'La mano P se agita.',                    tip:'Mano P con movimiento.' },
  ],

  // ─────────────────────────────────────────
  // FAMILIA
  // ─────────────────────────────────────────
  familia: [
    { word:'MAMÁ',    emoji:'👩', desc:'Pulgar toca la barbilla.',              tip:'La mano abierta, pulgar en el mentón.' },
    { word:'PAPÁ',    emoji:'👨', desc:'Pulgar toca la frente.',                tip:'La mano abierta, pulgar en la frente.' },
    { word:'HERMANO', emoji:'🧑', desc:'Seña en sien + índices se juntan.',     tip:'Combina "hombre" + "mismo".' },
    { word:'HERMANA', emoji:'👧', desc:'Seña en mejilla + índices se juntan.',  tip:'Combina "mujer" + "mismo".' },
    { word:'ABUELO',  emoji:'👴', desc:'Pulgar en frente + movimiento arco.',   tip:'Como papá pero con movimiento de "mayor".' },
    { word:'ABUELA',  emoji:'👵', desc:'Pulgar en barbilla + movimiento arco.', tip:'Como mamá pero con movimiento de "mayor".' },
    { word:'HIJO/A',  emoji:'👶', desc:'Mano abierta mece en los brazos.',      tip:'Imita mecerse a un bebé.' },
    { word:'FAMILIA', emoji:'👨‍👩‍👧', desc:'Ambas manos F hacen un círculo.',       tip:'Las dos manos F completan un ciclo.' },
  ],

  // ─────────────────────────────────────────
  // EMOCIONES
  // ─────────────────────────────────────────
  emociones: [
    { word:'FELIZ',      emoji:'😊', desc:'Mano plana hace círculo en el pecho.',       tip:'Movimiento circular ascendente en el pecho.' },
    { word:'TRISTE',     emoji:'😢', desc:'Ambas manos abiertas bajan por el rostro.',  tip:'Imita las lágrimas bajando.' },
    { word:'ENOJADO',    emoji:'😠', desc:'Manos en garra se acercan al rostro.',       tip:'La tensión se muestra en los dedos curvados.' },
    { word:'ASUSTADO',   emoji:'😨', desc:'Ambas manos frente al pecho se agitan.',     tip:'Como un susto repentino.' },
    { word:'SORPRENDIDO',emoji:'😲', desc:'Manos a los lados de la cara se abren.',     tip:'Abre las manos rápido como una sorpresa.' },
    { word:'CANSADO',    emoji:'😴', desc:'Dedos hacia el pecho, manos caen.',          tip:'La energía que se escapa.' },
    { word:'AMOR',       emoji:'❤️', desc:'Ambos puños cruzados sobre el corazón.',    tip:'Los brazos cruzados en el pecho.' },
    { word:'MIEDO',      emoji:'😱', desc:'Manos frente al cuerpo se juntan temblando.', tip:'Las manos que se contraen de miedo.' },
  ],

  // ─────────────────────────────────────────
  // PREGUNTAS
  // ─────────────────────────────────────────
  preguntas: [
    { word:'¿QUÉ?',      emoji:'🤷', desc:'Ambos índices señalan lados opuestos.',     tip:'Las manos se abren como preguntando.' },
    { word:'¿QUIÉN?',    emoji:'☝️', desc:'Índice hace un pequeño círculo al frente.', tip:'El dedo rota preguntando la identidad.' },
    { word:'¿DÓNDE?',    emoji:'👉', desc:'Índice señala distintas direcciones.',       tip:'El dedo apunta distintos lugares.' },
    { word:'¿CUÁNDO?',   emoji:'⏰', desc:'Índice toca la palma opuesta en círculos.', tip:'Giro en la palma, como mirando el reloj.' },
    { word:'¿POR QUÉ?',  emoji:'🤔', desc:'Índice toca la sien y baja.',               tip:'Sale del pensamiento hacia afuera.' },
    { word:'¿CÓMO?',     emoji:'🤲', desc:'Ambas manos abiertas rotan juntas.',        tip:'Las palmas hacia arriba, giro de muñecas.' },
    { word:'¿CUÁNTO?',   emoji:'👐', desc:'Los dedos se abren y cierran repetidamente.',tip:'Como contar monedas con los dedos.' },
  ],
};

/**
 * Quizzes disponibles en el sistema
 */
window.QUIZZES = [
  {
    id: 'q-alfabeto',
    title: 'Alfabeto A–Z',
    icon: '🔤',
    color: '#63FFB4',
    desc: 'Identifica las letras del alfabeto dactilológico.',
    questions: [
      { sign:'✌️', question:'¿Qué letra es esta seña?', options:['V','U','R','W'], correct:'V', type:'sign-to-letter' },
      { sign:'👌', question:'¿Qué letra representa este gesto?', options:['O','F','G','Q'], correct:'F', type:'sign-to-letter' },
      { sign:'🤙', question:'¿Qué letra es?', options:['Y','I','J','L'], correct:'Y', type:'sign-to-letter' },
      { sign:'✊', question:'¿Esta seña corresponde a?', options:['A','S','E','M'], correct:'A', type:'sign-to-letter' },
      { sign:'🖐', question:'¿Qué letra muestra esta mano?', options:['B','P','D','H'], correct:'B', type:'sign-to-letter' },
    ]
  },
  {
    id: 'q-saludos',
    title: 'Saludos básicos',
    icon: '👋',
    color: '#63C8FF',
    desc: 'Reconoce las señas de saludo y cortesía.',
    questions: [
      { sign:'👋', question:'Esta seña significa:', options:['HOLA','ADIÓS','GRACIAS','POR FAVOR'], correct:'HOLA', type:'sign-to-word' },
      { sign:'🙏', question:'¿Qué expresa esta seña?', options:['LO SIENTO','GRACIAS','MUCHO GUSTO','BIEN'], correct:'GRACIAS', type:'sign-to-word' },
      { sign:'👍', question:'Esta seña significa:', options:['MAL','BIEN','SÍ','NO'], correct:'BIEN', type:'sign-to-word' },
      { sign:'✌️', question:'En contexto de saludos esta seña es:', options:['VICTORIA','NO','DOS','ADIÓS'], correct:'NO', type:'sign-to-word' },
      { sign:'🤝', question:'¿Qué saludo representa?', options:['HOLA','GRACIAS','MUCHO GUSTO','HASTA LUEGO'], correct:'MUCHO GUSTO', type:'sign-to-word' },
    ]
  },
  {
    id: 'q-numeros',
    title: 'Números 0–10',
    icon: '🔢',
    color: '#FFD063',
    desc: 'Reconoce los números del 0 al 10.',
    questions: [
      { sign:'✌️', question:'¿Qué número es?', options:['1','2','3','4'], correct:'2', type:'sign-to-word' },
      { sign:'☝️', question:'¿Qué número representa?', options:['1','7','4','9'], correct:'1', type:'sign-to-word' },
      { sign:'🖐', question:'Este gesto significa el número:', options:['4','5','6','3'], correct:'5', type:'sign-to-word' },
      { sign:'🤙', question:'¿Qué número expresa?', options:['6','7','8','9'], correct:'6', type:'sign-to-word' },
      { sign:'👌', question:'En número, esta seña es:', options:['0','8','9','O'], correct:'0', type:'sign-to-word' },
    ]
  },
  {
    id: 'q-frases',
    title: 'Frases del día',
    icon: '💬',
    color: '#C8A0FF',
    desc: 'Asocia las frases comunes con su seña.',
    questions: [
      { sign:'🆘', question:'Esta combinación de señas significa:', options:['NECESITO AYUDA','ESTOY BIEN','TENGO HAMBRE','¿DÓNDE ESTÁ?'], correct:'NECESITO AYUDA', type:'sign-to-word' },
      { sign:'🍽', question:'¿Qué expresa esta seña?', options:['TENGO SED','TENGO HAMBRE','NECESITO COMIDA','ME GUSTA'], correct:'TENGO HAMBRE', type:'sign-to-word' },
      { sign:'📅', question:'Esta seña significa:', options:['MAÑANA','HOY','AYER','AHORA'], correct:'HOY', type:'sign-to-word' },
      { sign:'☀️', question:'¿Cuándo indica esta seña?', options:['HOY','AYER','MAÑANA','SIEMPRE'], correct:'MAÑANA', type:'sign-to-word' },
      { sign:'🔁', question:'Esta seña pide:', options:['QUE PARES','QUE REPITAS','QUE SIGAS','QUE EXPLIQUES'], correct:'QUE REPITAS', type:'sign-to-word' },
    ]
  },
  {
    id: 'q-colores',
    title: 'Colores',
    icon: '🎨',
    color: '#FF8A63',
    desc: 'Identifica los colores en LSC.',
    questions: [
      { sign:'🔴', question:'¿Qué color es?', options:['AZUL','ROJO','NARANJA','MORADO'], correct:'ROJO', type:'sign-to-word' },
      { sign:'🔵', question:'¿Qué color representa?', options:['VERDE','NEGRO','AZUL','GRIS'], correct:'AZUL', type:'sign-to-word' },
      { sign:'🟢', question:'Esta seña significa:', options:['AMARILLO','VERDE','ROJO','AZUL'], correct:'VERDE', type:'sign-to-word' },
      { sign:'🟡', question:'¿Qué color es?', options:['NARANJA','AMARILLO','BLANCO','ORO'], correct:'AMARILLO', type:'sign-to-word' },
      { sign:'⚫', question:'Esta seña es el color:', options:['GRIS','MARRÓN','NEGRO','AZUL OSCURO'], correct:'NEGRO', type:'sign-to-word' },
    ]
  },
  {
    id: 'q-emociones',
    title: 'Emociones',
    icon: '😊',
    color: '#63FFD0',
    desc: 'Reconoce las emociones en LSC.',
    questions: [
      { sign:'😊', question:'Esta seña expresa:', options:['TRISTE','FELIZ','BIEN','AMOR'], correct:'FELIZ', type:'sign-to-word' },
      { sign:'😢', question:'¿Qué emoción muestra?', options:['ENOJADO','TRISTE','ASUSTADO','CANSADO'], correct:'TRISTE', type:'sign-to-word' },
      { sign:'❤️', question:'Esta seña representa:', options:['FELIZ','FAMILIA','AMOR','GRACIAS'], correct:'AMOR', type:'sign-to-word' },
      { sign:'😠', question:'¿Qué emoción es?', options:['SORPRENDIDO','ASUSTADO','ENOJADO','TRISTE'], correct:'ENOJADO', type:'sign-to-word' },
      { sign:'😴', question:'Esta seña significa:', options:['ABURRIDO','CANSADO','MIEDO','LENTO'], correct:'CANSADO', type:'sign-to-word' },
    ]
  },
];
