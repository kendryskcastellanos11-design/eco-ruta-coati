import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Cpu, Bot, Zap, Cable, Code2, FlaskConical, Package, CheckCircle2, Circle, Copy, Check, Download,
  ChevronRight, ArrowLeft, AlertTriangle, ShieldAlert, Lightbulb, LifeBuoy, Send, Loader2, User,
  Sparkles, Wifi, WifiOff, KeyRound, Eye, EyeOff, X, RotateCcw, Trophy, Lock, Rocket, Wand2,
  HelpCircle, Wrench, BookOpen, Usb, Clock, Layers, Search, ListChecks, Award, Terminal,
} from "lucide-react";

/* =========================================================================
   CONSTANTES
   ========================================================================= */

const PASS_SCORE = 70;
const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const AI_TIMEOUT_MS = 60000;
const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

const PHASES = [
  { id: "materiales", label: "Materiales", icon: Package },
  { id: "conexiones", label: "Conexiones", icon: Cable },
  { id: "codigo", label: "Código", icon: Code2 },
  { id: "prueba", label: "Prueba y reto", icon: FlaskConical },
];

const WIRE_COLORS = {
  rojo: "#ef4444",
  negro: "#64748b",
  naranja: "#f97316",
  amarillo: "#eab308",
  verde: "#22c55e",
  azul: "#3b82f6",
  morado: "#a855f7",
  blanco: "#e2e8f0",
  gris: "#9ca3af",
  marron: "#b45309",
};

const PIN_ORDER = ["5V", "3.3V", "VIN", "GND", "A0", "A1", "A2", "A3", "A4", "A5", ...Array.from({ length: 14 }, (_, i) => `D${i}`)];

const GENERAL_SAFETY = [
  "Desconecta el cable USB y las pilas mientras haces o cambias conexiones.",
  "Nunca conectes 5V directamente a GND: es un cortocircuito.",
  "Los LEDs siempre llevan una resistencia (220 Ω) para no quemarse.",
  "Los motores nunca se conectan directo a un pin del Arduino: usa un driver (L298N) y alimentación externa.",
  "Si algo se calienta o huele a quemado, desconecta todo de inmediato.",
];

/* =========================================================================
   BIBLIOTECA DE PROYECTOS (funciona sin conexión)
   ========================================================================= */

const c = (fromPart, fromPin, toPart, toPin, color, via = "", note = "") => ({ from: [fromPart, fromPin], to: [toPart, toPin], color, via, note });

