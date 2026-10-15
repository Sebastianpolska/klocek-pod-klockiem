// KPK GAME - Copyright (c) 2026 Sebastian Polska. Wszelkie prawa zastrzeżone. Zabrania się kopiowania i modyfikowania kodu.
const COPYRIGHT_HASH = "b8e7a4c2d9f1e3b6a5c8d2f4e7a9b1c3";
const canvas = document.getElementById('KPK');
if (!canvas) {
	console.error('Canvas element not found');
}

// Settings
let expertMode = false;
let speedMultiplier = 1;
let windowSize = 0;
let keyBindings = {
	left: 'a',
	right: 'd',
	rotate: 'r',
	drop: 's',
	harddrop: ' ',
	pause: 'p'
};

// Load settings from localStorage
const savedSettings = localStorage.getItem('kpkSettings');
if (savedSettings) {
	const settings = JSON.parse(savedSettings);
	expertMode = settings.expertMode || false;
	speedMultiplier = settings.speedMultiplier || 1;
	windowSize = settings.windowSize || 0;
	keyBindings = settings.keyBindings || keyBindings;
}

// Update key inputs
document.getElementById('key-left').value = keyBindings.left.toUpperCase();
document.getElementById('key-right').value = keyBindings.right.toUpperCase();
document.getElementById('key-rotate').value = keyBindings.rotate.toUpperCase();
document.getElementById('key-drop').value = keyBindings.drop.toUpperCase();
document.getElementById('key-harddrop').value = keyBindings.harddrop === ' ' ? 'SPACJA' : keyBindings.harddrop.toUpperCase();
document.getElementById('key-pause').value = keyBindings.pause.toUpperCase();
document.getElementById('expert-mode').checked = expertMode;
document.getElementById('speed-setting').value = speedMultiplier;
document.getElementById('speed-setting').disabled = expertMode;
document.getElementById('window-size').value = windowSize;

// Update controls display
function updateControlsDisplay() {
	const controlsLeft = document.getElementById('controls-left');
	const controlsRight = document.getElementById('controls-right');
	const controlsRotate = document.getElementById('controls-rotate');
	const controlsDrop = document.getElementById('controls-drop');
	const controlsHarddrop = document.getElementById('controls-harddrop');
	const controlsPause = document.getElementById('controls-pause');
	
	if (controlsLeft) controlsLeft.textContent = `${keyBindings.left.toUpperCase()} - Ruch w lewo`;
	if (controlsRight) controlsRight.textContent = `${keyBindings.right.toUpperCase()} - Ruch w prawo`;
	if (controlsRotate) controlsRotate.textContent = `${keyBindings.rotate.toUpperCase()} - Obrót`;
	if (controlsDrop) controlsDrop.textContent = `${keyBindings.drop.toUpperCase()} - Szybciej`;
	if (controlsHarddrop) controlsHarddrop.textContent = `${keyBindings.harddrop === ' ' ? 'SPACJA' : keyBindings.harddrop.toUpperCase()} - Upuść/Start`;
	if (controlsPause) controlsPause.textContent = `${keyBindings.pause.toUpperCase()} - Pauza`;
}

// Update expert notification
function updateExpertNotification() {
	const notification = document.getElementById('expert-notification');
	if (notification) {
		if (expertMode) {
			notification.classList.remove('hidden');
		} else {
			notification.classList.add('hidden');
		}
	}
}

// Update window size
function updateWindowSize() {
	const sizeMap = {
		0: 12,
		2: 14,
		4: 16,
		6: 18
	};
	const newWidth = sizeMap[windowSize] || 12;
	
	// Update arena size
	const newArena = [];
	for (let i = 0; i < 20; i++) {
		newArena.push(new Array(newWidth).fill(0));
	}
	Object.assign(arena, newArena);
	
	// Update canvas size
	const scale = 26;
	const newCanvasWidth = newWidth * scale;
	canvas.width = newCanvasWidth;
	
	// Update draw grid
	drawGrid = function() {
		context.strokeStyle = 'rgba(255,255,255,0.1)';
		context.lineWidth = 0.017;
		for (let x = 0; x <= newWidth; x++) {
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, 20);
			context.stroke();
		}
		for (let y = 0; y <= 20; y++) {
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(newWidth, y);
			context.stroke();
		}
	};
	
	draw();
}

