// ===== GAME CONFIGURATION =====
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Tipe topping dengan properti masing-masing (size untuk desktop 800px)
const TOPPING_TYPES = {
    sambal: {
        name: 'sambal',
        image: 'topping-sambal.png',
        speed: 3,
        size: 40,
    },
    pangsit: {
        name: 'pangsit',
        image: 'topping-pangsit.png',
        speed: 2,
        size: 50,
    },
    daunbawang: {
        name: 'daunbawang',
        image: 'topping-daun-bawang.png',
        speed: 2.5,
        size: 45,
    }
};

/**
 * Get size multiplier based on canvas width (mobile optimization)
 * Desktop (800px): 1.0x
 * Tablet (600px): 0.85x
 * Mobile (400px): 0.7x
 */
function getSizeMultiplier() {
    if (!canvas) return 1.0;
    const width = canvas.width;

    if (width >= 750) return 1.0;      // Desktop
    if (width >= 600) return 0.85;     // Tablet
    if (width >= 480) return 0.75;     // Mobile
    return 0.65;                       // Small phone
}

// ===== GAME STATE =====
let gameState = {
    isRunning: false,
    isPaused: false,
    score: 0,
    highScore: loadHighScore(),
    startTime: 0,
    frameCount: 0,
    gameOver: false,
    selectedTopping: null, // Topping yang dipilih untuk dihindari
    audioEnabled: true, // Audio state
    difficultyLevel: 0, // Current difficulty level (0-based, increases every 150 score)
    bgmPlaying: false, // Track BGM state
};

// ===== AUDIO CONTEXT =====
let audioContext = null;
let bgmOscillator = null;
let bgmGain = null;
let lastBGMStartTime = 0;
let bgmTimeout = null;

// ===== PLAYER OBJECT =====
const player = {
    x: CANVAS_WIDTH / 2 - 25,
    y: CANVAS_HEIGHT - 80,
    width: 50,
    height: 50,
    speed: 5,
    image: null,
    dx: 0,
    keys: {
        left: false,
        right: false
    }
};

// ===== TOPPINGS ARRAY =====
let toppings = [];

// ===== CANVAS & CONTEXT =====
let canvas;
let ctx;

// ===== IMAGE ASSETS =====
let images = {
    // Player sprites berdasarkan pilihan topping
    playerAvoidSambal: null,
    playerAvoidPangsit: null,
    playerAvoidDaunbawang: null,

    // Topping sprites
    toppingDaunbawang: null,
    toppingPangsit: null,
    toppingSambal: null,

    // Game Over sprites (mie dengan topping)
    mieKenaSambal: null,
    mieKenaPangsit: null,
    mieKenaDaunbawang: null
};

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

/**
 * Inisialisasi game: setup canvas, load assets, setup event listeners
 */
function initializeGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Resize canvas untuk responsive
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load semua assets
    loadAssets().then(() => {
        setupEventListeners();
        updateHighScoreDisplay();
    });
}

/**
 * Resize canvas untuk responsive design
 */
function resizeCanvas() {
    const wrapper = document.querySelector('.game-wrapper');
    if (wrapper) {
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
    }
}

/**
 * Load semua gambar assets
 */
async function loadAssets() {
    return Promise.all([
        // Player sprites
        loadImage('playerAvoidSambal', 'assets/players/player-avoid-sambal.png'),
        loadImage('playerAvoidPangsit', 'assets/players/player-avoid-pangsit.png'),
        loadImage('playerAvoidDaunbawang', 'assets/players/player-avoid-daunbawang.png'),

        // Topping sprites
        loadImage('toppingDaunbawang', 'assets/toppings/topping-daun-bawang.png'),
        loadImage('toppingPangsit', 'assets/toppings/topping-pangsit.png'),
        loadImage('toppingSambal', 'assets/toppings/topping-sambal.png'),

        // Game Over sprites
        loadImage('mieKenaSambal', 'assets/game-over/mie-kena-sambal.png'),
        loadImage('mieKenaPangsit', 'assets/game-over/mie-kena-pangsit.png'),
        loadImage('mieKenaDaunbawang', 'assets/game-over/mie-kena-daunbawang.png')
    ]);
}

/**
 * Load satu gambar dengan Promise
 */
