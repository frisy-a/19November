let blowCount = 0;
const flame = document.getElementById('flame');
const message = document.getElementById('wishMessage');
const micStatus = document.getElementById('micStatus');
const fireParticlesContainer = document.getElementById('fireParticles');
const smokePuffElement = document.getElementById('smokePuff');
const giftButtonContainer = document.getElementById('giftButtonContainer'); // container tombol hadiah

let audioContext;
let analyser;
let micSource;
let isExtinguished = false;
let blowDetectedTimer;

const BLOW_THRESHOLD_VOLUME = 90;
const SUSTAINED_BLOW_DURATION = 700;
const PARTICLE_EMIT_INTERVAL = 55;
let particleInterval;

// ============================
//   MIC INITIALIZATION
// ============================
async function initMic() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        micStatus.textContent = "🎤 Microphone is active. Blow to extinguish!";
        detectBlow(stream);

    } catch (err) {
        micStatus.textContent = "🚫 Microphone access denied. Please allow microphone access.";
        console.error("Error accessing microphone:", err);
    }
}

// ============================
//     FIRE PARTICLES
// ============================
function createFireParticle() {
    const particle = document.createElement('div');
    particle.classList.add('fire-particle');

    const startX = Math.random() * 10 - 5;
    const startY = Math.random() * 5;

    particle.style.left = `${50 + (startX / 15) * 100}%`;
    particle.style.top = `${-15 + startY}px`;
    particle.style.width = `${Math.random() * 5 + 3}px`;
    particle.style.height = `${Math.random() * 8 + 5}px`;

    const dx = (Math.random() - 0.5) * 60;
    const dy = -(Math.random() * 40 + 30);

    particle.style.setProperty('--dx', `${dx}px`);
    particle.style.setProperty('--dy', `${dy}px`);

    fireParticlesContainer.appendChild(particle);

    particle.addEventListener('animationend', () => particle.remove());
}

function emitParticles() {
    clearInterval(particleInterval);
    particleInterval = setInterval(createFireParticle, PARTICLE_EMIT_INTERVAL);
}

function stopEmittingParticles() {
    clearInterval(particleInterval);
}

// ============================
//       BLOW DETECTION
// ============================
function detectBlow(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    micSource = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;

    micSource.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function analyze() {
        if (isExtinguished) {
            micSource?.disconnect();
            analyser?.disconnect();
            audioContext?.close();
            return;
        }

        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, v) => a + v, 0) / dataArray.length;

        if (volume > BLOW_THRESHOLD_VOLUME) {
            if (!flame.classList.contains('blowing')) {
                flame.classList.add('blowing');
                emitParticles();

                blowDetectedTimer = setTimeout(extinguishFlame, SUSTAINED_BLOW_DURATION);
            }
        } else {
            if (flame.classList.contains('blowing')) {
                flame.classList.remove('blowing');
                stopEmittingParticles();
                clearTimeout(blowDetectedTimer);
            }
        }

        requestAnimationFrame(analyze);
    }

    analyze();
}

// ============================
//       EXTINGUISH FLAME
// ============================
function extinguishFlame() {
    if (isExtinguished) return;

    flame.classList.remove('blowing');
    flame.classList.add('extinguished');
    isExtinguished = true;

    stopEmittingParticles();

    // Pesan lilin padam
    message.classList.remove('hidden');
    message.textContent = "Hore! Lilinnya padam! 🎉";

    // Putar musik
    const birthdaySong = document.getElementById('birthdaySong');
    birthdaySong.play().catch((err) => console.warn("Autoplay prevented:", err));

    // Animasi asap
    smokePuffElement.style.opacity = 1;
    smokePuffElement.style.animation = 'smoke-rise 1s forwards ease-out';

    // 👉 Tampilkan tombol hadiah
    showGiftButton();

    micSource?.disconnect();
    analyser?.disconnect();
    audioContext?.close();
}

// ============================
//       SHOW GIFT BUTTON
// ============================
function showGiftButton() {
    const btn = document.createElement('a');
    btn.className = "gift-button";
    btn.href = "https://frisy-a.github.io/19November/flower.html";
    btn.innerHTML = "🎁 Buka Hadiah";

    // Tambahkan animasi fade-in
    btn.style.opacity = "0";
    btn.style.transition = "opacity 0.8s ease";
    
    giftButtonContainer.appendChild(btn);

    setTimeout(() => {
        btn.style.opacity = "1";
    }, 100);
}

window.onload = initMic;