const PROJECTS = [
  {
    id: "semaforo",
    title: "Semáforo con LEDs",
    level: "Principiante",
    age: "8+ años",
    duration: "30 min",
    icon: "traffic",
    summary: "Programa un semáforo real que cambia de verde a amarillo y rojo. Tu primer proyecto con salidas digitales.",
    goals: ["Usar pines digitales como salida", "Conectar LEDs con su resistencia", "Controlar tiempos con delay()"],
    components: [
      { name: "Arduino UNO + cable USB", qty: 1, note: "" },
      { name: "Protoboard", qty: 1, note: "De 400 u 830 puntos" },
      { name: "LED rojo, amarillo y verde", qty: 3, note: "Uno de cada color, 5 mm" },
      { name: "Resistencia 220 Ω", qty: 3, note: "Colores: rojo-rojo-marrón" },
      { name: "Cables macho-macho", qty: 6, note: "" },
    ],
    prep: [
      "Coloca los 3 LEDs en la protoboard, separados, con la pata larga (ánodo) hacia la izquierda.",
      "Pon una resistencia de 220 Ω unida a la pata larga de cada LED.",
      "Lleva un cable negro del GND del Arduino a la línea azul (−) de la protoboard: ahí irán todas las patas cortas.",
    ],
    connections: [
      c("LED rojo", "Ánodo (+) pata larga", "Arduino", "D12", "naranja", "220 Ω"),
      c("LED rojo", "Cátodo (−) pata corta", "Arduino", "GND", "negro"),
      c("LED amarillo", "Ánodo (+) pata larga", "Arduino", "D11", "amarillo", "220 Ω"),
      c("LED amarillo", "Cátodo (−) pata corta", "Arduino", "GND", "negro"),
      c("LED verde", "Ánodo (+) pata larga", "Arduino", "D10", "verde", "220 Ω"),
      c("LED verde", "Cátodo (−) pata corta", "Arduino", "GND", "negro"),
    ],
    libraries: [],
    code: `// Semáforo con LEDs - Arduino UNO
const int LED_ROJO = 12;
const int LED_AMARILLO = 11;
const int LED_VERDE = 10;

void setup() {
  pinMode(LED_ROJO, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  Serial.begin(9600);
  Serial.println("Semaforo listo");
}

void encender(int pin, const char* nombre, unsigned long tiempo) {
  // Apagamos todas las luces y encendemos solo la que toca
  digitalWrite(LED_ROJO, LOW);
  digitalWrite(LED_AMARILLO, LOW);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(pin, HIGH);
  Serial.print("Luz: ");
  Serial.println(nombre);
  delay(tiempo);
}

void loop() {
  encender(LED_VERDE, "VERDE", 4000);       // 4 segundos
  encender(LED_AMARILLO, "AMARILLO", 1500); // 1,5 segundos
  encender(LED_ROJO, "ROJO", 4000);         // 4 segundos
}`,
    explain: [
      { code: "const int LED_ROJO = 12;", text: "Le damos un nombre a cada pin. Así el código se entiende mejor y, si cambias un cable de pin, solo cambias este número." },
      { code: "pinMode(LED_ROJO, OUTPUT);", text: "Configura el pin como SALIDA: el Arduino enviará voltaje (5V) para encender el LED." },
      { code: "void encender(int pin, ...)", text: "Una función propia que apaga todas las luces, enciende una y espera el tiempo indicado. Evita repetir código." },
      { code: "digitalWrite(pin, HIGH);", text: "HIGH = 5V (encendido). LOW = 0V (apagado)." },
      { code: "delay(tiempo);", text: "Pausa el programa los milisegundos indicados: 1000 ms = 1 segundo." },
    ],
    tests: [
      "Abre el Monitor Serie a 9600 baudios: debe aparecer \"Semaforo listo\".",
      "El LED verde se enciende 4 s, luego el amarillo 1,5 s y luego el rojo 4 s.",
      "El ciclo se repite sin parar.",
    ],
    troubleshooting: [
      { p: "Un LED no enciende", s: "Gíralo: probablemente la pata larga no está hacia el pin. Revisa también que su resistencia toque la misma fila." },
      { p: "No enciende ningún LED", s: "Revisa el cable de GND hacia la línea azul (−) y que las patas cortas lleguen a esa línea." },
      { p: "El LED brilla muy poco", s: "Comprueba que la resistencia sea de 220 Ω (rojo-rojo-marrón) y no de 10 kΩ (marrón-negro-naranja)." },
    ],
    quiz: [
      { q: "¿Para qué sirve la resistencia de 220 Ω junto a cada LED?", options: ["Para limitar la corriente y no quemar el LED", "Para que el LED brille más", "Para que el LED parpadee", "No sirve para nada"], a: 0, why: "Sin resistencia pasa demasiada corriente y el LED (o el pin) se daña." },
      { q: "¿Qué pata del LED va hacia el pin del Arduino?", options: ["La pata corta (cátodo)", "La pata larga (ánodo)", "Cualquiera de las dos", "Ninguna, va al 5V"], a: 1, why: "El ánodo (+, pata larga) recibe la señal del pin; el cátodo (−) va a GND." },
      { q: "¿Qué hace pinMode(LED_ROJO, OUTPUT)?", options: ["Lee el valor del LED", "Configura el pin como salida", "Enciende el LED", "Apaga el Arduino"], a: 1, why: "pinMode decide si un pin envía (OUTPUT) o recibe (INPUT) señales." },
      { q: "Quieres que el verde dure 6 segundos. ¿Qué cambias?", options: ["delay(1500) por delay(6000)", "El 4000 del verde por 6000", "El pin 10 por el 6", "Serial.begin(6000)"], a: 1, why: "El tercer valor de encender() es el tiempo en milisegundos." },
    ],
    challenges: ["Añade un pulsador para un semáforo peatonal.", "Haz que el amarillo parpadee 3 veces antes del rojo.", "Agrega un buzzer que suene cuando está en rojo."],
  },
  {
    id: "pulsador",
    title: "Interruptor con pulsador",
    level: "Principiante",
    age: "8+ años",
    duration: "30 min",
    icon: "button",
    summary: "Enciende y apaga un LED con un pulsador, como un interruptor de luz. Aprende a leer entradas digitales.",
    goals: ["Leer un botón con digitalRead()", "Usar la resistencia interna INPUT_PULLUP", "Evitar el rebote del botón con millis()"],
    components: [
      { name: "Arduino UNO + cable USB", qty: 1, note: "" },
      { name: "Protoboard", qty: 1, note: "" },
      { name: "Pulsador de 4 patas", qty: 1, note: "Tipo tact switch 6x6 mm" },
      { name: "LED (cualquier color)", qty: 1, note: "" },
      { name: "Resistencia 220 Ω", qty: 1, note: "Rojo-rojo-marrón" },
      { name: "Cables macho-macho", qty: 4, note: "" },
    ],
    prep: [
      "Coloca el pulsador cruzando el canal central de la protoboard.",
      "Coloca el LED con su resistencia de 220 Ω en la pata larga.",
    ],
    connections: [
      c("Pulsador", "Pata 1", "Arduino", "D2", "azul", "", "Usa dos patas en diagonal del pulsador"),
      c("Pulsador", "Pata 2 (diagonal)", "Arduino", "GND", "negro"),
      c("LED", "Ánodo (+) pata larga", "Arduino", "D8", "naranja", "220 Ω"),
      c("LED", "Cátodo (−) pata corta", "Arduino", "GND", "negro"),
    ],
    libraries: [],
    code: `// Interruptor con pulsador - Arduino UNO
const int PIN_BOTON = 2;
const int PIN_LED = 8;
const unsigned long TIEMPO_REBOTE = 50;  // ms

bool ledEncendido = false;
int estadoEstable = HIGH;
int ultimaLectura = HIGH;
unsigned long ultimoCambio = 0;

void setup() {
  pinMode(PIN_BOTON, INPUT_PULLUP);  // resistencia interna: suelto = HIGH
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Pulsa el boton");
}

void loop() {
  int lectura = digitalRead(PIN_BOTON);

  if (lectura != ultimaLectura) {
    ultimoCambio = millis();          // el botón cambió: reiniciamos el contador
  }

  if (millis() - ultimoCambio > TIEMPO_REBOTE) {
    if (lectura != estadoEstable) {
      estadoEstable = lectura;
      if (estadoEstable == LOW) {     // LOW = botón presionado
        ledEncendido = !ledEncendido;
        digitalWrite(PIN_LED, ledEncendido ? HIGH : LOW);
        Serial.println(ledEncendido ? "LED encendido" : "LED apagado");
      }
    }
  }
  ultimaLectura = lectura;
}`,
    explain: [
      { code: "pinMode(PIN_BOTON, INPUT_PULLUP);", text: "Activa una resistencia interna que mantiene el pin en HIGH. Al presionar, el botón lo une a GND y se lee LOW. ¡No necesitas resistencia externa!" },
      { code: "digitalRead(PIN_BOTON)", text: "Lee si el pin está en HIGH (5V) o LOW (0V)." },
      { code: "millis() - ultimoCambio > TIEMPO_REBOTE", text: "Los botones \"rebotan\" y generan varias señales al presionarlos. Esperamos 50 ms de estabilidad antes de aceptar el cambio." },
      { code: "ledEncendido = !ledEncendido;", text: "El signo ! invierte el valor: si estaba encendido pasa a apagado y viceversa." },
    ],
    tests: [
      "Abre el Monitor Serie a 9600 baudios.",
      "Pulsa una vez: el LED se enciende y aparece \"LED encendido\".",
      "Pulsa otra vez: el LED se apaga.",
    ],
    troubleshooting: [
      { p: "El LED cambia solo o parpadea", s: "El pulsador está mal orientado: usa dos patas en diagonal para asegurarte de que el botón conecta al presionarlo." },
      { p: "Pulsar no hace nada", s: "Revisa que una pata vaya a D2 y la otra a GND, y que el código use INPUT_PULLUP." },
      { p: "Cambia dos veces con un solo clic", s: "Aumenta TIEMPO_REBOTE a 80 o 100 ms." },
    ],
    quiz: [
      { q: "Con INPUT_PULLUP, ¿qué lee el pin cuando el botón NO está presionado?", options: ["LOW", "HIGH", "Un valor de 0 a 1023", "Nada"], a: 1, why: "La resistencia interna \"sube\" el pin a 5V (HIGH) mientras el botón está suelto." },
      { q: "¿Por qué el botón presionado se lee como LOW?", options: ["Porque conecta el pin a GND", "Porque el LED consume energía", "Porque el Arduino se reinicia", "Porque es un error"], a: 0, why: "Al presionar, el botón une el pin con GND (0V)." },
      { q: "¿Qué problema resuelve el antirrebote (debounce)?", options: ["Que el LED se queme", "Que una pulsación cuente como varias", "Que el Arduino vaya lento", "Que falte corriente"], a: 1, why: "Los contactos metálicos vibran y generan señales falsas durante unos milisegundos." },
      { q: "¿Qué hace la línea ledEncendido = !ledEncendido; ?", options: ["Apaga siempre el LED", "Invierte el estado del LED", "Lee el botón", "Enciende el Monitor Serie"], a: 1, why: "! es el operador NO: convierte true en false y false en true." },
    ],
    challenges: ["Cuenta cuántas veces pulsas y muéstralo en el Monitor Serie.", "Con una pulsación larga (más de 1 s) haz que el LED parpadee.", "Usa dos botones para subir y bajar el brillo de un LED con analogWrite()."],
  },
  {
    id: "ldr",
    title: "Luz nocturna automática",
    level: "Principiante",
    age: "9+ años",
    duration: "40 min",
    icon: "light",
    summary: "Un LED que se enciende solo cuando oscurece, como el alumbrado público. Aprende a leer sensores analógicos.",
    goals: ["Leer un sensor con analogRead()", "Entender el divisor de voltaje", "Regular el brillo con PWM (analogWrite)"],
    components: [
      { name: "Arduino UNO + cable USB", qty: 1, note: "" },
      { name: "Protoboard", qty: 1, note: "" },
      { name: "Fotorresistencia (LDR)", qty: 1, note: "" },
      { name: "Resistencia 10 kΩ", qty: 1, note: "Marrón-negro-naranja" },
      { name: "LED blanco o amarillo", qty: 1, note: "" },
      { name: "Resistencia 220 Ω", qty: 1, note: "Rojo-rojo-marrón" },
      { name: "Cables macho-macho", qty: 6, note: "" },
    ],
    prep: [
      "Coloca la LDR en la protoboard; sus patas no tienen polaridad.",
      "Une una pata de la LDR con un extremo de la resistencia de 10 kΩ en la misma fila: ese punto de unión irá a A0.",
      "Coloca el LED con su resistencia de 220 Ω en la pata larga.",
    ],
    connections: [
      c("LDR", "Pata 1", "Arduino", "5V", "rojo"),
      c("LDR", "Pata 2 (unión)", "Arduino", "A0", "amarillo", "", "Este punto también va a la resistencia de 10 kΩ"),
      c("Resistencia 10 kΩ", "Extremo 1 (unión)", "LDR", "Pata 2 (unión)", "amarillo", "", "En la misma fila de la protoboard"),
      c("Resistencia 10 kΩ", "Extremo 2", "Arduino", "GND", "negro"),
      c("LED", "Ánodo (+) pata larga", "Arduino", "D9", "verde", "220 Ω", "D9 tiene el símbolo ~ (PWM)"),
      c("LED", "Cátodo (−) pata corta", "Arduino", "GND", "negro"),
    ],
    libraries: [],
    code: `// Luz nocturna automática - Arduino UNO
const int PIN_LDR = A0;
const int PIN_LED = 9;     // pin PWM (~) para regular el brillo
const int UMBRAL = 500;    // por debajo de este valor está oscuro

void setup() {
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Luz automatica lista");
}

void loop() {
  int luz = analogRead(PIN_LDR);   // 0 (oscuro) a 1023 (mucha luz)
  Serial.print("Nivel de luz: ");
  Serial.println(luz);

  if (luz < UMBRAL) {
    // Cuanto más oscuro, más brilla el LED
    int brillo = map(luz, 0, UMBRAL, 255, 30);
    brillo = constrain(brillo, 0, 255);
    analogWrite(PIN_LED, brillo);
  } else {
    analogWrite(PIN_LED, 0);       // hay luz: LED apagado
  }
  delay(200);
}`,
    explain: [
      { code: "analogRead(PIN_LDR)", text: "Lee un voltaje entre 0 y 5V y lo convierte en un número de 0 a 1023. Con más luz, la LDR conduce mejor y el número sube." },
      { code: "const int UMBRAL = 500;", text: "Es el punto que separa \"día\" de \"noche\". Ajústalo mirando los valores en el Monitor Serie." },
      { code: "map(luz, 0, UMBRAL, 255, 30)", text: "Convierte un rango en otro: mucha oscuridad (0) da brillo 255; poca oscuridad da brillo 30." },
      { code: "analogWrite(PIN_LED, brillo);", text: "Envía una señal PWM (0 a 255) para regular el brillo. Solo funciona en pines con ~ (3, 5, 6, 9, 10, 11)." },
    ],
    tests: [
      "Abre el Monitor Serie y mira el \"Nivel de luz\" con la luz de la habitación.",
      "Tapa la LDR con la mano: el número baja y el LED se enciende.",
      "Si el LED nunca se apaga o nunca enciende, ajusta UMBRAL según los valores que ves.",
    ],
    troubleshooting: [
      { p: "El valor siempre es 0 o 1023", s: "Falta la resistencia de 10 kΩ o la unión LDR-resistencia no va a A0." },
      { p: "El valor no cambia al tapar la LDR", s: "Revisa que la LDR esté entre 5V y A0, y la resistencia entre A0 y GND." },
      { p: "El LED no cambia de brillo, solo enciende/apaga", s: "Asegúrate de usar el pin 9 (o otro con ~)." },
    ],
    quiz: [
      { q: "¿Para qué sirve la resistencia de 10 kΩ con la LDR?", options: ["Para formar un divisor de voltaje que el Arduino pueda medir", "Para proteger el LED", "Para que la LDR brille", "Para enfriar el circuito"], a: 0, why: "LDR + resistencia forman un divisor: el voltaje del punto medio cambia con la luz." },
      { q: "¿Qué rango de valores devuelve analogRead()?", options: ["0 a 255", "0 a 1023", "0 a 5", "-100 a 100"], a: 1, why: "El conversor del Arduino UNO es de 10 bits: 2^10 = 1024 valores." },
      { q: "¿Por qué el LED va en el pin 9?", options: ["Porque es el último pin", "Porque tiene PWM (~) para regular el brillo", "Porque es analógico", "Porque da más voltaje"], a: 1, why: "analogWrite() necesita un pin PWM, marcado con ~." },
      { q: "El LED se enciende incluso de día. ¿Qué haces?", options: ["Cambiar el LED", "Bajar el valor de UMBRAL", "Quitar la resistencia", "Subir el delay"], a: 1, why: "Si de día la lectura es menor que el umbral, el Arduino cree que es de noche." },
    ],
    challenges: ["Muestra un mensaje distinto para \"día\", \"atardecer\" y \"noche\".", "Agrega un segundo LED que solo encienda cuando esté muy oscuro.", "Usa la LDR para controlar la velocidad de parpadeo."],
  },
  {
    id: "servo",
    title: "Brazo con servomotor",
    level: "Intermedio",
    age: "10+ años",
    duration: "40 min",
    icon: "servo",
    summary: "Mueve un servomotor de 0° a 180° girando un potenciómetro, como la articulación de un brazo robótico.",
    goals: ["Controlar un servomotor con la librería Servo", "Leer un potenciómetro", "Convertir rangos con map()"],
    components: [
      { name: "Arduino UNO + cable USB", qty: 1, note: "" },
      { name: "Servomotor SG90", qty: 1, note: "Micro servo 9 g" },
      { name: "Potenciómetro 10 kΩ", qty: 1, note: "" },
      { name: "Protoboard", qty: 1, note: "" },
      { name: "Cables macho-macho", qty: 7, note: "" },
    ],
    prep: [
      "Coloca el potenciómetro en la protoboard con sus 3 patas en filas distintas.",
      "Lleva 5V y GND del Arduino a las líneas roja (+) y azul (−) de la protoboard; el servo y el potenciómetro los toman de ahí.",
    ],
    connections: [
      c("Servo SG90", "Cable marrón (GND)", "Arduino", "GND", "negro"),
      c("Servo SG90", "Cable rojo (+5V)", "Arduino", "5V", "rojo"),
      c("Servo SG90", "Cable naranja (señal)", "Arduino", "D9", "naranja"),
      c("Potenciómetro", "Pata izquierda", "Arduino", "5V", "rojo"),
      c("Potenciómetro", "Pata central (cursor)", "Arduino", "A0", "amarillo"),
      c("Potenciómetro", "Pata derecha", "Arduino", "GND", "negro"),
    ],
    libraries: ["Servo (ya viene incluida en el Arduino IDE)"],
    code: `// Brazo con servomotor - Arduino UNO
#include <Servo.h>

Servo miServo;
const int PIN_SERVO = 9;
const int PIN_POT = A0;
int anguloAnterior = -1;

void setup() {
  miServo.attach(PIN_SERVO);
  Serial.begin(9600);
  Serial.println("Brazo con servo listo");
}

void loop() {
  int valor = analogRead(PIN_POT);            // 0 a 1023
  int angulo = map(valor, 0, 1023, 0, 180);   // lo pasamos a grados
  miServo.write(angulo);

  if (abs(angulo - anguloAnterior) > 2) {     // solo imprimimos si cambia
    Serial.print("Angulo: ");
    Serial.println(angulo);
    anguloAnterior = angulo;
  }
  delay(15);                                  // tiempo para que el servo llegue
}`,
    explain: [
      { code: "#include <Servo.h>", text: "Carga la librería que sabe generar la señal especial que entiende el servo." },
      { code: "miServo.attach(PIN_SERVO);", text: "Indica en qué pin está conectado el cable de señal (naranja)." },
      { code: "map(valor, 0, 1023, 0, 180)", text: "Convierte la lectura del potenciómetro (0-1023) en un ángulo (0-180°)." },
      { code: "miServo.write(angulo);", text: "Ordena al servo moverse a ese ángulo y mantenerse ahí." },
    ],
    tests: [
      "Gira el potenciómetro hasta un extremo: el servo va a 0°.",
      "Gíralo al otro extremo: el servo va a 180°.",
      "En el Monitor Serie (9600) verás el ángulo cambiar.",
    ],
    troubleshooting: [
      { p: "El servo tiembla o el Arduino se reinicia", s: "El servo pide más corriente de la que da el USB. Usa un cable USB corto o alimenta el servo con 4 pilas AA (uniendo su GND con el del Arduino)." },
      { p: "El servo no se mueve", s: "Revisa que el cable naranja vaya a D9 y que el rojo y el marrón estén en 5V y GND." },
      { p: "Se mueve al revés", s: "Intercambia los cables de las patas izquierda y derecha del potenciómetro." },
    ],
    quiz: [
      { q: "¿Qué cable del SG90 lleva la señal de control?", options: ["El marrón", "El rojo", "El naranja", "Ninguno"], a: 2, why: "Marrón = GND, rojo = +5V, naranja = señal." },
      { q: "¿Qué hace map(valor, 0, 1023, 0, 180)?", options: ["Dibuja un mapa", "Convierte un rango de valores en otro", "Mueve el servo a 1023°", "Lee el potenciómetro"], a: 1, why: "map() reescala números proporcionalmente." },
      { q: "¿Qué pata del potenciómetro va a A0?", options: ["La izquierda", "La central (cursor)", "La derecha", "Todas"], a: 1, why: "La pata central entrega un voltaje variable según el giro." },
      { q: "Quieres mover 4 servos a la vez. ¿Qué necesitas?", options: ["Nada más", "Una fuente externa de 5V con GND común", "Más código", "Resistencias de 220 Ω"], a: 1, why: "Varios servos superan la corriente del USB; necesitan su propia alimentación." },
    ],
    challenges: ["Limita el movimiento entre 30° y 150°.", "Agrega un segundo servo con otro potenciómetro (pinza).", "Graba posiciones con un botón y reprodúcelas."],
  },
  {
    id: "distancia",
    title: "Semáforo de distancia (HC-SR04)",
    level: "Intermedio",
    age: "10+ años",
    duration: "50 min",
    icon: "radar",
    summary: "Un sensor ultrasónico mide la distancia a un obstáculo y enciende verde, amarillo o rojo con alarma, igual que el sensor de Sendel en Eco Ruta.",
    goals: ["Medir distancias con un sensor ultrasónico", "Tomar decisiones con if / else if / else", "Combinar sensores y actuadores"],
    components: [
      { name: "Arduino UNO + cable USB", qty: 1, note: "" },
      { name: "Sensor ultrasónico HC-SR04", qty: 1, note: "" },
      { name: "LED verde, amarillo y rojo", qty: 3, note: "" },
      { name: "Resistencia 220 Ω", qty: 3, note: "Rojo-rojo-marrón" },
      { name: "Buzzer activo 5V", qty: 1, note: "El que suena solo al darle voltaje" },
      { name: "Protoboard", qty: 1, note: "" },
      { name: "Cables macho-macho", qty: 12, note: "" },
    ],
    prep: [
      "Coloca el HC-SR04 en un borde de la protoboard con los \"ojos\" mirando hacia afuera.",
      "Coloca los 3 LEDs con su resistencia de 220 Ω en la pata larga.",
      "Coloca el buzzer: la pata marcada con + (más larga) irá al pin D7.",
      "Lleva 5V y GND del Arduino a las líneas roja (+) y azul (−) de la protoboard.",
    ],
    connections: [
      c("HC-SR04", "VCC", "Arduino", "5V", "rojo"),
      c("HC-SR04", "Trig", "Arduino", "D9", "azul"),
      c("HC-SR04", "Echo", "Arduino", "D10", "morado"),
      c("HC-SR04", "GND", "Arduino", "GND", "negro"),
      c("LED verde", "Ánodo (+)", "Arduino", "D4", "verde", "220 Ω"),
      c("LED verde", "Cátodo (−)", "Arduino", "GND", "negro"),
      c("LED amarillo", "Ánodo (+)", "Arduino", "D5", "amarillo", "220 Ω"),
      c("LED amarillo", "Cátodo (−)", "Arduino", "GND", "negro"),
      c("LED rojo", "Ánodo (+)", "Arduino", "D6", "naranja", "220 Ω"),
      c("LED rojo", "Cátodo (−)", "Arduino", "GND", "negro"),
      c("Buzzer", "Pata + (larga)", "Arduino", "D7", "blanco"),
      c("Buzzer", "Pata −", "Arduino", "GND", "negro"),
    ],
    libraries: [],
    code: `// Semáforo de distancia con HC-SR04 - Arduino UNO
const int PIN_TRIG = 9;
const int PIN_ECHO = 10;
const int LED_VERDE = 4;
const int LED_AMARILLO = 5;
const int LED_ROJO = 6;
const int PIN_BUZZER = 7;

const float DIST_ROJO = 15.0;      // cm: obstáculo muy cerca
const float DIST_AMARILLO = 40.0;  // cm: obstáculo acercándose

void setup() {
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  Serial.begin(9600);
  Serial.println("Sensor de distancia listo");
}

float medirDistancia() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);      // pulso de 10 microsegundos
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duracion = pulseIn(PIN_ECHO, HIGH, 30000UL);
  if (duracion == 0) return -1;      // sin eco: nada delante
  return duracion * 0.0343 / 2.0;    // velocidad del sonido: 0,0343 cm/us
}

void semaforo(bool verde, bool amarillo, bool rojo) {
  digitalWrite(LED_VERDE, verde ? HIGH : LOW);
  digitalWrite(LED_AMARILLO, amarillo ? HIGH : LOW);
  digitalWrite(LED_ROJO, rojo ? HIGH : LOW);
}

void loop() {
  float distancia = medirDistancia();
  Serial.print("Distancia: ");
  if (distancia < 0) {
    Serial.println("fuera de rango");
  } else {
    Serial.print(distancia);
    Serial.println(" cm");
  }

  if (distancia > 0 && distancia < DIST_ROJO) {
    semaforo(false, false, true);
    digitalWrite(PIN_BUZZER, HIGH);  // pitido de alerta
    delay(100);
    digitalWrite(PIN_BUZZER, LOW);
  } else if (distancia > 0 && distancia < DIST_AMARILLO) {
    semaforo(false, true, false);
    digitalWrite(PIN_BUZZER, LOW);
  } else {
    semaforo(true, false, false);
    digitalWrite(PIN_BUZZER, LOW);
  }
  delay(150);
}`,
    explain: [
      { code: "digitalWrite(PIN_TRIG, HIGH); ... delayMicroseconds(10);", text: "Un pulso de 10 µs en Trig hace que el sensor emita 8 pulsos de ultrasonido." },
      { code: "pulseIn(PIN_ECHO, HIGH, 30000UL)", text: "Mide cuántos microsegundos tarda en volver el eco. Si pasan 30 ms sin eco devuelve 0 (no hay obstáculo)." },
      { code: "duracion * 0.0343 / 2.0", text: "El sonido viaja a 0,0343 cm por microsegundo. Dividimos entre 2 porque el sonido va y vuelve." },
      { code: "if ... else if ... else", text: "Decide qué luz encender: rojo si está a menos de 15 cm, amarillo si está a menos de 40 cm y verde en otro caso." },
    ],
    tests: [
      "Abre el Monitor Serie a 9600 y mira la distancia en cm.",
      "Acerca la mano a 30 cm: debe encenderse el amarillo.",
      "Acércala a menos de 15 cm: rojo y pitido.",
      "Aleja la mano: vuelve el verde.",
    ],
    troubleshooting: [
      { p: "Siempre dice \"fuera de rango\"", s: "Revisa que Trig vaya a D9 y Echo a D10 (no al revés) y que el sensor tenga 5V y GND." },
      { p: "La distancia salta mucho", s: "Apunta el sensor a una superficie plana; las telas y los ángulos absorben el sonido." },
      { p: "El buzzer suena siempre", s: "Puede ser un buzzer pasivo: necesita tone(PIN_BUZZER, 1000) en vez de digitalWrite." },
    ],
    quiz: [
      { q: "¿Por qué dividimos la distancia entre 2?", options: ["Porque el sensor tiene 2 ojos", "Porque el sonido va hasta el obstáculo y vuelve", "Para convertir a metros", "Por error"], a: 1, why: "El tiempo medido es de ida y vuelta; la distancia real es la mitad." },
      { q: "¿Qué pin del HC-SR04 emite el pulso de disparo?", options: ["Echo", "Trig", "VCC", "GND"], a: 1, why: "Trig (trigger) dispara; Echo devuelve el eco." },
      { q: "Quieres que el rojo se active a 25 cm. ¿Qué cambias?", options: ["DIST_AMARILLO = 25.0", "DIST_ROJO = 25.0", "delay(25)", "PIN_TRIG = 25"], a: 1, why: "DIST_ROJO define el límite de la zona de peligro." },
      { q: "¿Qué devuelve medirDistancia() si no hay obstáculo?", options: ["0", "-1", "1000", "Un error"], a: 1, why: "pulseIn devuelve 0 sin eco y la función lo traduce a -1." },
    ],
    challenges: ["Haz que el buzzer pite más rápido cuanto más cerca esté el obstáculo.", "Muestra la distancia con 5 LEDs como una barra.", "Monta el sensor sobre un servo para escanear como un radar."],
  },
  {
    id: "alarma",
    title: "Alarma con sensor de movimiento",
    level: "Intermedio",
    age: "10+ años",
    duration: "40 min",
    icon: "alarm",
    summary: "Detecta movimiento con un sensor PIR y activa una alarma con luz y sonido.",
    goals: ["Usar un sensor PIR (infrarrojo pasivo)", "Calibrar un sensor al iniciar", "Generar alertas sonoras y visuales"],
    components: [
      { name: "Arduino UNO + cable USB", qty: 1, note: "" },
      { name: "Sensor PIR HC-SR501", qty: 1, note: "" },
      { name: "Buzzer activo 5V", qty: 1, note: "" },
      { name: "LED rojo", qty: 1, note: "" },
      { name: "Resistencia 220 Ω", qty: 1, note: "" },
      { name: "Protoboard y cables", qty: 1, note: "Macho-macho y macho-hembra" },
    ],
    prep: [
      "Quita la tapa blanca del PIR solo para ver las etiquetas VCC, OUT y GND; vuelve a ponerla.",
      "Usa cables macho-hembra para los pines del PIR.",
      "Coloca el buzzer y el LED con su resistencia en la protoboard.",
    ],
    connections: [
      c("Sensor PIR", "VCC", "Arduino", "5V", "rojo"),
      c("Sensor PIR", "OUT", "Arduino", "D2", "amarillo"),
      c("Sensor PIR", "GND", "Arduino", "GND", "negro"),
      c("Buzzer", "Pata + (larga)", "Arduino", "D8", "blanco"),
      c("Buzzer", "Pata −", "Arduino", "GND", "negro"),
      c("LED rojo", "Ánodo (+)", "Arduino", "D13", "naranja", "220 Ω"),
      c("LED rojo", "Cátodo (−)", "Arduino", "GND", "negro"),
    ],
    libraries: [],
    code: `// Alarma con sensor PIR - Arduino UNO
const int PIN_PIR = 2;
const int PIN_BUZZER = 8;
const int PIN_LED = 13;
bool alarmaActiva = false;

void setup() {
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  Serial.begin(9600);
  Serial.println("Calibrando sensor PIR (30 s)... no te muevas");
  for (int i = 30; i > 0; i--) {
    digitalWrite(PIN_LED, i % 2);     // parpadeo durante la calibración
    delay(1000);
  }
  digitalWrite(PIN_LED, LOW);
  Serial.println("Alarma lista");
}

void loop() {
  int movimiento = digitalRead(PIN_PIR);

  if (movimiento == HIGH) {
    if (!alarmaActiva) {
      Serial.println("Movimiento detectado!");
      alarmaActiva = true;
    }
    digitalWrite(PIN_LED, HIGH);
    digitalWrite(PIN_BUZZER, HIGH);
    delay(200);
    digitalWrite(PIN_BUZZER, LOW);
    delay(200);
  } else {
    if (alarmaActiva) {
      Serial.println("Zona despejada");
      alarmaActiva = false;
    }
    digitalWrite(PIN_LED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
  }
}`,
    explain: [
      { code: "for (int i = 30; i > 0; i--)", text: "El PIR necesita unos 30 segundos al encenderse para \"aprender\" el calor normal del ambiente. Mientras, el LED parpadea." },
      { code: "digitalRead(PIN_PIR)", text: "El PIR pone su salida en HIGH cuando detecta el calor de una persona en movimiento." },
      { code: "if (!alarmaActiva)", text: "Solo escribimos el mensaje la primera vez que se detecta movimiento, para no llenar el Monitor Serie." },
    ],
    tests: [
      "Carga el código y no te muevas durante los 30 s de calibración.",
      "Cuando diga \"Alarma lista\", pasa la mano frente al sensor: LED y buzzer se activan.",
      "Quédate quieto unos segundos: la alarma se apaga.",
    ],
    troubleshooting: [
      { p: "La alarma no se apaga nunca", s: "Gira el potenciómetro de tiempo del PIR (Tx) hacia la izquierda para acortar la duración." },
      { p: "Detecta movimiento sin que haya nadie", s: "Aleja el sensor de ventanas, calefactores o ventiladores y baja la sensibilidad (Sx)." },
      { p: "No detecta nada", s: "Revisa que OUT vaya a D2 y espera los 30 s de calibración completos." },
    ],
    quiz: [
      { q: "¿Qué detecta un sensor PIR?", options: ["Sonido", "Cambios de calor infrarrojo (movimiento de personas)", "Distancia exacta", "Humedad"], a: 1, why: "PIR = Passive InfraRed: detecta cambios en la radiación de calor." },
      { q: "¿Por qué esperamos 30 s al iniciar?", options: ["Para que el buzzer se cargue", "Para que el PIR se calibre con el ambiente", "Porque el Arduino es lento", "No es necesario"], a: 1, why: "Durante ese tiempo el PIR puede dar falsas detecciones." },
      { q: "¿Qué pin del PIR va al Arduino D2?", options: ["VCC", "OUT", "GND", "Ninguno"], a: 1, why: "OUT entrega HIGH al detectar movimiento." },
      { q: "¿Qué valor de digitalRead indica movimiento?", options: ["LOW", "HIGH", "1023", "-1"], a: 1, why: "La salida del HC-SR501 sube a HIGH (3,3V, que el Arduino lee como HIGH)." },
    ],
    challenges: ["Agrega un pulsador para armar y desarmar la alarma.", "Cuenta cuántas detecciones hubo en total.", "Usa tone() con un buzzer pasivo para hacer una sirena."],
  },
  {
    id: "clima",
    title: "Estación meteorológica DHT11",
    level: "Intermedio",
    age: "11+ años",
    duration: "45 min",
    icon: "weather",
    summary: "Mide temperatura y humedad, muéstralas en el Monitor Serie y enciende un LED de alerta si hace calor.",
    goals: ["Instalar y usar una librería externa", "Leer un sensor digital de temperatura y humedad", "Detectar lecturas erróneas con isnan()"],
    components: [
      { name: "Arduino UNO + cable USB", qty: 1, note: "" },
      { name: "Módulo DHT11 (3 pines)", qty: 1, note: "Si es el sensor suelto de 4 patas, agrega 10 kΩ entre DATA y VCC" },
      { name: "LED rojo", qty: 1, note: "" },
      { name: "Resistencia 220 Ω", qty: 1, note: "" },
      { name: "Protoboard y cables", qty: 1, note: "" },
    ],
    prep: [
      "Identifica los pines del módulo DHT11: + (VCC), OUT/DATA y − (GND).",
      "Coloca el LED con su resistencia de 220 Ω en la protoboard.",
    ],
    connections: [
      c("DHT11", "VCC (+)", "Arduino", "5V", "rojo"),
      c("DHT11", "DATA / OUT", "Arduino", "D2", "amarillo"),
      c("DHT11", "GND (−)", "Arduino", "GND", "negro"),
      c("LED rojo", "Ánodo (+)", "Arduino", "D8", "naranja", "220 Ω"),
      c("LED rojo", "Cátodo (−)", "Arduino", "GND", "negro"),
    ],
    libraries: ["DHT sensor library (de Adafruit)", "Adafruit Unified Sensor (el IDE la pide al instalar la anterior)"],
    code: `// Estación meteorológica con DHT11 - Arduino UNO
#include <DHT.h>

#define PIN_DHT 2
#define TIPO_DHT DHT11
const int PIN_LED = 8;
const float TEMP_ALERTA = 30.0;   // grados Celsius

DHT dht(PIN_DHT, TIPO_DHT);

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(PIN_LED, OUTPUT);
  Serial.println("Estacion meteorologica lista");
}

void loop() {
  delay(2000);   // el DHT11 necesita 2 s entre lecturas
  float humedad = dht.readHumidity();
  float temperatura = dht.readTemperature();

  if (isnan(humedad) || isnan(temperatura)) {
    Serial.println("Error al leer el DHT11: revisa las conexiones");
    return;
  }

  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.print(" C  |  Humedad: ");
  Serial.print(humedad);
  Serial.println(" %");

  digitalWrite(PIN_LED, temperatura >= TEMP_ALERTA ? HIGH : LOW);
}`,
    explain: [
      { code: "#include <DHT.h>", text: "Usa la librería de Adafruit, que sabe comunicarse con el sensor. Debes instalarla antes de compilar." },
      { code: "DHT dht(PIN_DHT, TIPO_DHT);", text: "Crea el objeto del sensor indicando el pin y el modelo (DHT11 o DHT22)." },
      { code: "delay(2000);", text: "El DHT11 solo puede dar una lectura nueva cada 1-2 segundos." },
      { code: "isnan(humedad) || isnan(temperatura)", text: "isnan = \"no es un número\". Si la lectura falla, avisamos y saltamos el resto con return." },
    ],
    tests: [
      "Abre el Monitor Serie a 9600: cada 2 s aparece la temperatura y la humedad.",
      "Sopla suavemente sobre el sensor: la humedad sube.",
      "Pon el dedo sobre el sensor: la temperatura sube poco a poco. Baja TEMP_ALERTA para probar el LED.",
    ],
    troubleshooting: [
      { p: "Error de compilación: DHT.h no encontrado", s: "Instala \"DHT sensor library\" desde Programa > Incluir librería > Administrar bibliotecas." },
      { p: "Sale \"Error al leer el DHT11\"", s: "Revisa que DATA vaya a D2 y el sensor tenga 5V y GND. Si es el sensor de 4 patas, agrega la resistencia de 10 kΩ." },
      { p: "La temperatura parece incorrecta", s: "El DHT11 tiene una precisión de ±2 °C; para más precisión usa un DHT22 y cambia TIPO_DHT." },
    ],
    quiz: [
      { q: "¿Qué debes hacer antes de compilar este código?", options: ["Nada", "Instalar la librería DHT sensor library", "Quitar el delay", "Cambiar la placa"], a: 1, why: "DHT.h no viene con el IDE; se instala desde el Administrador de bibliotecas." },
      { q: "¿Para qué sirve isnan()?", options: ["Para medir la humedad", "Para detectar una lectura fallida", "Para encender el LED", "Para esperar 2 segundos"], a: 1, why: "Si el sensor no responde, la librería devuelve NaN (no es un número)." },
      { q: "¿Cada cuánto se puede leer el DHT11?", options: ["Cada 1 ms", "Cada 2 s aprox.", "Una vez al día", "Sin límite"], a: 1, why: "Es un sensor lento: leerlo más rápido da errores." },
      { q: "Quieres usar un DHT22. ¿Qué cambias?", options: ["#define TIPO_DHT DHT22", "PIN_LED = 22", "Serial.begin(22)", "Nada"], a: 0, why: "La librería soporta ambos modelos; solo indicas cuál usas." },
    ],
    challenges: ["Calcula la sensación térmica con dht.computeHeatIndex().", "Muestra los datos en una pantalla LCD 16x2 I2C.", "Guarda la temperatura máxima y mínima del día."],
  },
  {
    id: "evasor",
    title: "Robot evasor de obstáculos",
    level: "Avanzado",
    age: "12+ años",
    duration: "2 h",
    icon: "robot",
    summary: "Un robot con 2 motores que avanza solo y esquiva obstáculos usando el sensor ultrasónico y el driver L298N.",
    goals: ["Controlar motores DC con un driver L298N", "Usar alimentación externa con tierra común", "Programar un comportamiento autónomo"],
    components: [
      { name: "Arduino UNO + cable USB", qty: 1, note: "" },
      { name: "Chasis 2WD con 2 motores DC y ruedas", qty: 1, note: "Incluye rueda loca" },
      { name: "Driver de motores L298N", qty: 1, note: "" },
      { name: "Sensor ultrasónico HC-SR04", qty: 1, note: "" },
      { name: "Portapilas 2x18650 (7,4 V) o 6xAA (9 V)", qty: 1, note: "Con interruptor si es posible" },
      { name: "Cables macho-hembra y macho-macho", qty: 15, note: "" },
    ],
    prep: [
      "Arma el chasis: fija los motores, las ruedas y la rueda loca.",
      "Atornilla el Arduino, el L298N y el portapilas sobre el chasis.",
      "Quita los jumpers ENA y ENB del L298N (los dos puentes junto a los pines de control).",
      "Deja puesto el jumper \"5V-EN\" del L298N.",
      "Fija el HC-SR04 al frente del robot mirando hacia adelante.",
    ],
    connections: [
      c("Motor izquierdo", "Cable 1", "L298N", "OUT1", "rojo"),
      c("Motor izquierdo", "Cable 2", "L298N", "OUT2", "negro"),
      c("Motor derecho", "Cable 1", "L298N", "OUT3", "rojo"),
      c("Motor derecho", "Cable 2", "L298N", "OUT4", "negro"),
      c("Batería", "Polo + (rojo)", "L298N", "12V", "rojo", "", "Con el interruptor apagado"),
      c("Batería", "Polo − (negro)", "L298N", "GND", "negro"),
      c("Batería", "Polo + (rojo)", "Arduino", "VIN", "rojo", "", "Alimenta el Arduino en modo autónomo"),
      c("L298N", "GND", "Arduino", "GND", "negro", "", "Tierra común: imprescindible"),
      c("L298N", "ENA", "Arduino", "D5", "morado"),
      c("L298N", "IN1", "Arduino", "D7", "azul"),
      c("L298N", "IN2", "Arduino", "D8", "verde"),
      c("L298N", "IN3", "Arduino", "D9", "amarillo"),
      c("L298N", "IN4", "Arduino", "D10", "naranja"),
      c("L298N", "ENB", "Arduino", "D6", "gris"),
      c("HC-SR04", "VCC", "Arduino", "5V", "rojo"),
      c("HC-SR04", "Trig", "Arduino", "D12", "azul"),
      c("HC-SR04", "Echo", "Arduino", "D11", "morado"),
      c("HC-SR04", "GND", "Arduino", "GND", "negro"),
    ],
    libraries: [],
    code: `// Robot evasor de obstáculos - Arduino UNO + L298N + HC-SR04
// Pines del driver L298N
const int ENA = 5;    // velocidad motor izquierdo (PWM)
const int IN1 = 7;
const int IN2 = 8;
const int IN3 = 9;
const int IN4 = 10;
const int ENB = 6;    // velocidad motor derecho (PWM)

// Pines del sensor ultrasónico
const int PIN_TRIG = 12;
const int PIN_ECHO = 11;

const int VELOCIDAD = 170;          // 0 a 255
const float DIST_OBSTACULO = 20.0;  // cm

void detener();   // se define más abajo

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  Serial.begin(9600);
  detener();
  Serial.println("Robot listo. Arranca en 3 s...");
  delay(3000);
}

float medirDistancia() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  unsigned long duracion = pulseIn(PIN_ECHO, HIGH, 30000UL);
  if (duracion == 0) return -1;
  return duracion * 0.0343 / 2.0;
}

// izq y der: de -255 (atrás) a 255 (adelante)
void motores(int izq, int der) {
  digitalWrite(IN1, izq >= 0 ? HIGH : LOW);
  digitalWrite(IN2, izq >= 0 ? LOW : HIGH);
  digitalWrite(IN3, der >= 0 ? HIGH : LOW);
  digitalWrite(IN4, der >= 0 ? LOW : HIGH);
  analogWrite(ENA, abs(izq));
  analogWrite(ENB, abs(der));
}

void detener() {
  motores(0, 0);
}

void loop() {
  float distancia = medirDistancia();
  Serial.print("Distancia: ");
  Serial.println(distancia);

  if (distancia > 0 && distancia < DIST_OBSTACULO) {
    detener();
    delay(200);
    motores(-VELOCIDAD, -VELOCIDAD);   // retrocede
    delay(400);
    motores(VELOCIDAD, -VELOCIDAD);    // gira a la derecha
    delay(350);
    detener();
    delay(100);
  } else {
    motores(VELOCIDAD, VELOCIDAD);     // avanza
  }
  delay(50);
}`,
    explain: [
      { code: "const int ENA = 5; ... const int ENB = 6;", text: "ENA y ENB controlan la velocidad de cada motor con PWM; por eso van a pines con ~ (5 y 6)." },
      { code: "digitalWrite(IN1, ...); digitalWrite(IN2, ...);", text: "IN1/IN2 deciden el sentido de giro del motor izquierdo (IN3/IN4 el del derecho): HIGH-LOW gira hacia adelante y LOW-HIGH hacia atrás." },
      { code: "void motores(int izq, int der)", text: "Una función que recibe la velocidad de cada rueda. Un número negativo hace girar el motor hacia atrás." },
      { code: "motores(VELOCIDAD, -VELOCIDAD);", text: "Una rueda adelante y la otra atrás: el robot gira sobre sí mismo." },
      { code: "if (distancia > 0 && distancia < DIST_OBSTACULO)", text: "Si hay algo a menos de 20 cm: se detiene, retrocede y gira. Si no, sigue avanzando." },
    ],
    tests: [
      "Primera prueba con las ruedas en el aire y el Arduino por USB (la batería encendida para los motores).",
      "Al arrancar, ambas ruedas deben girar hacia adelante.",
      "Pon la mano frente al sensor: las ruedas paran, giran hacia atrás y luego el robot gira.",
      "Si funciona, desconecta el USB, enciende la batería y déjalo en el suelo.",
    ],
    troubleshooting: [
      { p: "Una rueda gira al revés", s: "Intercambia los 2 cables de ese motor en el L298N (OUT1-OUT2 u OUT3-OUT4)." },
      { p: "Los motores no giran", s: "Comprueba que quitaste los jumpers ENA/ENB, que la batería está cargada y que el GND del L298N está unido al GND del Arduino." },
      { p: "El Arduino se reinicia al arrancar los motores", s: "Las pilas están bajas o son de poca corriente. Usa baterías 18650 cargadas o baja VELOCIDAD." },
      { p: "Choca con los obstáculos", s: "Sube DIST_OBSTACULO a 30 cm o baja VELOCIDAD para que tenga tiempo de reaccionar." },
    ],
    quiz: [
      { q: "¿Por qué no conectamos los motores directamente al Arduino?", options: ["Porque giran muy lento", "Porque piden más corriente de la que un pin puede dar", "Porque no tienen cables", "Sí se puede"], a: 1, why: "Un pin da máximo 40 mA; un motor pide cientos. El L298N hace de intermediario." },
      { q: "¿Para qué unimos el GND del L298N con el GND del Arduino?", options: ["No es necesario", "Para que compartan la misma referencia y las señales funcionen", "Para cargar la batería", "Para que el robot sea más rápido"], a: 1, why: "Sin tierra común, el L298N no interpreta correctamente las señales del Arduino." },
      { q: "¿Qué hace motores(VELOCIDAD, -VELOCIDAD)?", options: ["Avanza", "Retrocede", "Gira sobre sí mismo", "Se detiene"], a: 2, why: "Una rueda va hacia adelante y la otra hacia atrás." },
      { q: "Una rueda gira al revés. ¿Cuál es la solución más rápida?", options: ["Cambiar el Arduino", "Intercambiar los dos cables de ese motor", "Subir la velocidad", "Quitar la batería"], a: 1, why: "Invertir la polaridad del motor invierte su sentido de giro." },
    ],
    challenges: ["Monta el sensor sobre un servo y elige girar hacia el lado con más espacio.", "Agrega 2 sensores infrarrojos para convertirlo en seguidor de línea.", "Controla el robot por Bluetooth con un módulo HC-05."],
  },
];