function loadImage(key, filename) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = filename;
        img.onload = () => {
            images[key] = img;
            console.log(`✓ Loaded: ${filename}`);
            resolve();
        };
        img.onerror = () => {
            console.error(`✗ Failed to load: ${filename}`);
            // Resolve anyway untuk tidak block game
            resolve();
        };
    });
}

/**
 * Setup event listeners untuk kontrol dan UI buttons
 */
function setupEventListeners() {
    // Keyboard events untuk pergerakan
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Mobile button controls
    initializeMobileButtons();

    // Topping selection
    document.querySelectorAll('.topping-option').forEach(option => {
        option.addEventListener('click', selectTopping);
    });

    // Button restart
    document.getElementById('restartBtn').addEventListener('click', restartGame);

    // Mute button
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) {
        muteBtn.addEventListener('click', toggleAudio);
    }
}

/**
 * Handle topping selection
 */
function selectTopping(e) {
    // Hapus selected class dari semua option
    document.querySelectorAll('.topping-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Tambah selected class ke yang diklik
    const selected = e.currentTarget;
    selected.classList.add('selected');

    // Set selected topping
    gameState.selectedTopping = selected.getAttribute('data-topping');

    // Play click sound
    playClickSound();

    // Start game setelah delay kecil
    setTimeout(() => {
        startGame();
    }, 300);
}

/**
 * Handle key down events (A/D atau Arrow Left/Right)
 */
function handleKeyDown(e) {
    if (!gameState.isRunning) return;

    const key = e.key.toLowerCase();

    if (key === 'a' || key === 'arrowleft') {
        player.keys.left = true;
        e.preventDefault();
    }
    if (key === 'd' || key === 'arrowright') {
        player.keys.right = true;
        e.preventDefault();
    }
}

/**
 * Handle key up events
 */
function handleKeyUp(e) {
    const key = e.key.toLowerCase();

    if (key === 'a' || key === 'arrowleft') {
        player.keys.left = false;
    }
    if (key === 'd' || key === 'arrowright') {
        player.keys.right = false;
    }
}

/**
 * ===== MOBILE BUTTON CONTROLS =====
 * Initialize mobile control buttons
 */
function initializeMobileButtons() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');

    if (!leftBtn || !rightBtn) return;

    // Left button - mouse events
    leftBtn.addEventListener('mousedown', () => {
        if (gameState.isRunning) player.keys.left = true;
    });
    leftBtn.addEventListener('mouseup', () => {
        player.keys.left = false;
    });
    leftBtn.addEventListener('mouseleave', () => {
        player.keys.left = false;
    });

    // Right button - mouse events
    rightBtn.addEventListener('mousedown', () => {
        if (gameState.isRunning) player.keys.right = true;
    });
    rightBtn.addEventListener('mouseup', () => {
        player.keys.right = false;
    });
    rightBtn.addEventListener('mouseleave', () => {
        player.keys.right = false;
    });

    // Touch events untuk mobile
    leftBtn.addEventListener('touchstart', (e) => {
        if (gameState.isRunning) player.keys.left = true;
        e.preventDefault();
    });
    leftBtn.addEventListener('touchend', () => {
        player.keys.left = false;
    });

    rightBtn.addEventListener('touchstart', (e) => {
        if (gameState.isRunning) player.keys.right = true;
        e.preventDefault();
    });
    rightBtn.addEventListener('touchend', () => {
        player.keys.right = false;
    });
}

/**
 * Mulai game
 */
function startGame() {
    // Sembunyikan start screen
    document.getElementById('startScreen').style.display = 'none';

    // Reset game state
    gameState.isRunning = true;
    gameState.gameOver = false;
    gameState.score = 0;
    gameState.startTime = Date.now();
    gameState.frameCount = 0;

    // Reset player position dan load sprite sesuai pilihan
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 80;
    loadPlayerSprite();

    // Clear toppings
    toppings = [];

    // Show mobile joystick if on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('mobileControls').classList.add('active');
    }

    // Update display
    updateScoreDisplay();
    document.getElementById('gameOverScreen').classList.remove('show');

    // Start background music
    playBackgroundMusic();

    // Mulai game loop
    gameLoop();
}

/**
 * Load player sprite berdasarkan topping yang dipilih
 */
function loadPlayerSprite() {
    const spriteMap = {
        'sambal': 'playerAvoidSambal',
        'pangsit': 'playerAvoidPangsit',
        'daunbawang': 'playerAvoidDaunbawang'
    };

    const spriteKey = spriteMap[gameState.selectedTopping];
    player.image = images[spriteKey] || images.playerAvoidSambal;
}