function checkCopyright() {
	const expectedCopyright = "KPK GAME - Copyright (c) 2026 Sebastian Polska. Wszelkie prawa zastrzeżone. Zabrania się kopiowania i modyfikowania kodu.";
	const htmlCopyright = document.querySelector('meta[name="copyright-hash"]');
	
	if (!htmlCopyright || htmlCopyright.getAttribute('content') !== COPYRIGHT_HASH) {
		blockGame();
		return;
	}
	
	const htmlContent = document.documentElement.outerHTML;
	if (!htmlContent.includes(expectedCopyright)) {
		blockGame();
		return;
	}
	
	if (!document.querySelector('script[src="script.js"]')) {
		blockGame();
		return;
	}
}

function blockGame() {
	document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1e3c72;color:white;font-family:Arial;font-size:24px;text-align:center;padding:20px;"><p>Naruszenie praw autorskich! Gra została zablokowana.<br>Proszę przywrócić oryginalny kod copyright.</p></div>';
	throw new Error("Copyright violation detected");
}

document.addEventListener('DOMContentLoaded', checkCopyright);
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

context.scale(26, 26);
nextContext.scale(16, 16);

const colors = [
	null,
	'#FF0D72',
	'#0DC2FF',
	'#0DFF72',
	'#F538FF',
	'#FF8E0D',
	'#FFE138',
	'#3877FF',
];

const pieces = 'ILJOTSZ';
const MAX_LEVEL = 8;

