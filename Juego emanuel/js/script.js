const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const progressBar = document.getElementById("progressBar");

let progreso = 0;
const meta = 100;
const tiempoJuego = 40000; // Duración del juego en milisegundos
let inicioTiempo;

// Cargar imágenes
const backgroundImg = new Image();
backgroundImg.src = "/images/bck.png";

const personajeImg = new Image();
personajeImg.src = "/images/ema.png";

const enemigoMoto = new Image();
enemigoMoto.src = "/images/moto.png";
const enemigoBalon = new Image();
enemigoBalon.src = "/images/balon.png";
const enemigoPerro = new Image();
enemigoPerro.src = "/images/perro.png";
const enemigoCarroC = new Image();
enemigoCarroC.src = "/images/CarroClasico.png";
const enemigoNinja = new Image();
enemigoNinja.src = "/images/ninja.png";
const enemigoChopper = new Image();
enemigoChopper.src = "/images/chopper.png";
const enemigoSport = new Image();
enemigoSport.src = "/images/sport.png";

const anaKImg = new Image();
anaKImg.src = "/images/anak.png";

// Configuración del personaje
const personaje = {
    x: 100,
    y: 298,
    width: 74,
    height: 100,
    velocidadY: 0,
    enElAire: false,
    velocidadX: 0
};

const alturaSuelo = 400;

const anaK = {
    x: 700,
    y: alturaSuelo - 73,
    width: 80,
    height: 65,
    visible: false
};

const gravedad = 0.5;
const fuerzaSalto = -14.5;
let juegoIniciado = false;
let juegoFinalizado = false;
let obstaculos = [];

function dibujarFondo() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function detectarColision() {
    for (let obstaculo of obstaculos) {
        const margen = 20;
        if (
            personaje.x + margen < obstaculo.x + obstaculo.width &&
            personaje.x + personaje.width - margen > obstaculo.x &&
            personaje.y + margen < obstaculo.y + obstaculo.height &&
            personaje.y + personaje.height - margen > obstaculo.y
        ) {
            juegoIniciado = false;
            juegoFinalizado = true;
            setTimeout(() => {
                alert("¡Game Over! Ema no logró llegar con Ana K 😭");
                reiniciarJuego();
            }, 100);
            return;
        }
    }
}

function reiniciarJuego() {
    progreso = 0;
    personaje.x = 100;
    personaje.y = 300;
    personaje.velocidadY = 0;
    personaje.velocidadX = 0;
    obstaculos = [];
    anaK.visible = false;
    progressBar.style.width = "0%";
    juegoIniciado = false;
    juegoFinalizado = false;
    startButton.style.display = "block";
    canvas.style.display = "none";
}

function dibujarPersonaje() {
    ctx.drawImage(personajeImg, personaje.x, personaje.y, personaje.width, personaje.height);
}

function dibujarAnaK() {
    if (anaK.visible) {
        ctx.drawImage(anaKImg, anaK.x, anaK.y, anaK.width, anaK.height);
    }
}

function dibujarObstaculos() {
    obstaculos.forEach((obstaculo) => {
        ctx.drawImage(obstaculo.img, obstaculo.x, obstaculo.y, obstaculo.width, obstaculo.height);
    });
}

function actualizarJuego() {
    if (!juegoIniciado || juegoFinalizado) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarFondo();
    personaje.velocidadY += gravedad;
    personaje.y += personaje.velocidadY;

    if (personaje.y >= 300) {
        personaje.y = 300;
        personaje.velocidadY = 0;
        personaje.enElAire = false;
    }

    obstaculos.forEach((obstaculo) => {
        obstaculo.x -= 5;
    });

    obstaculos = obstaculos.filter((obstaculo) => obstaculo.x + obstaculo.width > 0);

    detectarColision();

    // Sincronizar progress bar con el tiempo de juego
    const tiempoTranscurrido = Date.now() - inicioTiempo;
    progreso = (tiempoTranscurrido / tiempoJuego) * meta;
    progressBar.style.width = `${Math.min(progreso, meta)}%`;

    if (progreso >= 95) {
        anaK.visible = true;
        personaje.velocidadX = 2.5;
    }

    if (personaje.velocidadX > 0 && personaje.x < anaK.x - 40) {
        personaje.x += personaje.velocidadX;
    } else if (personaje.x >= anaK.x - 40) {
        personaje.velocidadX = 0;
        juegoFinalizado = true;
        setTimeout(() => {
            alert("¡Felicidades! Ema llegó con Ana K ❤️🎉");
            reiniciarJuego();
        }, 1500);
    }

    dibujarObstaculos();
    dibujarPersonaje();
    dibujarAnaK();

    requestAnimationFrame(actualizarJuego);
}

function saltar(event) {
    if ((event.code === "Space" || event.code === "ArrowUp" || event.type === "touchstart") && !personaje.enElAire) {
        personaje.velocidadY = fuerzaSalto;
        personaje.enElAire = true;
    }
}

function generarObstaculo() {
    const tiposObstaculo = [
        { img: enemigoMoto, width: 135, height: 90, yOffset: 9 },
        { img: enemigoBalon, width: 30, height: 30, yOffset: -7 },
        { img: enemigoPerro, width: 90, height: 77, yOffset: 5.3 },
        { img: enemigoCarroC, width: 150, height: 90, yOffset: 5 },
        { img: enemigoNinja, width: 93, height: 61, yOffset: -7 },
        { img: enemigoChopper, width: 150, height: 90, yOffset: 5 },
        { img: enemigoSport, width: 150, height: 90, yOffset: 5 }

    ];

    const obstaculoSeleccionado = tiposObstaculo[Math.floor(Math.random() * tiposObstaculo.length)];

    const obstaculo = {
        ...obstaculoSeleccionado,
        x: canvas.width,
        y: alturaSuelo - obstaculoSeleccionado.height + obstaculoSeleccionado.yOffset
    };

    obstaculos.push(obstaculo);
}

setInterval(() => {
    if (juegoIniciado && progreso < 91) {
        generarObstaculo();
    }
}, 2000);

startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    canvas.style.display = "block";
    juegoIniciado = true;
    inicioTiempo = Date.now();
    actualizarJuego();
});

document.addEventListener("keydown", saltar);
document.addEventListener("touchstart", saltar);