/**
 * Main game loop
 */
function gameLoop() {
    if (!gameState.isRunning) return;

    // Update game state
    update();

    // Render game
    render();

    // Request next frame
    requestAnimationFrame(gameLoop);
}

/**
 * Update game logic setiap frame
 */
function update() {
    gameState.frameCount++;

    // Update player position
    updatePlayerPosition();

    // Update score (based on time survived)
    gameState.score = Math.floor((Date.now() - gameState.startTime) / 100);
    updateScoreDisplay();

    // Update difficulty based on score (every 150 points = 1 level)
    updateDifficulty();

    // Spawn toppings dengan spawn rate berdasarkan difficulty
    const spawnRate = getSpawnRate();
    if (gameState.frameCount % spawnRate === 0) {
        spawnTopping();
    }

    // Update toppings
    updateToppings();

    // Check collision
    checkCollisions();
}

/**
 * Update difficulty level berdasarkan score (every 150 points = 1 level)
 */
function updateDifficulty() {
    const newDifficultyLevel = Math.floor(gameState.score / 150);
    if (newDifficultyLevel !== gameState.difficultyLevel) {
        gameState.difficultyLevel = newDifficultyLevel;
        console.log(`📈 Difficulty Level: ${gameState.difficultyLevel} (Score: ${gameState.score})`);
    }
}

/**
 * Get spawn rate berdasarkan difficulty level
 * Level 0: 30 frames (1 every 0.5s at 60fps)
 * Level 1: 25 frames (1 every 0.42s)
 * Level 2: 20 frames (1 every 0.33s)
 * Level 3: 15 frames (1 every 0.25s)
 * Level 4+: 10 frames (1 every 0.17s - very fast)
 */
function getSpawnRate() {
    const baseRate = 30;
    const reduction = Math.min(gameState.difficultyLevel * 5, 20); // Max reduction of 20
    return Math.max(baseRate - reduction, 10);
}

/**
 * Get speed multiplier berdasarkan difficulty level
 * Multiplier increases by 0.2 per difficulty level
 * Level 0: 1.0x
 * Level 1: 1.2x
 * Level 2: 1.4x
 * Level 3: 1.6x
 * Level 4: 1.8x
 * Level 5+: 2.0x (capped)
 */
function getSpeedMultiplier() {
    return Math.min(1.0 + (gameState.difficultyLevel * 0.2), 2.0);
}

/**
 * Update posisi player berdasarkan input keyboard
 */
function updatePlayerPosition() {
    if (player.keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (player.keys.right && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
}

/**
 * Spawn topping baru di posisi acak di atas layar
 */
function spawnTopping() {
    // Random pilih tipe topping
    const toppingTypeKeys = Object.keys(TOPPING_TYPES);
    const randomType = toppingTypeKeys[Math.floor(Math.random() * toppingTypeKeys.length)];
    const toppingType = TOPPING_TYPES[randomType];

    // Apply size multiplier based on device width
    const sizeMultiplier = getSizeMultiplier();
    const scaledSize = Math.floor(toppingType.size * sizeMultiplier);

    // Random X position
    const x = Math.random() * (canvas.width - scaledSize);

    // Map sprite key
    const spriteKeyMap = {
        'sambal': 'toppingSambal',
        'pangsit': 'toppingPangsit',
        'daunbawang': 'toppingDaunbawang'
    };

    // Apply speed multiplier based on difficulty
    const speedMultiplier = getSpeedMultiplier();

    const topping = {
        x: x,
        y: -scaledSize,
        width: scaledSize,
        height: scaledSize,
        type: randomType,
        speed: toppingType.speed * speedMultiplier,
        rotation: 0,
        image: images[spriteKeyMap[randomType]]
    };

    toppings.push(topping);
}

/**
 * Update semua toppings (posisi, rotasi, hapus yang out of bounds)
 */
function updateToppings() {
    for (let i = toppings.length - 1; i >= 0; i--) {
        const topping = toppings[i];

        // Update posisi
        topping.y += topping.speed;

        // Update rotasi untuk efek visual
        topping.rotation += topping.speed / 2;

        // Hapus topping yang sudah keluar dari layar
        if (topping.y > canvas.height) {
            toppings.splice(i, 1);
        }
    }
}

/**
 * Check collision antara player dan toppings
 */
function checkCollisions() {
    for (let topping of toppings) {
        // Hanya check collision dengan topping yang dipilih
        if (topping.type === gameState.selectedTopping) {
            if (isColliding(player, topping)) {
                // Play collision sound
                playCollisionSound();
                endGame();
                return;
            }
        }
    }
}

/**
 * AABB collision detection
 */
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * End game ketika terkena topping
 */
function endGame() {
    gameState.isRunning = false;
    gameState.gameOver = true;

    // Hide mobile joystick
    document.getElementById('mobileControls').classList.remove('active');

    // Stop background music
    stopBackgroundMusic();

    // Play game over sound
    playGameOverSound();

    // Update high score jika perlu
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        saveHighScore(gameState.highScore);
    }

    // Show game over screen
    showGameOverScreen();
}

/**
 * Tampilkan game over screen dengan mie image yang sesuai
 */
function showGameOverScreen() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    const mieResultImage = document.getElementById('mieResultImage');

    // Map topping ke image
    const imageMap = {
        'sambal': 'assets/game-over/mie-kena-sambal.png',
        'pangsit': 'assets/game-over/mie-kena-pangsit.png',
        'daunbawang': 'assets/game-over/mie-kena-daunbawang.png'
    };

    mieResultImage.src = imageMap[gameState.selectedTopping] || imageMap['sambal'];

    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalHighScore').textContent = gameState.highScore;
    gameOverScreen.classList.add('show');
}

