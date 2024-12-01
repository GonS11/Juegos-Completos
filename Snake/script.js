// Definición de estados del juego
const STATE_INIT = 0; // Estado de inicio del juego
const STATE_RUNNING = 1; // Estado en el que el juego está en ejecución
const STATE_LOSING = 2; // Estado en el que la serpiente ha colisionado y está perdiendo

const TICK = 80; // Intervalo de tiempo en milisegundos entre cada actualización del juego
const SQUARE_SIZE = 10; // Tamaño de cada "cuadro" en el tablero de juego
const BOARD_WIDTH = 50; // Ancho del tablero en cuadros
const BOARD_HEIGHT = 50; // Alto del tablero en cuadros
const GROW_SCALE = 1; // Cantidad de cuadros que crece la serpiente al comer

// Mapeo de teclas a direcciones
const DIRECTIONS_MAP = {
    'A': [-1, 0], 'a': [-1, 0], 'ArrowLeft': [-1, 0], // Izquierda
    'D': [1, 0], 'd': [1, 0], 'ArrowRight': [1, 0], // Derecha
    'W': [0, -1], 'w': [0, -1], 'ArrowUp': [0, -1], // Arriba
    'S': [0, 1], 's': [0, 1], 'ArrowDown': [0, 1] // Abajo
};

// Estado inicial del juego
let state = {
    canvas: null, // Elemento canvas
    context: null, // Contexto 2D del canvas
    snake: [{ x: 0, y: 0 }], // Posiciones de la serpiente, iniciando con un solo segmento
    direction: { x: 1, y: 0 }, // Dirección inicial de movimiento de la serpiente
    prey: { x: 0, y: 0 }, // Posición inicial de la presa
    growing: 0, // Segmentos que la serpiente debe crecer
    runState: STATE_INIT, // Estado inicial del juego
    snakeColor: '#228B22', // Color inicial de la serpiente (verde oscuro)
    score: 0, // Puntaje inicial
    tickInterval: 80 // Intervalo de tiempo inicial
};

// Función para generar una posición aleatoria en el tablero
function randomXY() {
    return {
        x: parseInt(Math.random() * BOARD_WIDTH), // Coordenada X aleatoria
        y: parseInt(Math.random() * BOARD_HEIGHT) // Coordenada Y aleatoria
    };
};

// Función que se llama en cada actualización del juego
function tick() {
    const head = state.snake[0]; // Cabeza de la serpiente
    const dx = state.direction.x; // Desplazamiento en X
    const dy = state.direction.y; // Desplazamiento en Y
    const highestIndex = state.snake.length - 1; // Último segmento de la serpiente
    let tail = {}; // Para almacenar la posición del último segmento
    let interval = state.tickInterval; // Intervalo de tiempo para la próxima actualización

    // Clona la posición del último segmento de la serpiente
    Object.assign(tail, state.snake[state.snake.length - 1]);

    // Verifica si la serpiente ha comido la presa
    let didScore = (head.x === state.prey.x && head.y === state.prey.y);

    if (state.runState === STATE_RUNNING) {
        // Mueve la serpiente
        for (let idx = highestIndex; idx >= 0; idx--) {
            const sq = state.snake[idx];

            if (idx === 0) {
                // Mueve la cabeza en la dirección actual
                sq.x += dx;
                sq.y += dy;
            } else {
                // Mueve cada segmento a la posición del segmento anterior
                sq.x = state.snake[idx - 1].x;
                sq.y = state.snake[idx - 1].y;
            }
        }
    } else if (state.runState === STATE_LOSING) {
        interval = 10; // Reduce el intervalo para la animación de perder

        if (state.snake.length > 0) {
            // Reduce la longitud de la serpiente
            state.snake.splice(0, 1);
        }

        if (state.snake.length === 0) {
            // Reinicia el juego cuando la serpiente desaparece
            state.runState = STATE_INIT;
            state.snake.push(randomXY());
            state.prey = randomXY();
            state.score = 0;
            showStartScreen(); // Muestra la pantalla de inicio de nuevo
            return; // Detiene la ejecución del tick
        }
    }

    // Verifica si la serpiente ha colisionado
    if (detectCollision()) {
        state.runState = STATE_LOSING; // Cambia el estado a "perdiendo"
        state.growing = 0; // Resetea el crecimiento
    }

    // Si la serpiente ha comido la presa
    if (didScore) {
        state.growing += GROW_SCALE; // Incrementa el crecimiento
        state.prey = randomXY(); // Mueve la presa a una nueva posición aleatoria
        state.score += 10; // Incrementa el puntaje
    }

    // Si la serpiente debe crecer, añade el último segmento de nuevo
    if (state.growing > 0) {
        state.snake.push(tail);
        state.growing -= 1;
    }

    // Dibuja el estado actualizado del juego
    requestAnimationFrame(draw);
    // Programa la próxima llamada a tick
    setTimeout(tick, interval);
};