/* =========================================================================
   UTILIDADES
   ========================================================================= */

const normalize = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const fmtTime = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min ${String(s % 60).padStart(2, "0")} s`;
};

function partsOf(project) {
  const parts = [];
  const pins = {};
  const add = (part, pin) => {
    if (part === "Arduino") return;
    if (!parts.includes(part)) { parts.push(part); pins[part] = []; }
    if (!pins[part].includes(pin)) pins[part].push(pin);
  };
  project.connections.forEach((cn) => { add(cn.from[0], cn.from[1]); add(cn.to[0], cn.to[1]); });
  return { parts, pins };
}

function arduinoPinsOf(project) {
  const set = new Set();
  project.connections.forEach((cn) => {
    if (cn.from[0] === "Arduino") set.add(cn.from[1]);
    if (cn.to[0] === "Arduino") set.add(cn.to[1]);
  });
  return [...set].sort((a, b) => {
    const ia = PIN_ORDER.indexOf(a);
    const ib = PIN_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}

function assemblySteps(project) {
  return [
    ...project.prep.map((t) => ({ type: "prep", text: t })),
    ...project.connections.map((cn, i) => ({ type: "conn", cn, i })),
  ];
}

function connectionText(cn) {
  const [fp, fpin] = cn.from;
  const [tp, tpin] = cn.to;
  const target = tp === "Arduino" ? `el pin ${tpin} del Arduino` : `${tpin} de ${tp}`;
  return `Conecta ${fpin} de ${fp} a ${target}${cn.via ? ` pasando por una resistencia de ${cn.via}` : ""}, con un cable ${cn.color}.`;
}

function buildMarkdown(project, score) {
  const L = [];
  L.push(`# ${project.title}`, "", `Nivel: ${project.level} · Edad: ${project.age} · Duración: ${project.duration}`, "", project.summary, "");
  L.push("## Objetivos", ...project.goals.map((g) => `- ${g}`), "");
  L.push("## Materiales", ...project.components.map((m) => `- ${m.qty} × ${m.name}${m.note ? ` (${m.note})` : ""}`), "");
  L.push("## Seguridad", ...GENERAL_SAFETY.map((s) => `- ${s}`), "");
  L.push("## Preparación", ...project.prep.map((s, i) => `${i + 1}. ${s}`), "");
  L.push("## Conexiones", "", "| Componente | Pin del componente | Va a | Cable | Nota |", "|---|---|---|---|---|");
  project.connections.forEach((cn) => {
    L.push(`| ${cn.from[0]} | ${cn.from[1]} | ${cn.to[0] === "Arduino" ? `Arduino ${cn.to[1]}` : `${cn.to[0]} ${cn.to[1]}`} | ${cn.color} | ${[cn.via ? `Resistencia ${cn.via}` : "", cn.note].filter(Boolean).join(". ")} |`);
  });
  L.push("");
  if (project.libraries.length) L.push("## Librerías", ...project.libraries.map((l) => `- ${l}`), "");
  L.push("## Código (Arduino UNO)", "", "```cpp", project.code, "```", "");
  L.push("## Cómo cargar el código", ...UPLOAD_STEPS.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`), "");
  L.push("## Explicación del código", ...project.explain.map((e) => `- \`${e.code}\`: ${e.text}`), "");
  L.push("## Pruebas", ...project.tests.map((t) => `- [ ] ${t}`), "");
  L.push("## Solución de problemas", ...project.troubleshooting.map((t) => `- **${t.p}:** ${t.s}`), "");
  L.push("## Retos para seguir aprendiendo", ...project.challenges.map((t) => `- ${t}`), "");
  if (score !== null && score !== undefined) L.push(`Puntaje del reto final: ${score}/100`);
  return L.join("\n");
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch { return false; }
  }
}