function createPiece(t) {
	if (t === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
	if (t === 'L') return [[0,2,0],[0,2,0],[0,2,2]];
	if (t === 'J') return [[0,3,0],[0,3,0],[3,3,0]];
	if (t === 'O') return [[4,4],[4,4]];
	if (t === 'Z') return [[5,5,0],[0,5,5],[0,0,0]];
	if (t === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
	if (t === 'T') return [[0,7,0],[7,7,7],[0,0,0]];
}

function drawMatrix(m, o, ctx) {
	m.forEach((r, y) => r.forEach((v, x) => {
		if (v !== 0) {
			ctx.fillStyle = colors[v];
			ctx.fillRect(x + o.x, y + o.y, 1, 1);
			ctx.lineWidth = 0.035;
			ctx.strokeStyle = 'rgba(255,255,255,0.5)';
			ctx.strokeRect(x + o.x, y + o.y, 1, 1);
		}
	}));
}

function drawGrid() {
	context.strokeStyle = 'rgba(255,255,255,0.1)';
	context.lineWidth = 0.017;
	for (let x = 0; x <= 12; x++) {
		context.beginPath();
		context.moveTo(x, 0);
		context.lineTo(x, 20);
		context.stroke();
	}
	for (let y = 0; y <= 20; y++) {
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(12, y);
		context.stroke();
	}
}

function draw() {
	context.fillStyle = '#000';
	context.fillRect(0, 0, canvas.width, canvas.height);
	drawGrid();
	drawMatrix(arena, {x: 0, y: 0}, context);
	drawMatrix(player.matrix, player.pos, context);
}

function drawNext() {
	nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
	const offset = {
		x: (5 - nextPiece[0].length) / 2,
		y: (5 - nextPiece.length) / 2,
	};
	drawMatrix(nextPiece, offset, nextContext);
}

function merge(a, p) {
	p.matrix.forEach((r, y) => r.forEach((v, x) => {
		if (v !== 0) a[y + p.pos.y][x + p.pos.x] = v;
	}));
}

function rotate(m, d) {
	for (let y = 0; y < m.length; ++y)
		for (let x = 0; x < y; ++x)
			[m[x][y], m[y][x]] = [m[y][x], m[x][y]];
	if (d > 0) m.forEach(r => r.reverse());
	else m.reverse();
}

function collide(a, p) {
	const m = p.matrix, o = p.pos;
	for (let y = 0; y < m.length; ++y)
		for (let x = 0; x < m[y].length; ++x)
			if (m[y][x] !== 0 && (a[y + o.y] && a[y + o.y][x + o.x]) !== 0) return true;
	return false;
}
function arenaSweep() {
	let rc = 0;
	outer: for (let y = arena.length - 1; y > 0; --y) {
		for (let x = 0; x < arena[y].length; ++x)
			if (arena[y][x] === 0) continue outer;
		arena.splice(y, 1)[0].fill(0);
		arena.unshift(new Array(12).fill(0));
		++y;
		rc++;
	}
	if (rc > 0) {
		let scoreMultiplier = 1;
		if (speedMultiplier > 2.5) {
			scoreMultiplier = 1.5;
		}
		player.score += Math.floor(rc * 10 * rc * scoreMultiplier);
		if (expertMode) {
			player.level = Math.floor(player.score / 100) + 1;
		} else {
			player.level = Math.min(8, Math.floor(player.score / 100) + 1);
		}
		scoreElement.innerText = player.score;
		levelElement.innerText = player.level;
		if (player.score > highScore) {
			highScore = player.score;
			highScoreElement.innerText = highScore;
			localStorage.setItem('kpkHighScore', highScore);
		}
		dropInterval = Math.max(100, (1000 - (player.level - 1) * 100) / speedMultiplier);
	}
}

function playerReset() {
	if (nextPiece === null) nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.matrix = nextPiece;
	nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
	drawNext();
	player.pos.y = 0;
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
	if (collide(arena, player)) {
		arena.forEach(r => r.fill(0));
		player.score = 0;
		player.level = 1;
		scoreElement.innerText = player.score;
		levelElement.innerText = player.level;
		dropInterval = 1000;
		gameOver = true;
		isPaused = true;
		startBtn.innerText = 'Restart';
	}
}

function playerDrop() {
	player.pos.y++;
	if (collide(arena, player)) {
		player.pos.y--;
		merge(arena, player);
		playerReset();
		arenaSweep();
	}
	dropCounter = 0;
}

function playerMove(d) {
	player.pos.x += d;
	if (collide(arena, player)) player.pos.x -= d;
}

function playerRotate(d) {
	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix, d);
	while (collide(arena, player)) {
		player.pos.x += offset;
		offset = -(offset + (offset > 0 ? 1 : -1));
		if (offset > player.matrix[0].length) {
			rotate(player.matrix, -d);
			player.pos.x = pos;
			return;
		}
	}
}

function playerHardDrop() {
	while (!collide(arena, player)) player.pos.y++;
	player.pos.y--;
	merge(arena, player);
	playerReset();
	arenaSweep();
	dropCounter = 0;
}

let dropCounter = 0, dropInterval = 1000, lastTime = 0, isPaused = true, gameOver = false, nextPiece = null;
const arena = Array(20).fill().map(() => Array(12).fill(0));
const player = {pos: {x: 0, y: 0}, matrix: null, score: 0, level: 1};
let highScore = localStorage.getItem('kpkHighScore') || 0;
highScoreElement.innerText = highScore;

function update(t = 0) {
	if (isPaused) {
		if (!gameOver) requestAnimationFrame(update);
		return;
	}
	const dt = t - lastTime;
	lastTime = t;
	dropCounter += dt;
	if (dropCounter > dropInterval) playerDrop();
	draw();
	requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
	const key = e.key.toLowerCase();
	const settingsMenuEl = document.getElementById('settings-menu');
	if (settingsMenuEl && !settingsMenuEl.classList.contains('hidden')) return; // Don't process game controls when settings are open
	
	if (key === keyBindings.harddrop) {
		if (gameOver) {
			e.preventDefault();
			resetGame();
			return;
		}
		if (isPaused) {
			e.preventDefault();
			isPaused = false;
			if (player.matrix === null) playerReset();
			lastTime = performance.now();
			update();
			startBtn.innerText = 'Pauza';
			return;
		}
	}
	if (isPaused) return;
	if (key === keyBindings.left) playerMove(-1);
	else if (key === keyBindings.right) playerMove(1);
	else if (key === keyBindings.drop) playerDrop();
	else if (key === keyBindings.rotate) playerRotate(1);
	else if (key === keyBindings.harddrop) {
		e.preventDefault();
		playerHardDrop();
	}
});