// Función para detectar colisiones
function detectCollision() {
    const head = state.snake[0]; // Cabeza de la serpiente

    // Verifica si la cabeza está fuera del tablero
    if (head.x < 0 || head.x >= BOARD_WIDTH || head.y >= BOARD_HEIGHT || head.y < 0) {
        return true;
    }

    // Verifica si la cabeza colisiona con cualquier segmento del cuerpo
    for (let idx = 1; idx < state.snake.length; idx++) {
        const sq = state.snake[idx];
        if (sq.x === head.x && sq.y === head.y) {
            return true;
        }
    }

    return false;
}

// Dibuja una serpiente con el color especificado en una posición del tablero
function drawSnakeSegment(x, y, color) {
    state.context.fillStyle = color;
    state.context.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    state.context.strokeStyle = '#fff';
    state.context.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
}

// Dibuja la presa
function drawPrey(x, y) {
    state.context.fillStyle = 'red';
    state.context.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    state.context.strokeStyle = '#fff';
    state.context.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
}

// Dibuja el texto de Game Over
function drawGameOver() {
    state.context.fillStyle = '#fff';
    state.context.font = '40px Arial';
    state.context.fillText('Game Over', 150, 250);
}

// Dibuja el puntaje actual
function drawScore() {
    state.context.fillStyle = '#fff';
    state.context.font = '20px Arial';
    state.context.fillText('Puntaje: ' + state.score, 10, 20);
}

// Dibuja el estado actual del juego
function draw() {
    state.context.clearRect(0, 0, 500, 500); // Limpia el canvas

    // Dibuja cada segmento de la serpiente
    state.snake.forEach((segment, index) => {
        if (index === 0) {
            drawSnakeSegment(segment.x, segment.y, state.snakeColor); // Dibuja la cabeza de la serpiente
        } else {
            drawSnakeSegment(segment.x, segment.y, state.snakeColor); // Dibuja el cuerpo de la serpiente
        }
    });

    // Dibuja la presa
    drawPrey(state.prey.x, state.prey.y);

    // Dibuja el puntaje
    drawScore();

    // Si está en estado de perder, dibuja el texto de Game Over
    if (state.runState === STATE_LOSING) {
        drawGameOver();
    }
}

// Muestra la pantalla de inicio y maneja la lógica para iniciar el juego
function showStartScreen() {
    state.runState = STATE_INIT; // Estado de inicio del juego
    state.score = 0; // Reinicia el puntaje

    // Mostrar el overlay
    document.getElementById('overlay').style.display = 'flex';

    // Manejar la selección de color y velocidad de la serpiente
    document.getElementById('start-button').addEventListener('click', function () {
        state.snakeColor = document.getElementById('color-selector').value;
        state.tickInterval = parseInt(document.getElementById('speed-selector').value);
        document.getElementById('overlay').style.display = 'none'; // Esconder el overlay
        state.runState = STATE_RUNNING; // Comenzar el juego
        tick(); // Comienza la actualización del juego
    });
}

// Inicializa el juego cuando la ventana se carga
window.onload = function () {
    state.canvas = document.querySelector('canvas');
    state.context = state.canvas.getContext('2d');

    // Cambia la dirección de la serpiente según la tecla presionada
    window.onkeydown = function (e) {
        const direction = DIRECTIONS_MAP[e.key];

        if (direction) {
            const [x, y] = direction;

            // Verifica que la nueva dirección no sea la opuesta a la actual
            if (x !== -state.direction.x && y !== -state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }

    // Inicia el ciclo de actualización del juego
    state.prey = randomXY(); // Coloca la presa en una posición aleatoria al inicio
    showStartScreen(); // Muestra la pantalla de inicio
};