async function downloadFile(name, content, type = "text/plain") {
  if (DOWNLOADS) {
    try {
      await DOWNLOADS.save({ filename: name.endsWith(".ino") ? `${name}.txt` : name, data: content });
      return "saved";
    } catch (e) {
      return e && e.code === "declined" ? "declined" : "failed";
    }
  }
  try {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "saved";
  } catch {
    return "failed";
  }
}

const UPLOAD_STEPS = [
  { title: "Instala el Arduino IDE", text: "Descárgalo gratis desde arduino.cc/en/software (Windows, Mac o Linux)." },
  { title: "Conecta la placa", text: "Une el Arduino UNO al computador con el cable USB. Se encenderá el LED verde ON." },
  { title: "Elige la placa", text: "Menú Herramientas > Placa > Arduino AVR Boards > Arduino Uno." },
  { title: "Elige el puerto", text: "Herramientas > Puerto: COMx en Windows o /dev/cu.usbmodem… en Mac." },
  { title: "Pega el código", text: "Crea un archivo nuevo (Archivo > Nuevo), borra lo que trae y pega el código copiado." },
  { title: "Verifica", text: "Pulsa el botón ✓ (Verificar). Debe decir \"Compilado\" sin errores." },
  { title: "Sube el código", text: "Pulsa la flecha → (Subir). Los LEDs TX/RX parpadean y aparece \"Subido\"." },
  { title: "Abre el Monitor Serie", text: "Herramientas > Monitor Serie y elige 9600 baudios para ver los mensajes." },
];

/* =========================================================================
   MOTOR IA (Anthropic /v1/messages) + RESPALDO LOCAL
   ========================================================================= */

/* Capacidades de la página publicada en claude.ai (si existen) */
let SAMPLE = null;
let DOWNLOADS = null;

async function initCapabilities() {
  const cl = typeof window !== "undefined" ? window.claude : undefined;
  if (!cl || typeof cl.use !== "function") return { sample: null, tools: 0 };
  try {
    const [smp, dl] = await Promise.all([
      cl.use("sample").catch(() => null),
      cl.use("downloads").catch(() => null),
    ]);
    SAMPLE = typeof smp === "function" ? smp : null;
    DOWNLOADS = dl || null;
    let tools = 0;
    if (SAMPLE) {
      const lim = await SAMPLE.limits().catch(() => null);
      tools = lim && lim.tools ? lim.tools.maxCount || 8 : 0;
    }
    return { sample: SAMPLE, tools };
  } catch {
    return { sample: null, tools: 0 };
  }
}

function extractJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("La IA no devolvió JSON válido");
  return JSON.parse(text.slice(start, end + 1));
}

function errorText(err) {
  if (!err) return "Error desconocido";
  if (typeof err === "string") return err;
  return err.message || err.code || "Error desconocido";
}

async function postMessages(api, body, signal) {
  const headers = { "Content-Type": "application/json" };
  if (api.key) {
    headers["x-api-key"] = api.key;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort);
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({ model: api.model || DEFAULT_MODEL, ...body }),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 160)}`);
    const data = await res.json();
    if (data.stop_reason === "refusal") throw new Error("El modelo declinó la solicitud");
    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      if (signal && signal.aborted) throw { code: "cancelled", message: "Detenido" };
      throw new Error("Tiempo de espera agotado");
    }
    throw err;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

async function callLLM(api, system, user, maxTokens = 3000) {
  const data = await postMessages(api, {
    max_tokens: maxTokens,
    messages: [{ role: "user", content: system ? `${system}\n\n${user}` : user }],
  });
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  if (!text) throw new Error("Respuesta vacía de la IA");
  return text;
}

/* Una sola puerta para pedir algo a la IA, sea cual sea el motor */
async function callAI(api, prompt, { maxTokens = 3000, json = false } = {}) {
  if (api.engine === "sample" && SAMPLE) {
    if (json) return SAMPLE.json(prompt, { cache: false });
    const { text } = await SAMPLE(prompt, { cache: false });
    return text;
  }
  const text = await callLLM(api, "", prompt, maxTokens);
  return json ? extractJSON(text) : text;
}

async function pingAI(api) {
  const out = await callLLM(api, "Responde únicamente con la palabra OK.", "Prueba de conexión.", 10);
  return /ok/i.test(out);
}

function sanitizeProject(raw, level) {
  const arr = (v) => (Array.isArray(v) ? v : []);
  const str = (v, d = "") => (typeof v === "string" && v.trim() ? v.trim() : d);
  const connections = arr(raw.connections).map((cn) => {
    if (Array.isArray(cn.from)) return { from: cn.from, to: cn.to, color: normalize(str(cn.color, "azul")), via: str(cn.via), note: str(cn.note) };
    return {
      from: [str(cn.fromPart, "Componente"), str(cn.fromPin, "Pin")],
      to: [str(cn.toPart, "Arduino") === "Arduino UNO" ? "Arduino" : str(cn.toPart, "Arduino"), str(cn.toPin, "GND").replace(/^pin\s*/i, "").replace(/^(\d+)$/, "D$1")],
      color: normalize(str(cn.color, "azul")).replace("marrón", "marron"),
      via: str(cn.via),
      note: str(cn.note),
    };
  }).filter((cn) => cn.from[0] && cn.to[0]);
  const quiz = arr(raw.quiz).filter((q) => q && q.q && arr(q.options).length >= 2).map((q) => ({
    q: q.q, options: q.options.slice(0, 4), a: clamp(Number(q.a) || 0, 0, q.options.length - 1), why: str(q.why),
  }));
  if (!str(raw.code) || connections.length === 0 || quiz.length < 2) throw new Error("Proyecto incompleto generado por la IA");
  return {
    id: `ia-${Date.now()}`,
    title: str(raw.title, "Proyecto personalizado"),
    level: LEVELS.includes(raw.level) ? raw.level : level,
    age: str(raw.age, "10+ años"),
    duration: str(raw.duration, "45 min"),
    icon: "custom",
    summary: str(raw.summary, ""),
    goals: arr(raw.goals).map(String),
    components: arr(raw.components).map((m) => ({ name: str(m.name, "Componente"), qty: Number(m.qty) || 1, note: str(m.note) })),
    prep: arr(raw.prep).map(String),
    connections,
    libraries: arr(raw.libraries).map(String),
    code: raw.code,
    explain: arr(raw.explain).map((e) => ({ code: str(e.code), text: str(e.text) })).filter((e) => e.text),
    tests: arr(raw.tests).map(String),
    troubleshooting: arr(raw.troubleshooting).map((t) => ({ p: str(t.p || t.problem), s: str(t.s || t.solution) })).filter((t) => t.p),
    quiz,
    challenges: arr(raw.challenges).map(String),
    ai: true,
  };
}

async function generateProjectAI(api, { idea, parts, level }) {
  const system = "Eres EDIA, profesor experto en robótica educativa con Arduino UNO. Diseñas proyectos seguros, que funcionan a la primera y con código que compila en el Arduino IDE. Respondes SOLO con JSON válido.";
  const user = `Diseña un proyecto de robótica educativa para Arduino UNO.
- Idea del estudiante: ${idea}
- Componentes que tiene: ${parts || "no especificados (usa componentes comunes de kits de Arduino)"}
- Nivel: ${level}

Reglas: pines válidos del UNO (D2-D13, A0-A5, 5V, 3.3V, GND, VIN); PWM solo en D3, D5, D6, D9, D10, D11; LEDs con resistencia de 220 Ω; motores siempre con driver y alimentación externa con GND común; si usas la librería Servo no uses analogWrite en D9/D10. Código completo, comentado en español, con Serial.begin(9600) y mensajes en el Monitor Serie. Todo en español.

Devuelve este JSON:
{"title":"...","level":"Principiante|Intermedio|Avanzado","age":"10+ años","duration":"45 min","summary":"1-2 frases","goals":["3 objetivos"],
"components":[{"name":"...","qty":1,"note":"..."}],
"prep":["pasos de preparación del montaje"],
"connections":[{"fromPart":"nombre del componente","fromPin":"pin del componente","toPart":"Arduino o nombre de otro componente","toPin":"D9 | A0 | 5V | GND | VIN | pin del otro componente","color":"rojo|negro|naranja|amarillo|verde|azul|morado|blanco|gris","via":"220 Ω si pasa por una resistencia, si no vacío","note":"aclaración breve o vacío"}],
"libraries":["librerías a instalar, vacío si ninguna"],
"code":"código Arduino completo",
"explain":[{"code":"fragmento del código","text":"explicación sencilla"}],
"tests":["pasos para comprobar que funciona"],
"troubleshooting":[{"p":"problema","s":"solución"}],
"quiz":[{"q":"pregunta","options":["4 opciones"],"a":0,"why":"explicación"}],
"challenges":["3 retos de ampliación"]}
Incluye exactamente 4 preguntas en quiz, una conexión por cada cable y nunca omitas GND.`;
  const out = await callAI(api, `${system}\n\n${user}`, { maxTokens: 6000, json: true });
  return sanitizeProject(out, level);
}

function findClosestProject(idea, parts) {
  const text = normalize(`${idea} ${parts}`);
  const keys = {
    semaforo: ["semaforo", "led", "luces", "trafico"],
    pulsador: ["boton", "pulsador", "interruptor", "switch"],
    ldr: ["luz", "ldr", "fotorresist", "noche", "oscur", "lampara"],
    servo: ["servo", "brazo", "pinza", "potenciometro", "angulo"],
    distancia: ["ultrason", "hc-sr04", "distancia", "sensor", "radar", "parking", "estacionamiento"],
    alarma: ["pir", "movimiento", "alarma", "intruso", "seguridad"],
    clima: ["dht", "temperatura", "humedad", "clima", "meteorolog", "invernadero"],
    evasor: ["robot", "motor", "carro", "coche", "l298", "evasor", "obstaculo", "ruedas", "auto"],
  };
  let best = PROJECTS[0];
  let bestScore = -1;
  PROJECTS.forEach((p) => {
    const sc = (keys[p.id] || []).reduce((acc, k) => acc + (text.includes(k) ? 1 : 0), 0);
    if (sc > bestScore) { bestScore = sc; best = p; }
  });
  return best;
}

/* =========================================================================
   AGENTE EDIA: tutor de IA que conversa y actúa dentro de la app
   ========================================================================= */

const AGENT_TOOL_SPECS = [
  { name: "ver_estado", description: "Devuelve la pantalla actual, el proyecto abierto, la fase del taller y los pasos del montaje con su número y si están hechos. Úsala para saber dónde va el estudiante." },
  { name: "ver_detalle_proyecto", description: "Devuelve materiales, conexiones numeradas (componente, pin, destino, color de cable, resistencia), librerías y código del proyecto abierto." },
  { name: "resaltar_cable", description: "Lleva al estudiante a la fase Conexiones y resalta en el diagrama el cable con ese número (1 = primera fila de la tabla de pines).", inputSchema: { type: "object", properties: { numero: { type: "integer", minimum: 1 } }, required: ["numero"] } },
  { name: "marcar_paso", description: "Marca o desmarca un paso del montaje como hecho. Úsala solo cuando el estudiante confirme que ya lo hizo. 'numero' es el número de paso que da ver_estado.", inputSchema: { type: "object", properties: { numero: { type: "integer", minimum: 1 }, hecho: { type: "boolean" } }, required: ["numero"] } },
  { name: "ir_a_fase", description: "Cambia la fase del taller del proyecto abierto.", inputSchema: { type: "object", properties: { fase: { type: "string", enum: ["materiales", "conexiones", "codigo", "prueba"] } }, required: ["fase"] } },
  { name: "abrir_proyecto", description: "Abre un proyecto de la biblioteca por su id y lleva al estudiante al taller. Ids: semaforo, pulsador, ldr, servo, distancia, alarma, clima, evasor.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } },
  { name: "listar_proyectos", description: "Devuelve los proyectos de la biblioteca con id, título, nivel y resumen." },
  { name: "crear_proyecto", description: "Diseña con IA un proyecto nuevo para Arduino UNO a partir de la idea del estudiante y lo abre. Úsala cuando lo que quiere no está en la biblioteca. Tarda hasta un minuto.", inputSchema: { type: "object", properties: { idea: { type: "string" }, componentes: { type: "string" }, nivel: { type: "string", enum: LEVELS } }, required: ["idea"] } },
];

function agentRules(context, withTools) {
  return `Eres "Agente EDIA", el tutor de robótica educativa de la app EDIA Robótica, que guía a niños y jóvenes a construir proyectos con Arduino UNO.
Hablas en español, con frases cortas, amables y claras. Máximo 170 palabras por respuesta. Usa listas numeradas para pasos.
${withTools ? `Puedes actuar dentro de la app con tus herramientas: ver el estado, ver el detalle del proyecto, resaltar cables en el diagrama, marcar pasos del montaje, cambiar de fase, abrir proyectos y crear proyectos nuevos.
Reglas para usarlas:
- Guía de a un paso por vez. Cuando expliques una conexión, resáltala con resaltar_cable.
- Marca un paso como hecho solo cuando el estudiante diga que ya lo hizo; después indícale el siguiente.
- Si no conoces las conexiones del proyecto abierto, consulta ver_detalle_proyecto antes de dar pines.
- Si el estudiante quiere construir algo que no está en la biblioteca, usa crear_proyecto.` : "En esta vista no puedes usar herramientas: da instrucciones claras para que el estudiante las siga en la app."}
- Nunca inventes pines: usa los del proyecto.
- Recuerda la seguridad cuando toque: USB y pilas desconectados al cablear, LEDs con resistencia, motores siempre con driver y alimentación externa.