document.addEventListener('keydown', e => {
	const key = e.key.toLowerCase();
	const settingsMenuEl = document.getElementById('settings-menu');
	if (settingsMenuEl && !settingsMenuEl.classList.contains('hidden')) return; // Don't process game controls when settings are open
	
	if (key === keyBindings.pause && !gameOver) {
		isPaused = !isPaused;
		if (!isPaused) {
			lastTime = performance.now();
			update();
		}
	}
});

function resetGame() {
	arena.forEach(r => r.fill(0));
	player.score = 0;
	player.level = 1;
	scoreElement.innerText = player.score;
	levelElement.innerText = player.level;
	highScoreElement.innerText = highScore;
	dropInterval = 1000;
	gameOver = false;
	isPaused = true;
	nextPiece = null;
	player.matrix = null;
	startBtn.innerText = 'Start';
	draw();
}

startBtn.addEventListener('click', () => {
	if (gameOver) {
		resetGame();
		return;
	}
	isPaused = !isPaused;
	if (!isPaused) {
		if (player.matrix === null) playerReset();
		lastTime = performance.now();
		update();
		startBtn.innerText = 'Pauza';
	} else startBtn.innerText = 'Start';
});

resetBtn.addEventListener('click', resetGame);

// Settings menu - initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	const settingsBtn = document.getElementById('settings-btn');
	const settingsMenu = document.getElementById('settings-menu');
	const closeSettings = document.getElementById('close-settings');
	const expertModeToggle = document.getElementById('expert-mode');

	if (settingsBtn && settingsMenu && closeSettings && expertModeToggle) {
		settingsBtn.addEventListener('click', () => {
			settingsMenu.classList.remove('hidden');
		});

		closeSettings.addEventListener('click', () => {
			settingsMenu.classList.add('hidden');
			// Save settings
			const settings = {
				expertMode: expertModeToggle.checked,
				speedMultiplier: speedMultiplier,
				windowSize: windowSize,
				keyBindings: keyBindings
			};
			localStorage.setItem('kpkSettings', JSON.stringify(settings));
		});

		expertModeToggle.addEventListener('change', (e) => {
			expertMode = e.target.checked;
			updateExpertNotification();
			
			// Disable speed setting when expert mode is on
			const speedSetting = document.getElementById('speed-setting');
			const speedLockOverlay = document.getElementById('speed-lock-overlay');
			if (speedSetting && speedLockOverlay) {
				speedSetting.disabled = expertMode;
				if (expertMode) {
					speedSetting.value = 1;
					speedMultiplier = 1;
					speedLockOverlay.classList.remove('hidden');
				} else {
					speedLockOverlay.classList.add('hidden');
				}
			}
		});

		// Speed setting
		const speedSetting = document.getElementById('speed-setting');
		if (speedSetting) {
			speedSetting.disabled = expertMode;
			speedSetting.addEventListener('change', (e) => {
				let value = parseFloat(e.target.value);
				if (value < 1) value = 1;
				if (value > 3) value = 3;
				speedMultiplier = value;
			});
		}

		// Window size setting
		const windowSizeSelect = document.getElementById('window-size');
		if (windowSizeSelect) {
			windowSizeSelect.addEventListener('change', (e) => {
				windowSize = parseInt(e.target.value);
				updateWindowSize();
			});
		}

			// Key binding
		const keyInputs = ['left', 'right', 'rotate', 'drop', 'harddrop', 'pause'];
		keyInputs.forEach(action => {
			const input = document.getElementById(`key-${action}`);
			if (input) {
				input.addEventListener('keydown', (e) => {
					e.preventDefault();
					const key = e.key.toLowerCase();
					keyBindings[action] = key;
					input.value = key === ' ' ? 'SPACJA' : key.toUpperCase();
					updateControlsDisplay();
				});
				input.addEventListener('click', () => {
					input.value = '';
					input.focus();
				});
			}
		});
	}
	
	// Update controls display after DOM is ready
	updateControlsDisplay();
	
	// Initialize expert notification
	updateExpertNotification();
	
	// Initialize window size only if not default
	if (windowSize !== 0) {
		updateWindowSize();
	}
});

draw();