/**
 * Render game di canvas
 */
function render() {
    // Clear canvas dengan gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    if (player.image) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
        ctx.restore();
    }

    // Draw toppings
    for (let topping of toppings) {
        if (topping.image) {
            ctx.save();

            // Apply rotation
            const centerX = topping.x + topping.width / 2;
            const centerY = topping.y + topping.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((topping.rotation * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);

            // Draw image
            ctx.drawImage(topping.image, topping.x, topping.y, topping.width, topping.height);

            ctx.restore();
        }
    }
}

/**
 * Update score display di UI
 */
function updateScoreDisplay() {
    document.getElementById('currentScore').textContent = gameState.score;
}

/**
 * Update high score display di UI
 */
function updateHighScoreDisplay() {
    document.getElementById('highScore').textContent = gameState.highScore;
}

/**
 * Restart game
 */
function restartGame() {
    // Stop any playing audio
    stopBackgroundMusic();

    // Play click sound
    playClickSound();

    // Show start screen lagi
    document.getElementById('startScreen').style.display = 'flex';
    document.getElementById('gameOverScreen').classList.remove('show');

    // Reset selected topping
    document.querySelectorAll('.topping-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    gameState.selectedTopping = null;
}

/**
 * Load high score dari LocalStorage
 */
function loadHighScore() {
    const saved = localStorage.getItem('mieAyamHighScore');
    return saved ? parseInt(saved, 10) : 0;
}

/**
 * Save high score ke LocalStorage
 */
function saveHighScore(score) {
    localStorage.setItem('mieAyamHighScore', score.toString());
}

// ===== AUDIO FUNCTIONS (Web Audio API) =====

/**
 * Initialize Audio Context
 */
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✓ Audio Context initialized', audioContext.state);
        } catch (e) {
            console.error('✗ Failed to initialize Audio Context:', e);
            audioContext = null;
            return false;
        }
    }

    // Resume context if suspended (required by some browsers)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('✓ Audio Context resumed');
        }).catch(e => {
            console.error('✗ Failed to resume Audio Context:', e);
        });
    }

    return !!audioContext;
}

/**
 * Play collision sound (saat tertabrak topping)
 */
function playCollisionSound() {
    if (!gameState.audioEnabled) return;

    if (!initAudioContext()) {
        console.warn('Audio context not available for collision sound');
        return;
    }

    try {
        const now = audioContext.currentTime;

        // Buat oscillator untuk sound
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Sound effect: descending pitch (800Hz -> 200Hz)
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
        console.log('💥 Collision sound played');
    } catch (e) {
        console.error('Collision sound error:', e);
    }
}

/**
 * Play game over sound
 */