ESTADO ACTUAL DE LA APP
${context}`;
}

function toTurns(history) {
  const turns = history
    .filter((m) => m.text && m.text.trim())
    .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text.slice(0, 4000) }));
  while (turns.length && turns[0].role !== "user") turns.shift();
  return turns.slice(-12);
}

async function runAgentAI({ api, history, context, impl, onText, signal }) {
  let turns = toTurns(history);
  while (turns.length && turns[0].role !== "user") turns = turns.slice(1);
  if (!turns.length) throw new Error("Sin mensaje");

  if (api.engine === "sample" && SAMPLE) {
    const withTools = api.tools > 0;
    const input = [{ role: "user", content: agentRules(context, withTools) }, ...turns];
    const opts = { onText: ({ text }) => onText(text), signal };
    if (withTools) {
      opts.tools = AGENT_TOOL_SPECS.slice(0, api.tools).map((t) => ({
        name: t.name,
        description: t.description,
        ...(t.inputSchema ? { inputSchema: t.inputSchema } : {}),
        execute: (inp) => impl[t.name](inp || {}),
      }));
    } else {
      opts.cache = false;
    }
    const { text } = await SAMPLE(input, opts);
    return text;
  }

  const tools = AGENT_TOOL_SPECS.map((t) => ({ name: t.name, description: t.description, input_schema: t.inputSchema || { type: "object", properties: {} } }));
  const messages = turns.map((t) => ({ role: t.role, content: t.content }));
  messages[0] = { role: "user", content: `${agentRules(context, true)}\n\nMENSAJE DEL ESTUDIANTE:\n${messages[0].content}` };
  let finalText = "";
  for (let round = 0; round < 6; round++) {
    const data = await postMessages(api, { max_tokens: 2000, tools, messages }, signal);
    const blocks = data.content || [];
    const text = blocks.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (text) {
      finalText = finalText ? `${finalText}\n\n${text}` : text;
      onText(finalText);
    }
    if (data.stop_reason !== "tool_use") break;
    messages.push({ role: "assistant", content: blocks });
    const results = [];
    for (const b of blocks.filter((x) => x.type === "tool_use")) {
      let out;
      let isError = false;
      try {
        if (!impl[b.name]) throw new Error(`Herramienta desconocida: ${b.name}`);
        out = await impl[b.name](b.input || {});
      } catch (e) {
        out = `Error: ${errorText(e)}`;
        isError = true;
      }
      results.push({ type: "tool_result", tool_use_id: b.id, content: typeof out === "string" ? out : JSON.stringify(out), ...(isError ? { is_error: true } : {}) });
    }
    messages.push({ role: "user", content: results });
  }
  if (!finalText) throw new Error("Respuesta vacía del agente");
  return finalText;
}

/* Agente local (sin red): entiende intenciones básicas y usa las mismas herramientas */
async function localAgent(text, impl, state) {
  const m = normalize(text);
  const note = "\n\n(Agente en modo local: conecta la IA para conversaciones libres.)";
  const safe = async (fn) => { try { return await fn(); } catch (e) { return { error: errorText(e) }; } };

  if (state.screen !== "workshop" || !state.project) {
    const wantsBuild = /(abr|quiero|hacer|construir|crear|armar|empezar|proyecto|robot|carro|alarma|semaforo|luz|servo|sensor|temperatura)/.test(m);
    if (/(recomien|cual empiezo|por donde empiezo|principiante|primer proyecto|para empezar)/.test(m)) {
      await safe(() => impl.abrir_proyecto({ id: "semaforo" }));
      return `Te recomiendo empezar por el "Semáforo con LEDs": es corto (30 min) y aprendes lo básico de salidas digitales. Ya te lo abrí.\n\nCuando tengas los materiales, escríbeme "guíame" y te llevo cable por cable.${note}`;
    }
    if (wantsBuild) {
      const p = findClosestProject(text, "");
      await safe(() => impl.abrir_proyecto({ id: p.id }));
      return `Abrí el proyecto "${p.title}" (${p.level}, ${p.duration}). ${p.summary}\n\nRevisa los materiales y escríbeme "guíame" para conectar paso a paso.${note}`;
    }
    return `¡Hola! Soy el Agente EDIA. Puedo abrirte un proyecto y guiarte cable por cable. Prueba con:\n• "Recomiéndame un proyecto para empezar"\n• "Quiero hacer un robot"\n• "Abre la alarma con sensor de movimiento"${note}`;
  }

  const st = await safe(() => impl.ver_estado({}));
  const steps = (st && st.pasos_montaje) || [];
  const next = steps.find((x) => !x.hecho);

  const describeNext = async (prefix = "") => {
    const n = steps.find((x) => !x.hecho);
    if (!n) {
      await safe(() => impl.ir_a_fase({ fase: "codigo" }));
      return `${prefix}¡Montaje completo! 🎉 Te llevé a la fase Código: copia el código, pégalo en el Arduino IDE y súbelo a la placa.`;
    }
    if (n.cable) await safe(() => impl.resaltar_cable({ numero: n.cable }));
    else await safe(() => impl.ir_a_fase({ fase: "conexiones" }));
    return `${prefix}Paso ${n.numero}: ${n.texto}${n.cable ? `\n\nLo resalté en el diagrama (cable ${n.cable}).` : ""}\n\nCuando lo tengas, escríbeme "listo".`;
  };

  if (/(listo|ya (lo )?(conecte|hice|puse)|hecho|termine|ya esta|ok ya)/.test(m) && !/siguiente paso|guiame/.test(m) && next) {
    await safe(() => impl.marcar_paso({ numero: next.numero, hecho: true }));
    steps.forEach((x) => { if (x.numero === next.numero) x.hecho = true; });
    return (await describeNext(`¡Bien! Marqué el paso ${next.numero} como hecho.\n\n`)) + note;
  }
  if (/(guia|siguiente paso|que sigue|que hago|como conecto|conectar|conexion|cable|empez)/.test(m)) {
    return (await describeNext()) + note;
  }
  if (/(codigo|programa|subir|cargar)/.test(m)) {
    await safe(() => impl.ir_a_fase({ fase: "codigo" }));
    return localSupport({ kind: "explain", message: text, project: state.project, phase: "Código" }) + note;
  }
  if (/(prueba|reto|quiz|cuestionario)/.test(m)) {
    await safe(() => impl.ir_a_fase({ fase: "prueba" }));
    return `Te llevé a la fase "Prueba y reto". Haz las pruebas de la lista y luego responde el reto final: necesitas 70% para completar el proyecto.${note}`;
  }
  if (/(no funciona|falla|error|no prende|no enciende|ayuda|problema)/.test(m)) {
    return localSupport({ kind: "broken", message: text, project: state.project, phase: st && st.fase }) + note;
  }
  if (/(explica|que hace|para que sirve)/.test(m) && /(codigo|linea|funcion|setup|loop)/.test(m)) {
    return localSupport({ kind: "explain", message: text, project: state.project, phase: st && st.fase }) + note;
  }
  return localSupport({ kind: "free", message: text, project: state.project, phase: (st && st.fase) || "" });
}

function localSupport({ kind, message, project, phase }) {
  if (kind === "explain") {
    return `Así funciona el código de "${project.title}":\n\n${project.explain.map((e, i) => `${i + 1}. ${e.code}\n   → ${e.text}`).join("\n\n")}\n\nTodo programa de Arduino tiene setup() (se ejecuta una vez al encender) y loop() (se repite para siempre).`;
  }
  if (kind === "connect") {
    return `Conexiones de "${project.title}", una por una:\n\n${project.connections.map((cn, i) => `${i + 1}. ${connectionText(cn)}${cn.note ? ` (${cn.note})` : ""}`).join("\n")}\n\n💡 Hazlas con el USB desconectado y revisa cada cable antes de encender.`;
  }
  if (kind === "broken") {
    return `Revisemos paso a paso:\n\n${project.troubleshooting.map((t, i) => `${i + 1}. ${t.p}: ${t.s}`).join("\n")}\n\nComprobaciones generales:\n• ¿El LED ON del Arduino está encendido?\n• ¿Elegiste Placa \"Arduino Uno\" y el puerto correcto?\n• ¿Todos los GND están unidos?\n• ¿El Monitor Serie está a 9600 baudios?`;
  }
  const m = normalize(message);
  if (/(no (sube|carga)|avrdude|puerto|port|upload|subir|stk500|no se conecta)/.test(m)) {
    return "Si el código no se sube a la placa:\n1. Revisa Herramientas > Placa: \"Arduino Uno\".\n2. Revisa Herramientas > Puerto: desconecta y vuelve a conectar el USB para ver cuál aparece.\n3. Usa un cable USB de datos (algunos solo cargan).\n4. Desconecta lo que tengas en los pines D0 y D1.\n5. Si es un clon con chip CH340, instala su driver.\n6. Cierra el Monitor Serie y vuelve a intentar.";
  }
  if (/(resistencia|ohm|colores|220|10k)/.test(m)) {
    return "Resistencias más usadas:\n• 220 Ω: rojo-rojo-marrón → para LEDs.\n• 1 kΩ: marrón-negro-rojo.\n• 10 kΩ: marrón-negro-naranja → divisores de voltaje (LDR) y pull-down.\nLa última banda (dorada o plateada) es la tolerancia: lee los colores empezando por el otro lado.";
  }
  if (/(protoboard|breadboard|placa de pruebas)/.test(m)) {
    return "Cómo funciona la protoboard:\n• Las filas de 5 agujeros (a-e y f-j) están unidas entre sí.\n• El canal central separa ambos lados.\n• Las líneas largas de los bordes (roja + y azul −) recorren toda la placa: úsalas para 5V y GND.\n• En algunas protoboards las líneas de los bordes están cortadas a la mitad: une ambas partes con un cable.";
  }
  if (/(librer|library|include|no such file)/.test(m)) {
    return `Para instalar una librería:\n1. En el Arduino IDE ve a Programa > Incluir librería > Administrar bibliotecas.\n2. Busca su nombre${project.libraries.length ? ` (para este proyecto: ${project.libraries.join("; ")})` : ""}.\n3. Pulsa Instalar y acepta las dependencias.\n4. Vuelve a verificar el código.`;
  }
  if (/(monitor|serial|serie|baudio|caracteres raros)/.test(m)) {
    return "Monitor Serie:\n• Ábrelo en Herramientas > Monitor Serie (o la lupa arriba a la derecha).\n• Elige 9600 baudios, igual que Serial.begin(9600).\n• Si ves caracteres raros, la velocidad no coincide.\n• Ciérralo antes de subir un código nuevo si da error.";
  }
  if (/(motor|bateria|pila|l298|driver)/.test(m)) {
    return "Motores con seguridad:\n• Nunca los conectes directo a un pin: usa un driver como el L298N.\n• Aliméntalos con pilas o baterías (7-12 V) en la entrada 12V del driver.\n• Une siempre el GND de las pilas, del driver y del Arduino.\n• Si el Arduino se reinicia al arrancar, las pilas están bajas.";
  }
  if (/(servo|tiembla)/.test(m)) {
    return "Si el servo tiembla o el Arduino se reinicia, es falta de corriente. Usa una fuente de 5V externa (4 pilas AA) para el servo, une su GND con el del Arduino y deja solo el cable de señal en el pin.";
  }
  if (/(led|no enciende|no prende)/.test(m)) {
    return "Si un LED no enciende:\n1. Gíralo: la pata larga va hacia el pin (con su resistencia).\n2. Comprueba que la pata corta llegue a GND.\n3. Prueba el LED con otro pin o con el código Blink.\n4. Revisa que la resistencia sea de 220 Ω y no de 10 kΩ.";
  }
  return `Estás en la fase "${phase}" del proyecto "${project.title}". Puedo ayudarte con:\n• Las conexiones (botón \"¿Cómo conecto esto?\").\n• Entender el código (botón \"Explícame el código\").\n• Encontrar fallos (botón \"No funciona, ayúdame\").\n• Subir el código, librerías, protoboard, resistencias o el Monitor Serie: pregúntame directamente.\n\n(Respuesta del Motor de Respaldo Local: conecta la IA para respuestas totalmente personalizadas.)`;
}

/* =========================================================================
   COMPONENTES UI BASE
   ========================================================================= */

const Glass = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-black/20 ${className}`}>{children}</div>
);

function Logo({ size = "md" }) {
  const box = size === "lg" ? "w-14 h-14" : "w-9 h-9";
  return (
    <div className="flex items-center gap-3">
      <div className={`${box} rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 relative shrink-0`}>
        <Cpu size={size === "lg" ? 28 : 18} className="text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
      </div>
      <div className="leading-tight text-left">
        <div className={`font-black tracking-tight text-white ${size === "lg" ? "text-3xl" : "text-base"}`}>
          EDIA <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Robótica</span>
        </div>
        {size !== "lg" && <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Copiloto Arduino UNO</div>}
      </div>
    </div>
  );
}

function StatusPill({ api, compact = false }) {
  const map = {
    online: { cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400", icon: <Wifi size={14} />, label: "IA Activa" },
    checking: { cls: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300", dot: "bg-cyan-400", icon: <Loader2 size={14} className="animate-spin" />, label: "Conectando IA..." },
    offline: { cls: "border-amber-500/30 bg-amber-500/10 text-amber-300", dot: "bg-amber-400", icon: <WifiOff size={14} />, label: "Modo Respaldo Local" },
  };
  const st = map[api.status] || map.offline;
  return (
    <div title={api.status === "offline" && api.error ? `Motivo: ${api.error}` : st.label} className={`flex items-center gap-2 rounded-full font-medium border ${st.cls} ${compact ? "px-2 py-1.5 text-[11px]" : "px-3 py-1.5 text-xs"}`}>
      {st.icon}
      <span className={compact ? "hidden xl:inline" : "hidden sm:inline"}>{st.label}</span>
      <span className={`w-2 h-2 rounded-full ${st.dot} animate-pulse`} />
    </div>
  );
}

function ApiModal({ api, onSave, onClose }) {
  const [key, setKey] = useState(api.key || "");
  const [model, setModel] = useState(api.model || "");
  const [show, setShow] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm fade-in">
      <Glass className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white font-bold"><KeyRound size={18} className="text-cyan-400" /> Conexión de IA</div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
        </div>
        <div className="mb-4 flex"><StatusPill api={api} /></div>
        {api.status === "offline" && api.error && <p className="text-[11px] text-amber-300/80 mb-4">Último error: {api.error}</p>}
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">Dentro de los Artifacts de Claude la IA funciona de forma nativa y <b className="text-slate-200">no necesitas API Key</b>. Ingresa una clave de Anthropic solo si usas este código fuera de Claude.</p>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Key de Anthropic (opcional)</label>
        <div className="relative mt-2 mb-4">
          <input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <button onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-slate-500">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modelo</label>
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder={DEFAULT_MODEL} className="w-full mt-2 mb-4 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" />
        <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">La clave solo vive en la memoria de esta pestaña. Sin conexión, EDIA usa su biblioteca de 8 proyectos probados y el Agente en modo local.</p>
        <div className="flex gap-2">
          <button onClick={() => { onSave({ key: "", model: model.trim() }); onClose(); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 flex items-center justify-center gap-1.5"><RotateCcw size={14} /> {key ? "Quitar clave" : "Reintentar"}</button>
          <button onClick={() => { onSave({ key: key.trim(), model: model.trim() }); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-semibold">Guardar y conectar</button>
        </div>
      </Glass>
    </div>
  );
}

function TopBar({ api, onOpenApi, onHome }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <button onClick={onHome}><Logo /></button>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onOpenApi}><StatusPill api={api} /></button>
          <button onClick={onOpenApi} title="API Key opcional" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition">
            <KeyRound size={14} /> <span className="hidden sm:inline">API Key</span>
          </button>
        </div>
      </div>
    </header>
  );
}

const LEVEL_STYLE = {
  Principiante: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Intermedio: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Avanzado: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
};

const ICONS = { traffic: Zap, button: Circle, light: Lightbulb, servo: Wrench, radar: Search, alarm: ShieldAlert, weather: FlaskConical, robot: Bot, custom: Sparkles };

/* ---------- Bloque de código con resaltado ---------- */

const TOKEN_RE = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(#\w+)|\b(void|int|long|float|bool|const|unsigned|if|else|return|for|while|true|false|char|byte|define)\b|\b(pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|delayMicroseconds|millis|pulseIn|map|constrain|abs|isnan|Serial|setup|loop|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|Servo|DHT)\b|\b(\d+(?:\.\d+)?(?:UL)?)\b/g;

function highlight(line) {
  const out = [];
  let last = 0;
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const cls = m[1] ? "text-slate-500 italic" : m[2] ? "text-emerald-300" : m[3] ? "text-pink-400" : m[4] ? "text-indigo-300 font-semibold" : m[5] ? "text-cyan-300" : "text-amber-300";
    out.push(<span key={m.index} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
    if (m[0].length === 0) TOKEN_RE.lastIndex++;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function CodeBlock({ code, fileName }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  const doCopy = async () => { if (await copyText(code)) { setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0b1120] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0"><Terminal size={14} className="text-cyan-400 shrink-0" /> <span className="truncate">{fileName}</span></div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => downloadFile(fileName, code)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"><Download size={13} /> <span className="hidden sm:inline">.ino</span></button>
          <button onClick={doCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${copied ? "bg-emerald-500 text-slate-950" : "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white"}`}>{copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar código</>}</button>
        </div>
      </div>
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
        <pre className="text-[12.5px] leading-6 font-mono py-3">
          {lines.map((ln, i) => (
            <div key={i} className="flex hover:bg-slate-800/40">
              <span className="select-none w-11 shrink-0 text-right pr-4 text-slate-600">{i + 1}</span>
              <code className="text-slate-200 pr-4 whitespace-pre">{highlight(ln)}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

/* ---------- Diagrama de conexiones (SVG generado) ---------- */

function WiringDiagram({ project, highlightIdx, onHover }) {
  const { parts, pins } = useMemo(() => partsOf(project), [project]);
  const aPins = useMemo(() => arduinoPinsOf(project), [project]);
  const ROW = 26;
  const AX = 20;
  const AW = 170;
  const AY = 20;
  const aHeight = Math.max(220, 60 + aPins.length * ROW);
  const PX = 540;
  const PW = 230;
  const PROW = 24;
  const partBoxes = [];
  let y = AY;
  parts.forEach((p) => {
    const h = 40 + pins[p].length * PROW;
    partBoxes.push({ name: p, y, h });
    y += h + 16;
  });
  const height = Math.max(AY + aHeight, y) + 30;
  const aPinY = (pin) => AY + 52 + aPins.indexOf(pin) * ROW;
  const partPinPos = (part, pin) => {
    const box = partBoxes.find((b) => b.name === part);
    return { x: PX, y: box.y + 44 + pins[part].indexOf(pin) * PROW };
  };
  const endPoint = ([part, pin]) => (part === "Arduino" ? { x: AX + AW, y: aPinY(pin), arduino: true } : partPinPos(part, pin));

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0b1120]">
      <svg viewBox={`0 0 800 ${height}`} className="min-w-[640px] w-full" role="img" aria-label={`Diagrama de conexiones de ${project.title}`}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.6" /></pattern>
        </defs>
        <rect x="0" y="0" width="800" height={height} fill="url(#grid)" />
        <rect x={AX} y={AY} width={AW} height={aHeight} rx="14" fill="#0e4f6b" stroke="#22d3ee" strokeWidth="1.5" />
        <rect x={AX + 14} y={AY + aHeight - 46} width="46" height="30" rx="4" fill="#94a3b8" />
        <text x={AX + 37} y={AY + aHeight - 27} fontSize="9" textAnchor="middle" fill="#0f172a" fontWeight="700">USB</text>
        <text x={AX + 16} y={AY + 26} fontSize="13" fontWeight="800" fill="#ffffff">ARDUINO UNO</text>
        {aPins.map((pin) => (
          <g key={pin}>
            <circle cx={AX + AW} cy={aPinY(pin)} r="5" fill={pin === "GND" ? "#334155" : pin === "5V" || pin === "VIN" || pin === "3.3V" ? "#dc2626" : "#0f172a"} stroke="#e2e8f0" strokeWidth="1.2" />
            <text x={AX + AW - 12} y={aPinY(pin) + 4} fontSize="12" textAnchor="end" fill="#e2e8f0" fontWeight="700" fontFamily="monospace">{pin}</text>
          </g>
        ))}
        {partBoxes.map((b) => (
          <g key={b.name}>
            <rect x={PX} y={b.y} width={PW} height={b.h} rx="10" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.2" />
            <text x={PX + 14} y={b.y + 24} fontSize="12.5" fontWeight="700" fill="#ffffff">{b.name.length > 28 ? `${b.name.slice(0, 27)}…` : b.name}</text>
            {pins[b.name].map((pin, j) => (
              <g key={pin}>
                <circle cx={PX} cy={b.y + 44 + j * PROW} r="4.5" fill="#0f172a" stroke="#c7d2fe" strokeWidth="1.2" />
                <text x={PX + 12} y={b.y + 48 + j * PROW} fontSize="11" fill="#c7d2fe">{pin.length > 30 ? `${pin.slice(0, 29)}…` : pin}</text>
              </g>
            ))}
          </g>
        ))}
        {project.connections.map((cn, i) => {
          const a = endPoint(cn.to);
          const b = endPoint(cn.from);
          const color = WIRE_COLORS[cn.color] || WIRE_COLORS.azul;
          const active = highlightIdx === i;
          const dim = highlightIdx !== null && highlightIdx !== undefined && !active;
          let d;
          let mid;
          if (a.arduino || b.arduino) {
            const s = a.arduino ? a : b;
            const t = a.arduino ? b : a;
            d = `M ${s.x} ${s.y} C ${s.x + 140} ${s.y}, ${t.x - 140} ${t.y}, ${t.x} ${t.y}`;
            mid = { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };
          } else {
            const off = 50 + (i % 4) * 22;
            d = `M ${a.x} ${a.y} C ${a.x - off} ${a.y}, ${b.x - off} ${b.y}, ${b.x} ${b.y}`;
            mid = { x: a.x - off * 0.75, y: (a.y + b.y) / 2 };
          }
          return (
            <g key={i} onMouseEnter={() => onHover && onHover(i)} onMouseLeave={() => onHover && onHover(null)} style={{ cursor: "pointer" }}>
              <path d={d} fill="none" stroke="transparent" strokeWidth="12" />
              <path d={d} fill="none" stroke={color} strokeWidth={active ? 4.5 : 2.6} strokeLinecap="round" opacity={dim ? 0.18 : 1} strokeDasharray={cn.color === "negro" ? "6 4" : undefined} className={active ? "wire-pulse" : ""} />
              {cn.via && (
                <g opacity={dim ? 0.25 : 1}>
                  <rect x={mid.x - 24} y={mid.y - 9} width="48" height="18" rx="4" fill="#d6b98c" stroke="#78350f" />
                  <text x={mid.x} y={mid.y + 4} fontSize="10" textAnchor="middle" fill="#3b2a12" fontWeight="700">{cn.via}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* =========================================================================
   PANTALLA 1: INICIO
   ========================================================================= */

function Landing({ onStart }) {
  const steps = [
    { icon: Layers, title: "1. Elige o crea tu proyecto", text: "8 proyectos probados, de principiante a avanzado, o describe tu idea y la IA lo diseña para ti.", color: "from-cyan-500 to-cyan-400" },
    { icon: Bot, title: "2. Conecta con el Agente IA", text: "El Agente EDIA te guía cable por cable, resalta cada conexión en el diagrama y marca tu avance.", color: "from-indigo-500 to-indigo-400" },
    { icon: Usb, title: "3. Carga el código y supera el reto", text: "Copia el código para tu Arduino UNO, súbelo, pruébalo y aprueba el reto final con 70% o más.", color: "from-emerald-500 to-emerald-400" },
  ];
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 sm:py-20 fade-in">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-8">
          <Sparkles size={14} /> Robótica educativa · Arduino UNO · Agente IA
        </div>
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          Tu copiloto para construir <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">proyectos de robótica con Arduino</span>
        </h1>
        <p className="mt-5 text-slate-400 text-base sm:text-lg">Te dice qué materiales usar, cómo conectar cada cable y te da el código listo para cargar en tu placa. Y el Agente EDIA te acompaña paso a paso hasta que funcione.</p>
        <button onClick={onStart} className="group mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:scale-[1.03] transition-all glow">
          <Rocket size={22} /> Comenzar a construir <ChevronRight size={20} className="group-hover:translate-x-1 transition" />
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-5 mt-16">
        {steps.map(({ icon: Icon, title, text, color }) => (
          <Glass key={title} className="p-6 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}><Icon size={20} className="text-white" /></div>
            <h3 className="font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
          </Glass>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><ShieldAlert size={14} className="text-amber-400" /> Normas de seguridad en cada montaje</span>
        <span className="flex items-center gap-1.5"><Code2 size={14} className="text-cyan-400" /> Código comentado en español</span>
        <span className="flex items-center gap-1.5"><WifiOff size={14} className="text-emerald-400" /> Funciona aunque falle la red</span>
      </div>
    </main>
  );
}

/* =========================================================================
   PANTALLA 2: CATÁLOGO + CREAR CON IA
   ========================================================================= */

function Catalog({ onBack, onOpen, onCreate, creating }) {
  const [filter, setFilter] = useState("Todos");
  const [idea, setIdea] = useState("");
  const [parts, setParts] = useState("");
  const [level, setLevel] = useState("Principiante");
  const list = PROJECTS.filter((p) => filter === "Todos" || p.level === filter);
  const examples = ["Un carro que esquiva paredes", "Alarma para mi cuarto", "Riego automático de una planta", "Un brazo robótico con 2 servos"];
  return (
    <main className="max-w-6xl mx-auto px-4 py-10 fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"><ArrowLeft size={16} /> Volver</button>
      <div className="mb-8">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-2">Paso 1</div>
        <h2 className="text-3xl font-black text-white">Elige tu proyecto</h2>
        <p className="text-slate-400 mt-2">Cada proyecto incluye materiales, diagrama de conexiones, código para Arduino UNO y un reto final.</p>
      </div>

      <Glass className="p-5 sm:p-6 mb-8 border-indigo-500/30">
        <div className="flex items-center gap-2 text-white font-bold mb-1"><Wand2 size={18} className="text-indigo-400" /> Crear un proyecto con IA</div>
        <p className="text-xs text-slate-400 mb-4">Describe lo que quieres construir y los componentes que tienes. EDIA diseña las conexiones y el código para tu Arduino UNO.</p>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="idea" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">¿Qué quieres construir?</label>
            <textarea id="idea" value={idea} onChange={(e) => setIdea(e.target.value)} rows={3} placeholder="Ej. Un robot que siga una línea negra en el piso" className="mt-1.5 w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none" />
            <div className="flex flex-wrap gap-1.5 mt-1.5">{examples.map((ex) => <button key={ex} onClick={() => setIdea(ex)} className="text-[11px] px-2 py-1 rounded-md bg-slate-800/80 text-slate-400 hover:text-indigo-300">{ex}</button>)}</div>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="parts" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Componentes que tienes (opcional)</label>
              <input id="parts" value={parts} onChange={(e) => setParts(e.target.value)} placeholder="Ej. 2 sensores IR, L298N, 2 motores, pilas" className="mt-1.5 w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => <button key={l} onClick={() => setLevel(l)} className={`py-2 rounded-xl text-xs font-medium border transition ${level === l ? "border-indigo-500 bg-indigo-500/10 text-indigo-300" : "border-slate-800 text-slate-400 hover:border-slate-700"}`}>{l}</button>)}
            </div>
            <button disabled={!idea.trim() || creating} onClick={() => onCreate({ idea, parts, level })} className="mt-auto py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
              {creating ? <><Loader2 size={16} className="animate-spin" /> EDIA está diseñando tu proyecto...</> : <><Sparkles size={16} /> Diseñar mi proyecto</>}
            </button>
          </div>
        </div>
      </Glass>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {["Todos", ...LEVELS].map((l) => (
          <button key={l} onClick={() => setFilter(l)} className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${filter === l ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-slate-800 text-slate-400 hover:border-slate-700"}`}>{l}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => {
          const Icon = ICONS[p.icon] || Cpu;
          return (
            <button key={p.id} onClick={() => onOpen(p)} className="text-left group">
              <Glass className="p-5 h-full flex flex-col hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center"><Icon size={20} className="text-cyan-300" /></div>
                  <span className={`text-[10px] px-2 py-1 rounded-md border font-semibold ${LEVEL_STYLE[p.level]}`}>{p.level}</span>
                </div>
                <h3 className="font-bold text-white">{p.title}</h3>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed flex-1">{p.summary}</p>
                <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {p.duration}</span>
                  <span className="flex items-center gap-1"><Package size={12} /> {p.components.length} materiales</span>
                  <span className="flex items-center gap-1"><Cable size={12} /> {p.connections.length} cables</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-300 group-hover:gap-2 transition-all">Empezar proyecto <ChevronRight size={14} /></div>
              </Glass>
            </button>
          );
        })}
      </div>
    </main>
  );
}

/* =========================================================================
   PANTALLA 3: TALLER DEL PROYECTO
   ========================================================================= */

function PhaseMaterials({ project, have, setHave, onNext }) {
  const count = Object.values(have).filter(Boolean).length;
  return (
    <div className="space-y-5 fade-in">
      <div>
        <h3 className="text-xl font-bold text-white">¿Tienes todo lo necesario?</h3>
        <p className="text-sm text-slate-400 mt-1">Marca cada material cuando lo tengas sobre la mesa.</p>
      </div>
      <div className="space-y-2">
        {project.components.map((m, i) => (
          <button key={i} onClick={() => setHave({ ...have, [i]: !have[i] })} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${have[i] ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}>
            {have[i] ? <CheckCircle2 size={20} className="text-emerald-400 shrink-0" /> : <Circle size={20} className="text-slate-600 shrink-0" />}
            <span className="w-9 text-center text-sm font-bold text-cyan-300 tabular-nums shrink-0">{m.qty}×</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-white font-medium">{m.name}</span>
              {m.note && <span className="block text-xs text-slate-500">{m.note}</span>}
            </span>
          </button>
        ))}
      </div>
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Lo que vas a aprender</div>
        <ul className="space-y-1.5">{project.goals.map((g, i) => <li key={i} className="flex gap-2 text-sm text-slate-300"><Lightbulb size={15} className="text-amber-400 shrink-0 mt-0.5" />{g}</li>)}</ul>
      </div>
      <button onClick={onNext} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold flex items-center justify-center gap-2">
        {count === project.components.length ? "¡Tengo todo! Ir a las conexiones" : "Continuar a las conexiones"} <ChevronRight size={18} />
      </button>
    </div>
  );
}

function PhaseConnections({ project, done, setDone, onNext, highlight, setHighlight }) {
  const items = assemblySteps(project);
  const total = items.length;
  const count = items.filter((_, k) => done[k]).length;
  const all = count === total;
  const nextIdx = items.findIndex((_, k) => !done[k]);
  return (
    <div className="space-y-5 fade-in">
      <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex gap-3">
        <ShieldAlert size={20} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-100"><b>Antes de empezar:</b> desconecta el cable USB y las pilas. Conecta todo, revisa y solo después energiza el circuito.</div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">Diagrama de conexiones</h3>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Pasa el ratón por un cable o una fila para resaltarlo</span>
        </div>
        <WiringDiagram project={project} highlightIdx={highlight} onHover={setHighlight} />
        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-500 inline-block" /> 5V / positivo</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 border-t-2 border-dashed border-slate-500 inline-block" /> GND (cable negro)</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-6 h-3 rounded-sm bg-[#d6b98c]" /> Resistencia en el camino</span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Tabla de pines</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400">
              <tr><th className="text-left px-3 py-2.5">#</th><th className="text-left px-3 py-2.5">Componente</th><th className="text-left px-3 py-2.5">Pin del componente</th><th className="text-left px-3 py-2.5">Va a</th><th className="text-left px-3 py-2.5">Cable</th></tr>
            </thead>
            <tbody>
              {project.connections.map((cn, i) => (
                <tr key={i} onMouseEnter={() => setHighlight(i)} onMouseLeave={() => setHighlight(null)} className={`border-t border-slate-800/80 transition ${highlight === i ? "bg-cyan-500/10" : ""}`}>
                  <td className="px-3 py-2 text-slate-500 tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2 text-white font-medium">{cn.from[0]}</td>
                  <td className="px-3 py-2 text-slate-300">{cn.from[1]}</td>
                  <td className="px-3 py-2">
                    <span className="font-mono font-bold text-cyan-300">{cn.to[0] === "Arduino" ? `Arduino ${cn.to[1]}` : `${cn.to[0]} · ${cn.to[1]}`}</span>
                    {cn.via && <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">vía {cn.via}</span>}
                  </td>
                  <td className="px-3 py-2"><span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 rounded-full border border-slate-600" style={{ background: WIRE_COLORS[cn.color] || WIRE_COLORS.azul }} />{cn.color}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">Montaje paso a paso</h3>
          <span className="text-xs text-slate-400 tabular-nums">{count}/{total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3"><div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500" style={{ width: `${(count / total) * 100}%` }} /></div>
        <div className="space-y-2">
          {items.map((it, k) => {
            const isNext = k === nextIdx;
            return (
              <button key={k} onClick={() => setDone({ ...done, [k]: !done[k] })} onMouseEnter={() => it.type === "conn" && setHighlight(it.i)} onMouseLeave={() => setHighlight(null)} className={`w-full flex gap-3 p-3.5 rounded-xl border text-left transition ${done[k] ? "border-emerald-500/40 bg-emerald-500/5" : isNext ? "border-cyan-500/60 bg-cyan-500/10 ring-1 ring-cyan-500/30" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}>
                {done[k] ? <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" /> : <Circle size={20} className={`${isNext ? "text-cyan-400" : "text-slate-600"} shrink-0 mt-0.5`} />}
                <span className="flex-1 min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider mb-0.5 text-slate-500">Paso {k + 1} · {it.type === "prep" ? "Preparación" : `Cable ${it.i + 1}`}{isNext && <span className="text-cyan-400"> · Ahora</span>}</span>
                  {it.type === "prep" ? (
                    <span className="block text-sm text-slate-200">{it.text}</span>
                  ) : (
                    <span className="block text-sm text-slate-200">
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle" style={{ background: WIRE_COLORS[it.cn.color] || WIRE_COLORS.azul }} />
                      {connectionText(it.cn)}
                      {it.cn.note && <span className="block text-xs text-amber-300/90 mt-1">💡 {it.cn.note}</span>}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {all ? (
        <button onClick={onNext} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black flex items-center justify-center gap-2 unlock glow-green">
          <CheckCircle2 size={18} /> ¡Todo conectado! Ir al código <ChevronRight size={18} />
        </button>
      ) : (
        <div className="space-y-2">
          <button disabled className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-500 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"><Lock size={16} /> Completa los {total - count} pasos restantes para ver el código</button>
          <button onClick={onNext} className="w-full text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2">Ver el código sin terminar el montaje</button>
        </div>
      )}
    </div>
  );
}

function PhaseCode({ project, onNext }) {
  const fileName = `${normalize(project.title).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}.ino`;
  return (
    <div className="space-y-5 fade-in">
      <div>
        <h3 className="text-xl font-bold text-white">Código para tu Arduino UNO</h3>
        <p className="text-sm text-slate-400 mt-1">Cópialo, pégalo en el Arduino IDE y súbelo a la placa.</p>
      </div>
      {project.libraries.length > 0 && (
        <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10">
          <div className="flex items-center gap-2 text-indigo-200 font-bold text-sm mb-2"><BookOpen size={16} /> Antes de subir: instala estas librerías</div>
          <ul className="space-y-1 text-sm text-slate-200">{project.libraries.map((l, i) => <li key={i} className="flex gap-2"><span className="text-indigo-400">•</span>{l}</li>)}</ul>
          <p className="text-xs text-slate-400 mt-2">Arduino IDE → Programa → Incluir librería → Administrar bibliotecas → busca el nombre → Instalar.</p>
        </div>
      )}
      <CodeBlock code={project.code} fileName={fileName} />
      <div>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Usb size={18} className="text-cyan-400" /> Cómo cargarlo en la placa</h3>
        <ol className="grid sm:grid-cols-2 gap-2">
          {UPLOAD_STEPS.map((s, i) => (
            <li key={i} className="flex gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/40">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="min-w-0"><span className="block text-sm font-semibold text-white">{s.title}</span><span className="block text-xs text-slate-400 leading-relaxed">{s.text}</span></span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Lightbulb size={18} className="text-amber-400" /> Entiende tu código</h3>
        <div className="space-y-2">
          {project.explain.map((e, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
              {e.code && <code className="block text-xs font-mono text-cyan-300 bg-slate-900 rounded-md px-2 py-1 mb-2 overflow-x-auto whitespace-pre">{e.code}</code>}
              <p className="text-sm text-slate-300 leading-relaxed">{e.text}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={onNext} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold flex items-center justify-center gap-2">
        <Check size={18} /> Ya subí el código: probar el proyecto <ChevronRight size={18} />
      </button>
    </div>
  );
}

function PhaseTest({ project, tests, setTests, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [openT, setOpenT] = useState(null);
  const correct = project.quiz.filter((q, i) => answers[i] === q.a).length;
  const score = Math.round((correct / project.quiz.length) * 100);
  const pass = score >= PASS_SCORE;
  const allAnswered = project.quiz.every((_, i) => answers[i] !== undefined);
  const testsDone = project.tests.filter((_, i) => tests[i]).length;

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h3 className="text-xl font-bold text-white mb-1">Comprueba que funciona</h3>
        <p className="text-sm text-slate-400 mb-3">Con el código subido, haz estas pruebas y márcalas.</p>
        <div className="space-y-2">
          {project.tests.map((t, i) => (
            <button key={i} onClick={() => setTests({ ...tests, [i]: !tests[i] })} className={`w-full flex gap-3 p-3.5 rounded-xl border text-left transition ${tests[i] ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-800 bg-slate-950/40 hover:border-slate-700"}`}>
              {tests[i] ? <CheckCircle2 size={20} className="text-emerald-400 shrink-0" /> : <Circle size={20} className="text-slate-600 shrink-0" />}
              <span className="text-sm text-slate-200">{t}</span>
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 mt-2">{testsDone}/{project.tests.length} pruebas superadas</div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Wrench size={18} className="text-amber-400" /> ¿Algo no funciona?</h3>
        <div className="space-y-2">
          {project.troubleshooting.map((t, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
              <button onClick={() => setOpenT(openT === i ? null : i)} className="w-full flex items-center justify-between p-3.5 text-left text-sm text-white">
                <span className="flex items-center gap-2"><AlertTriangle size={15} className="text-amber-400 shrink-0" />{t.p}</span>
                <ChevronRight size={16} className={`text-slate-500 transition shrink-0 ${openT === i ? "rotate-90" : ""}`} />
              </button>
              {openT === i && <p className="px-4 pb-4 text-sm text-slate-300 fade-in">{t.s}</p>}
            </div>
          ))}
        </div>
      </div>

      <Glass className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Trophy size={18} className="text-emerald-400" /> Reto final</h3>
          <span className="text-[11px] text-slate-500">Necesitas {PASS_SCORE}% para completar el proyecto</span>
        </div>
        <p className="text-sm text-slate-400 mb-4">Responde para demostrar que entendiste cómo funciona tu proyecto.</p>
        <div className="space-y-5">
          {project.quiz.map((q, i) => (
            <div key={i}>
              <div className="text-sm font-semibold text-white mb-2">{i + 1}. {q.q}</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options.map((op, j) => {
                  const selected = answers[i] === j;
                  const isRight = checked && j === q.a && (pass || selected);
                  const isWrong = checked && selected && j !== q.a;
                  return (
                    <button key={j} disabled={checked} onClick={() => setAnswers({ ...answers, [i]: j })} className={`text-left text-sm px-3 py-2.5 rounded-xl border transition ${isRight ? "border-emerald-500 bg-emerald-500/15 text-emerald-100" : isWrong ? "border-red-500 bg-red-500/15 text-red-100" : selected ? "border-cyan-500 bg-cyan-500/10 text-white" : "border-slate-800 text-slate-300 hover:border-slate-700"}`}>
                      {op}
                    </button>
                  );
                })}
              </div>
              {checked && answers[i] !== q.a && <p className="text-xs text-amber-300 mt-2 flex gap-1.5"><Lightbulb size={13} className="shrink-0 mt-0.5" /> {q.why}</p>}
              {checked && answers[i] === q.a && q.why && <p className="text-xs text-emerald-300/90 mt-2 flex gap-1.5"><CheckCircle2 size={13} className="shrink-0 mt-0.5" /> {q.why}</p>}
            </div>
          ))}
        </div>

        {!checked ? (
          <button disabled={!allAnswered} onClick={() => { setChecked(true); setAttempts((a) => a + 1); }} className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold disabled:opacity-40">Comprobar respuestas</button>
        ) : (
          <div className="mt-5">
            <div className="text-center">
              <div className={`text-5xl font-black tabular-nums score-pop ${pass ? "text-emerald-400" : "text-red-400"}`}>{score}<span className="text-xl text-slate-600">/100</span></div>
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden relative mt-3">
                <div className={`h-full rounded-full transition-all duration-1000 ${pass ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-red-600 to-red-400"}`} style={{ width: `${score}%` }} />
                <div className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{ left: `${PASS_SCORE}%` }} />
              </div>
            </div>
            {pass ? (
              <button onClick={() => onComplete(score, attempts)} className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black flex items-center justify-center gap-2 unlock glow-green"><Award size={18} /> ¡Aprobado! Completar proyecto</button>
            ) : (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 shake">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm"><AlertTriangle size={16} /> Copiloto EDIA: aún no llegas al {PASS_SCORE}%</div>
                <p className="text-xs text-amber-100/80 mt-2">Lee las pistas en amarillo, repasa la sección "Entiende tu código" y vuelve a intentarlo.</p>
                <button onClick={() => { setChecked(false); setAnswers({}); }} className="mt-3 w-full py-2.5 rounded-xl bg-amber-500/90 text-slate-950 text-sm font-bold flex items-center justify-center gap-2"><RotateCcw size={14} /> Intentar de nuevo</button>
                <button onClick={() => onComplete(score, attempts)} className="mt-2 w-full text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2">Omitir el reto</button>
              </div>
            )}
          </div>
        )}
      </Glass>
    </div>
  );
}

const PHASE_TIPS = {
  materiales: {
    title: "Reconoce tus materiales",
    tips: [
      "LED: la pata larga es el ánodo (+) y la corta el cátodo (−). El borde plano del LED marca el cátodo.",
      "Resistencia 220 Ω: bandas rojo-rojo-marrón. 10 kΩ: marrón-negro-naranja.",
      "El Arduino UNO tiene pines digitales (D0-D13), analógicos (A0-A5) y de alimentación (5V, 3.3V, GND, VIN).",
      "Los pines con el símbolo ~ (3, 5, 6, 9, 10, 11) pueden regular intensidad (PWM).",
    ],
  },
  conexiones: {
    title: "Conecta sin errores",
    tips: [
      "Sigue el paso resaltado en azul: es el siguiente que te toca.",
      "Usa rojo para 5V y negro para GND: así detectas errores de un vistazo.",
      "En la protoboard, las filas de 5 agujeros están unidas; el canal central las separa.",
      "Al terminar, revisa cada cable comparándolo con la tabla de pines.",
    ],
  },
  codigo: {
    title: "Sube el código",
    tips: [
      "Usa el botón Copiar código: evita errores al transcribirlo.",
      "Si el IDE marca un error, lee la línea indicada: suele ser una librería sin instalar.",
      "setup() se ejecuta una vez; loop() se repite sin parar.",
      "Abre el Monitor Serie a 9600 baudios para ver qué está haciendo tu Arduino.",
    ],
  },
  prueba: {
    title: "Prueba como un ingeniero",
    tips: [
      "Cambia una sola cosa cada vez y vuelve a probar.",
      "El Monitor Serie es tu mejor herramienta para encontrar fallos.",
      "Si algo se calienta, desconecta y revisa las conexiones.",
      "Al aprobar el reto, prueba uno de los retos de ampliación.",
    ],
  },
};

function AgentPanel({ agent, api, quick }) {
  const { messages, busy, send, stop } = agent;
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);
  const submit = (t) => { const v = (t ?? input).trim(); if (!v || busy) return; send(v); if (t === undefined) setInput(""); };
  const engineLabel = api.status === "online" ? (api.engine === "sample" ? `Agente IA conectado${api.tools ? " · puede actuar en la app" : ""}` : "Agente IA conectado · puede actuar en la app") : api.status === "checking" ? "Conectando al agente..." : "Agente en modo local";
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-3 pb-2 text-[11px] text-slate-500 border-b border-slate-800/60 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${api.status === "online" ? "bg-emerald-400" : api.status === "checking" ? "bg-cyan-400" : "bg-amber-400"}`} />
        {engineLabel}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[280px]">
        {messages.map((m, i) => {
          const mine = m.role === "user";
          return (
            <div key={i} className={`flex gap-2 msg-in ${mine ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${mine ? "bg-slate-700" : "bg-gradient-to-br from-indigo-500 to-cyan-500"}`}>{mine ? <User size={14} className="text-slate-200" /> : <Bot size={14} className="text-white" />}</div>
              <div className="max-w-[88%] min-w-0 flex flex-col gap-1.5">
                {!mine && m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.actions.map((a, j) => <span key={j} className="text-[10.5px] px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 flex items-center gap-1"><Zap size={10} /> {a}</span>)}
                  </div>
                )}
                <div className={`rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${mine ? "bg-cyan-500/15 border border-cyan-500/30 text-slate-100 rounded-tr-sm" : "bg-slate-800/70 border border-slate-700/60 text-slate-200 rounded-tl-sm"}`}>
                  {m.text || (m.pending ? <span className="flex items-center gap-2 text-slate-400"><Loader2 size={13} className="animate-spin text-cyan-300" /> El agente está pensando...</span> : "")}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {quick.map((q) => (
            <button key={q} disabled={busy} onClick={() => submit(q)} className="text-[11px] px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-cyan-200 hover:bg-cyan-500/15 disabled:opacity-40 transition">{q}</button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <label htmlFor="agent-input" className="sr-only">Escribe al Agente EDIA</label>
          <textarea id="agent-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }} rows={2} placeholder="Escribe al Agente EDIA... (Enter para enviar)" className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-[13px] text-white placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/60" />
          {busy ? (
            <button onClick={stop} title="Detener" className="p-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white"><X size={16} /></button>
          ) : (
            <button onClick={() => submit()} disabled={!input.trim()} className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white disabled:opacity-30"><Send size={16} /></button>
          )}
        </div>
      </div>
    </div>
  );
}

function Workshop({ project, api, agent, bridgeRef, onBack, onFinish }) {
  const [phase, setPhase] = useState(0);
  const [maxPhase, setMaxPhase] = useState(0);
  const [have, setHave] = useState({});
  const [done, setDone] = useState({});
  const [tests, setTests] = useState({});
  const [hover, setHover] = useState(null);
  const [agentHi, setAgentHi] = useState(null);
  const [tab, setTab] = useState("guide");
  const [startedAt] = useState(Date.now());
  const contentRef = useRef(null);
  const steps = useMemo(() => assemblySteps(project), [project]);

  const go = (i) => {
    setPhase(i);
    setMaxPhase((m) => Math.max(m, i));
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Puente para que el Agente EDIA lea y cambie el taller */
  bridgeRef.current = {
    projectId: project.id,
    getState: () => ({
      fase: PHASES[phase].label,
      pasos_montaje: steps.map((it, k) => ({
        numero: k + 1,
        ...(it.type === "conn" ? { cable: it.i + 1 } : {}),
        texto: it.type === "prep" ? it.text : connectionText(it.cn),
        hecho: !!done[k],
      })),
      pruebas: `${project.tests.filter((_, i) => tests[i]).length} de ${project.tests.length} hechas`,
    }),
    go: (i) => go(i),
    setStep: (k, val) => setDone((d) => ({ ...d, [k]: val })),
    highlight: (i) => { setAgentHi(i); if (phase !== 1) go(1); else contentRef.current?.scrollTo({ top: 0, behavior: "smooth" }); },
    openAgent: () => setTab("agent"),
  };

  const tips = PHASE_TIPS[PHASES[phase].id];
  const Icon = ICONS[project.icon] || Cpu;
  const quick = ["Guíame en el siguiente paso", "Explícame el código", "No funciona, ayúdame"];

  return (
    <div className="flex flex-col h-screen fade-in">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl z-20">
        <div className="px-3 sm:px-5 h-16 flex items-center gap-2 sm:gap-4">
          <button onClick={onBack} title="Volver a los proyectos" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><ArrowLeft size={18} /></button>
          <div className="hidden md:block"><Logo /></div>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icon size={18} className="text-cyan-300 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{project.title}</div>
              <div className="text-[11px] text-slate-500">Fase {phase + 1} de 4 · {PHASES[phase].label}</div>
            </div>
          </div>
          <button onClick={() => setTab("agent")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 text-indigo-200 text-xs sm:text-sm font-semibold whitespace-nowrap"><Bot size={15} /> <span className="hidden sm:inline">Agente IA</span></button>
          <button onClick={() => onFinish(null, 0, Date.now() - startedAt)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-white font-medium whitespace-nowrap"><ListChecks size={15} /> <span className="hidden sm:inline">Guía completa</span></button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        <section className="lg:w-3/5 flex flex-col min-h-[80vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800/80">
          <div className="flex gap-1 p-2 border-b border-slate-800/60 overflow-x-auto">
            {PHASES.map((p, i) => {
              const PI = p.icon;
              const reachable = i <= maxPhase;
              return (
                <button key={p.id} disabled={!reachable} onClick={() => go(i)} className={`flex-1 min-w-[96px] flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition ${phase === i ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-500/30" : reachable ? "text-slate-400 hover:text-slate-200 border border-transparent" : "text-slate-700 border border-transparent cursor-not-allowed"}`}>
                  {i < maxPhase ? <CheckCircle2 size={15} className="text-emerald-400" /> : reachable ? <PI size={15} /> : <Lock size={13} />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
          <div ref={contentRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
            {phase === 0 && <PhaseMaterials project={project} have={have} setHave={setHave} onNext={() => go(1)} />}
            {phase === 1 && <PhaseConnections project={project} done={done} setDone={setDone} onNext={() => go(2)} highlight={hover ?? agentHi} setHighlight={setHover} />}
            {phase === 2 && <PhaseCode project={project} onNext={() => go(3)} />}
            {phase === 3 && <PhaseTest project={project} tests={tests} setTests={setTests} onComplete={(score, attempts) => onFinish(score, attempts, Date.now() - startedAt)} />}
          </div>
        </section>

        <aside className="lg:w-2/5 flex flex-col min-h-[70vh] lg:min-h-0 bg-slate-900/30">
          <div className="flex p-2 gap-1 border-b border-slate-800/60">
            {[["guide", "Guía del paso", BookOpen], ["agent", "Agente IA", Bot]].map(([k, l, TI]) => (
              <button key={k} onClick={() => setTab(k)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${tab === k ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-500/30" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}>
                <TI size={15} /> {l}
                {k === "agent" && agent.busy && <Loader2 size={12} className="animate-spin text-cyan-300" />}
              </button>
            ))}
          </div>
          {tab === "agent" ? (
            <AgentPanel agent={agent} api={api} quick={quick} />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">Fase {phase + 1}: {PHASES[phase].label}</div>
                <div className="text-white font-semibold">{tips.title}</div>
              </div>
              <ul className="space-y-2.5">
                {tips.tips.map((t, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2"><ShieldAlert size={16} /> Seguridad</div>
                <ul className="space-y-1.5">{GENERAL_SAFETY.map((s, i) => <li key={i} className="text-xs text-amber-100/80 flex gap-2"><span className="text-amber-400">•</span>{s}</li>)}</ul>
              </div>
              {project.ai && (
                <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 text-xs text-indigo-200 flex gap-2"><Sparkles size={14} className="shrink-0 mt-0.5" /> Proyecto diseñado por la IA: revisa las conexiones con calma antes de energizar el circuito.</div>
              )}
              <button onClick={() => setTab("agent")} className="w-full py-3 rounded-xl border border-indigo-500/40 bg-indigo-500/10 text-indigo-200 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-500/15"><Bot size={16} /> Que el Agente IA me guíe paso a paso</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* =========================================================================
   PANTALLA 4: RESUMEN / GUÍA COMPLETA
   ========================================================================= */

function Summary({ project, result, onCatalog, onHome, onReopen }) {
  const md = useMemo(() => buildMarkdown(project, result.score), [project, result.score]);
  const [copied, setCopied] = useState("");
  const passed = result.score !== null && result.score >= PASS_SCORE;
  const doCopy = async (what, text) => { if (await copyText(text)) { setCopied(what); setTimeout(() => setCopied(""), 2000); } };
  const fileBase = normalize(project.title).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 fade-in">
      <Glass className={`p-6 sm:p-8 text-center ${passed ? "border-emerald-500/40" : ""}`}>
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${passed ? "bg-emerald-500/15 border border-emerald-500/40" : "bg-cyan-500/10 border border-cyan-500/30"}`}>
          {passed ? <Trophy size={30} className="text-emerald-400" /> : <ListChecks size={30} className="text-cyan-400" />}
        </div>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 mb-1">{passed ? "Proyecto completado" : "Guía completa del proyecto"}</div>
        <h2 className="text-3xl font-black text-white">{project.title}</h2>
        <div className="flex flex-wrap justify-center gap-3 mt-5">
          <div className="px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800"><div className={`text-2xl font-black tabular-nums ${result.score === null ? "text-slate-500" : passed ? "text-emerald-400" : "text-red-400"}`}>{result.score === null ? "—" : `${result.score}%`}</div><div className="text-[11px] text-slate-500">reto final</div></div>
          <div className="px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800"><div className="text-2xl font-black text-white tabular-nums">{result.attempts || 0}</div><div className="text-[11px] text-slate-500">intentos</div></div>
          <div className="px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800"><div className="text-2xl font-black text-white">{fmtTime(result.elapsed / 1000)}</div><div className="text-[11px] text-slate-500">tiempo</div></div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button onClick={() => doCopy("code", project.code)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-semibold">{copied === "code" ? <><Check size={16} /> Código copiado</> : <><Code2 size={16} /> Copiar código</>}</button>
          <button onClick={() => doCopy("md", md)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-200 text-sm hover:bg-slate-800">{copied === "md" ? <><Check size={16} className="text-emerald-400" /> Guía copiada</> : <><Copy size={16} /> Copiar guía completa</>}</button>
          <button onClick={() => downloadFile(`${fileBase}.md`, md, "text/markdown")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-200 text-sm hover:bg-slate-800"><Download size={16} /> Descargar .md</button>
        </div>
      </Glass>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Glass className="p-5">
          <div className="flex items-center gap-2 text-white font-bold mb-3"><Package size={17} className="text-cyan-400" /> Materiales</div>
          <ul className="space-y-1.5">{project.components.map((m, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-cyan-300 font-bold tabular-nums w-8 shrink-0">{m.qty}×</span>{m.name}</li>)}</ul>
        </Glass>
        <Glass className="p-5">
          <div className="flex items-center gap-2 text-white font-bold mb-3"><Rocket size={17} className="text-indigo-400" /> Retos para seguir aprendiendo</div>
          <ul className="space-y-2">{project.challenges.map((ch, i) => <li key={i} className="text-sm text-slate-300 flex gap-2"><span className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>{ch}</li>)}</ul>
        </Glass>
      </div>

      <Glass className="p-5 mt-5">
        <div className="flex items-center gap-2 text-white font-bold mb-3"><Cable size={17} className="text-cyan-400" /> Conexiones</div>
        <WiringDiagram project={project} highlightIdx={null} />
      </Glass>

      <div className="mt-5"><CodeBlock code={project.code} fileName={`${fileBase}.ino`} /></div>

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {!passed && <button onClick={onReopen} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10"><RotateCcw size={16} /> Volver al taller</button>}
        <button onClick={onCatalog} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold"><Layers size={16} /> Otro proyecto</button>
        <button onClick={onHome} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800">Inicio</button>
      </div>
    </main>
  );
}

/* =========================================================================
   APP
   ========================================================================= */

const STYLES = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes msgIn { from { opacity: 0; transform: translateY(10px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes pop { 0% { transform: scale(.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes shake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-5px) } 40%,80% { transform: translateX(5px) } }
@keyframes unlock { 0% { transform: scale(.92); opacity: 0 } 60% { transform: scale(1.02); opacity: 1 } 100% { transform: scale(1) } }
@keyframes glow { 0%,100% { box-shadow: 0 0 24px rgba(6,182,212,.35) } 50% { box-shadow: 0 0 44px rgba(99,102,241,.55) } }
@keyframes glowGreen { 0%,100% { box-shadow: 0 0 0 rgba(52,211,153,0) } 50% { box-shadow: 0 0 24px rgba(52,211,153,.5) } }
@keyframes wirePulse { 0%,100% { opacity: 1 } 50% { opacity: .55 } }
.fade-in { animation: fadeIn .45s ease-out both }
.msg-in { animation: msgIn .35s ease-out both }
.score-pop { animation: pop .6s cubic-bezier(.2,.8,.2,1) both }
.shake { animation: shake .5s ease-in-out }
.unlock { animation: unlock .7s ease-out both }
.glow { animation: glow 3s ease-in-out infinite }
.glow-green { animation: glowGreen 1.8s ease-in-out infinite }
.wire-pulse { animation: wirePulse 1s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important } }
::-webkit-scrollbar { width: 8px; height: 8px } ::-webkit-scrollbar-thumb { background: rgb(51 65 85); border-radius: 8px } ::-webkit-scrollbar-track { background: transparent }
`;

const AGENT_GREETING = "¡Hola! Soy el Agente EDIA, tu tutor de robótica. Puedo recomendarte un proyecto, abrirlo, guiarte cable por cable resaltando cada conexión en el diagrama, explicarte el código y ayudarte si algo no funciona. ¿Qué quieres construir hoy?";

export default function EDIARoboticaCopilot() {
  const [screen, setScreen] = useState("landing");
  const [api, setApi] = useState({ key: "", model: "", engine: "fetch", tools: 0, status: "checking", error: "" });
  const [showApi, setShowApi] = useState(false);
  const [project, setProject] = useState(null);
  const [result, setResult] = useState({ score: null, attempts: 0, elapsed: 0 });
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");
  const [workshopKey, setWorkshopKey] = useState(0);
  const [agentMsgs, setAgentMsgs] = useState([{ role: "assistant", text: AGENT_GREETING }]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const bridgeRef = useRef(null);
  const abortRef = useRef(null);
  const actionSinkRef = useRef(null);
  const live = useRef({});
  live.current = { screen, project, api, agentMsgs };

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 6500); return () => clearTimeout(t); }, [toast]);

  const connect = useCallback(async (conf) => {
    if (!conf.key && SAMPLE) {
      const lim = await SAMPLE.limits().catch(() => null);
      setApi({ key: "", model: conf.model || "", engine: "sample", tools: lim && lim.tools ? lim.tools.maxCount || 8 : 0, status: "online", error: "" });
      return;
    }
    setApi({ key: conf.key, model: conf.model, engine: "fetch", tools: 8, status: "checking", error: "" });
    try {
      const ok = await pingAI(conf);
      setApi({ key: conf.key, model: conf.model, engine: "fetch", tools: 8, status: ok ? "online" : "offline", error: ok ? "" : "Respuesta inesperada" });
    } catch (err) {
      setApi({ key: conf.key, model: conf.model, engine: "fetch", tools: 8, status: "offline", error: errorText(err) || "Sin conexión" });
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const caps = await initCapabilities();
      if (!alive) return;
      if (caps.sample) setApi({ key: "", model: "", engine: "sample", tools: caps.tools, status: "online", error: "" });
      else connect({ key: "", model: "" });
    })();
    return () => { alive = false; };
  }, [connect]);

  const apiFailed = useCallback((err) => {
    const code = err && err.code;
    if (code === "rate_limited") { setToast("Hiciste muchas consultas seguidas a la IA. Espera un momento y vuelve a intentarlo."); return; }
    if (code === "cancelled") return;
    const msg = code === "not_granted" ? "no se dio permiso para usar Claude en esta página" : errorText(err);
    setApi((a) => ({ ...a, status: "offline", error: msg }));
    setToast(`La IA no está disponible (${msg.slice(0, 80)}). EDIA activó el Modo Respaldo Local.`);
  }, []);

  const openProject = useCallback((p) => {
    bridgeRef.current = null;
    setProject(p);
    setWorkshopKey((k) => k + 1);
    setScreen("workshop");
    setAgentOpen(false);
  }, []);

  const createProject = useCallback(async (req) => {
    setCreating(true);
    let p;
    try {
      if (live.current.api.status === "offline") throw { code: "local" };
      p = await generateProjectAI(live.current.api, req);
    } catch (err) {
      if (!err || err.code !== "local") apiFailed(err);
      p = findClosestProject(req.idea, req.parts || "");
      setToast(`Sin IA disponible: te propongo el proyecto más parecido de la biblioteca, "${p.title}".`);
    }
    openProject(p);
    setCreating(false);
    return p;
  }, [apiFailed, openProject]);

  /* Herramientas que el Agente EDIA puede usar dentro de la app */
  const logAction = (label) => { if (actionSinkRef.current) actionSinkRef.current(label); };
  const needWorkshop = () => {
    const w = bridgeRef.current;
    if (live.current.screen !== "workshop" || !w) throw new Error("No hay ningún proyecto abierto. Usa abrir_proyecto primero.");
    return w;
  };
  const impl = {
    ver_estado: () => {
      const { screen: sc, project: pr } = live.current;
      const base = { pantalla: { landing: "inicio", catalog: "catálogo de proyectos", workshop: "taller del proyecto", summary: "resumen final" }[sc] || sc, proyecto: pr ? { id: pr.id, titulo: pr.title, nivel: pr.level } : null };
      if (sc === "workshop" && bridgeRef.current) return { ...base, ...bridgeRef.current.getState() };
      return base;
    },
    ver_detalle_proyecto: () => {
      const pr = live.current.project;
      if (!pr) throw new Error("No hay ningún proyecto abierto.");
      return {
        titulo: pr.title,
        materiales: pr.components.map((m) => `${m.qty}x ${m.name}${m.note ? ` (${m.note})` : ""}`),
        conexiones: pr.connections.map((cn, i) => ({ numero: i + 1, componente: cn.from[0], pin: cn.from[1], va_a: cn.to[0] === "Arduino" ? `Arduino ${cn.to[1]}` : `${cn.to[0]} ${cn.to[1]}`, cable: cn.color, resistencia: cn.via || undefined, nota: cn.note || undefined })),
        librerias: pr.libraries,
        codigo: pr.code.slice(0, 6000),
      };
    },
    resaltar_cable: ({ numero }) => {
      const w = needWorkshop();
      const n = Number(numero);
      const pr = live.current.project;
      if (!(n >= 1 && n <= pr.connections.length)) throw new Error(`El proyecto tiene ${pr.connections.length} cables.`);
      w.highlight(n - 1);
      logAction(`Resaltó el cable ${n}`);
      return { ok: true, cable: connectionText(pr.connections[n - 1]) };
    },
    marcar_paso: ({ numero, hecho }) => {
      const w = needWorkshop();
      const n = Number(numero);
      const total = assemblySteps(live.current.project).length;
      if (!(n >= 1 && n <= total)) throw new Error(`El montaje tiene ${total} pasos.`);
      const val = hecho === undefined ? true : Boolean(hecho);
      w.setStep(n - 1, val);
      logAction(`${val ? "Marcó" : "Desmarcó"} el paso ${n}`);
      return { ok: true };
    },
    ir_a_fase: ({ fase }) => {
      const w = needWorkshop();
      const idx = PHASES.findIndex((ph) => ph.id === normalize(String(fase)));
      if (idx === -1) throw new Error("Fase no válida: usa materiales, conexiones, codigo o prueba.");
      w.go(idx);
      logAction(`Fue a la fase ${PHASES[idx].label}`);
      return { ok: true, fase: PHASES[idx].label };
    },
    abrir_proyecto: ({ id }) => {
      const p = PROJECTS.find((x) => x.id === normalize(String(id)));
      if (!p) throw new Error("Id no encontrado. Usa listar_proyectos.");
      openProject(p);
      logAction(`Abrió "${p.title}"`);
      return { ok: true, titulo: p.title, nivel: p.level, materiales: p.components.length, cables: p.connections.length };
    },
    listar_proyectos: () => PROJECTS.map((p) => ({ id: p.id, titulo: p.title, nivel: p.level, duracion: p.duration, resumen: p.summary })),
    crear_proyecto: async ({ idea, componentes, nivel }) => {
      logAction("Diseñando un proyecto nuevo...");
      const p = await createProject({ idea: String(idea || ""), parts: String(componentes || ""), level: LEVELS.includes(nivel) ? nivel : "Principiante" });
      logAction(`Abrió "${p.title}"`);
      return { ok: true, titulo: p.title, generado_por_ia: !!p.ai, cables: p.connections.length };
    },
  };
  const implRef = useRef(impl);
  implRef.current = impl;

  const agentContext = () => {
    const st = implRef.current.ver_estado();
    const lines = [`Pantalla: ${st.pantalla}.`];
    if (st.proyecto) lines.push(`Proyecto abierto: ${st.proyecto.titulo} (id ${st.proyecto.id}, ${st.proyecto.nivel}).`);
    if (st.fase) lines.push(`Fase del taller: ${st.fase}.`);
    if (st.pasos_montaje) {
      const next = st.pasos_montaje.find((x) => !x.hecho);
      lines.push(`Montaje: ${st.pasos_montaje.filter((x) => x.hecho).length} de ${st.pasos_montaje.length} pasos hechos.${next ? ` Siguiente paso pendiente: ${next.numero}${next.cable ? ` (cable ${next.cable})` : ""}: ${next.texto}` : ""}`);
    }
    if (!st.proyecto) lines.push(`Proyectos de la biblioteca: ${PROJECTS.map((p) => `${p.id} (${p.title}, ${p.level})`).join("; ")}.`);
    return lines.join("\n");
  };

  const sendToAgent = useCallback(async (text) => {
    if (agentBusy) return;
    const history = [...live.current.agentMsgs, { role: "user", text }];
    setAgentMsgs([...history, { role: "assistant", text: "", actions: [], pending: true }]);
    setAgentBusy(true);
    const ctl = new AbortController();
    abortRef.current = ctl;
    const patchLast = (fn) => setAgentMsgs((ms) => {
      const copy = ms.slice();
      copy[copy.length - 1] = { ...copy[copy.length - 1], ...fn(copy[copy.length - 1]) };
      return copy;
    });
    actionSinkRef.current = (label) => patchLast((m) => ({ actions: [...(m.actions || []), label] }));
    try {
      const a = live.current.api;
      if (a.status !== "online") throw { code: "local" };
      const reply = await runAgentAI({ api: a, history, context: agentContext(), impl: implRef.current, onText: (t) => patchLast(() => ({ text: t })), signal: ctl.signal });
      patchLast(() => ({ text: reply, pending: false }));
    } catch (err) {
      if (ctl.signal.aborted || (err && err.code === "cancelled")) {
        patchLast((m) => ({ text: m.text ? `${m.text}\n\n(Detenido)` : "Detenido.", pending: false }));
      } else {
        if (!err || err.code !== "local") apiFailed(err);
        const reply = await localAgent(text, implRef.current, { screen: live.current.screen, project: live.current.project });
        patchLast(() => ({ text: reply, pending: false }));
      }
    } finally {
      actionSinkRef.current = null;
      abortRef.current = null;
      setAgentBusy(false);
    }
  }, [agentBusy, apiFailed]);

  const agent = { messages: agentMsgs, busy: agentBusy, send: sendToAgent, stop: () => abortRef.current && abortRef.current.abort() };
  const outsideQuick = ["Recomiéndame un proyecto para empezar", "Quiero hacer un robot", "¿Qué necesito para empezar con Arduino?"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden">
      <style>{STYLES}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgb(148 163 184) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative">
        {screen !== "workshop" && <TopBar api={api} onOpenApi={() => setShowApi(true)} onHome={() => setScreen("landing")} />}
        {screen === "landing" && <Landing onStart={() => setScreen("catalog")} />}
        {screen === "catalog" && <Catalog onBack={() => setScreen("landing")} onOpen={openProject} onCreate={createProject} creating={creating} />}
        {screen === "workshop" && project && (
          <Workshop key={workshopKey} project={project} api={api} agent={agent} bridgeRef={bridgeRef} onBack={() => setScreen("catalog")} onFinish={(score, attempts, elapsed) => { setResult({ score, attempts, elapsed }); setScreen("summary"); }} />
        )}
        {screen === "summary" && project && (
          <Summary project={project} result={result} onCatalog={() => setScreen("catalog")} onHome={() => setScreen("landing")} onReopen={() => openProject(project)} />
        )}
      </div>

      {screen !== "workshop" && !agentOpen && (
        <button onClick={() => setAgentOpen(true)} className="fixed z-40 flex items-center gap-2 pl-3 pr-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold shadow-2xl shadow-indigo-500/30 glow" style={{ right: "calc(20px + env(safe-area-inset-right, 0px))", bottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}>
          <Bot size={20} /> Agente EDIA
        </button>
      )}
      {screen !== "workshop" && agentOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] flex flex-col bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl fade-in" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold"><Bot size={18} className="text-indigo-300" /> Agente EDIA</div>
            <button onClick={() => setAgentOpen(false)} title="Cerrar" className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
          </div>
          <AgentPanel agent={agent} api={api} quick={outsideQuick} />
        </div>
      )}

      {showApi && <ApiModal api={api} onSave={connect} onClose={() => setShowApi(false)} />}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] px-4 py-3 rounded-xl border border-amber-500/40 bg-slate-900/95 text-amber-200 text-sm shadow-2xl flex gap-2 fade-in">
          <AlertTriangle size={18} className="shrink-0 text-amber-400" /> {toast}
        </div>
      )}
    </div>
  );
}