function playGameOverSound() {
    if (!gameState.audioEnabled) return;

    if (!initAudioContext()) {
        console.warn('Audio context not available for game over sound');
        return;
    }

    try {
        const now = audioContext.currentTime;

        // Buat dua oscillator untuk game over jingle
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioContext.destination);

        // Two-tone effect (harmonic descending)
        osc1.frequency.setValueAtTime(400, now);
        osc2.frequency.setValueAtTime(300, now);

        osc1.frequency.exponentialRampToValueAtTime(200, now + 0.5);
        osc2.frequency.exponentialRampToValueAtTime(150, now + 0.5);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
        console.log('💀 Game over sound played');
    } catch (e) {
        console.error('Game over sound error:', e);
    }
}

/**
 * Play button click sound
 */
function playClickSound() {
    if (!gameState.audioEnabled) return;

    if (!initAudioContext()) {
        console.warn('Audio context not available for click sound');
        return;
    }

    try {
        const now = audioContext.currentTime;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
        console.log('🔘 Click sound played');
    } catch (e) {
        console.error('Click sound error:', e);
    }
}

/**
 * Play background music (loop)
 */
function playBackgroundMusic() {
    if (!gameState.audioEnabled) {
        console.log('Audio disabled, skipping BGM');
        return;
    }

    if (!initAudioContext()) {
        console.warn('Audio context not available');
        return;
    }

    if (gameState.bgmPlaying) {
        console.log('BGM already playing, skipping');
        return;
    }

    try {
        // Stop previous BGM if exists
        if (bgmOscillator) {
            try {
                bgmOscillator.stop();
            } catch (e) {
                console.log('Previous BGM already stopped');
            }
        }

        // Clear previous timeout
        if (bgmTimeout) {
            clearTimeout(bgmTimeout);
        }

        const now = audioContext.currentTime;

        bgmOscillator = audioContext.createOscillator();
        bgmGain = audioContext.createGain();

        bgmOscillator.connect(bgmGain);
        bgmGain.connect(audioContext.destination);

        // Soft triangle wave melody pattern
        bgmOscillator.type = 'triangle';

        // Play simple melody (C-D-E-F-G-E-D-C)
        const melody = [
            { freq: 262, duration: 0.3 },  // C
            { freq: 294, duration: 0.3 },  // D
            { freq: 330, duration: 0.3 },  // E
            { freq: 349, duration: 0.3 },  // F
            { freq: 392, duration: 0.3 },  // G
            { freq: 330, duration: 0.3 },  // E
            { freq: 294, duration: 0.3 },  // D
            { freq: 262, duration: 0.6 },  // C
        ];

        let time = now;
        for (let note of melody) {
            bgmOscillator.frequency.setValueAtTime(note.freq, time);
            time += note.duration;
        }

        // Set volume
        bgmGain.gain.setValueAtTime(0.05, now);
        bgmGain.gain.exponentialRampToValueAtTime(0.05, time + 0.5);

        bgmOscillator.start(now);
        bgmOscillator.stop(time);
        lastBGMStartTime = now;
        gameState.bgmPlaying = true;

        console.log('🎵 BGM started');

        // Auto restart music after melody completes (3.6 seconds)
        bgmTimeout = setTimeout(() => {
            gameState.bgmPlaying = false;
            if (gameState.isRunning && gameState.audioEnabled) {
                playBackgroundMusic();
            }
        }, 3600);
    } catch (e) {
        console.error('BGM Error:', e);
        gameState.bgmPlaying = false;
    }
}

/**
 * Stop background music
 */
function stopBackgroundMusic() {
    if (bgmOscillator) {
        try {
            bgmOscillator.stop();
        } catch (e) {}
    }
    gameState.bgmPlaying = false;
}

/**
 * Toggle audio mute/unmute
 */
function toggleAudio() {
    gameState.audioEnabled = !gameState.audioEnabled;
    const muteBtn = document.getElementById('muteBtn');
    const muteIcon = muteBtn.querySelector('.mute-icon');

    console.log(`🔊 Audio toggled: ${gameState.audioEnabled ? 'ON' : 'OFF'}`);

    if (gameState.audioEnabled) {
        muteBtn.classList.remove('muted');
        muteIcon.textContent = '🔊';

        // Initialize audio context on user interaction
        initAudioContext();

        // Resume music if game is running
        if (gameState.isRunning) {
            playBackgroundMusic();
        }
    } else {
        muteBtn.classList.add('muted');
        muteIcon.textContent = '🔇';
        stopBackgroundMusic();
    }

    playClickSound();
}
