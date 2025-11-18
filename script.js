// ============================
//   VARIABLE SETUP
// ============================

let blowCount = 0;
const flame = document.getElementById('flame');
const message = document.getElementById('wishMessage');
const micStatus = document.getElementById('micStatus');
const fireParticlesContainer = document.getElementById('fireParticles');
const smokePuffElement = document.getElementById('smokePuff');
const giftButtonContainer = document.getElementById('giftButtonContainer');

// Popup elements
const popup = document.getElementById("popupMessage");
const popupText = document.getElementById("popupText");
const popupNext = document.getElementById("popupNext");

let audioContext;
let analyser;
let micSource;
let isExtinguished = false;
let blowDetectedTimer;

const BLOW_THRESHOLD_VOLUME = 90;
const SUSTAINED_BLOW_DURATION = 700;
const PARTICLE_EMIT_INTERVAL = 55;
let particleInterval;

// Popup message list
const popupParagraphs = [
    "Halo! Terima kasih sudah meniup lilin ini 💖",
    "Semoga semua harapan kamu tercapai dan hari ini penuh kebahagiaan 🎂✨",
    "Ada sesuatu yang spesial aku siapin buat kamu...",
    "Klik tombol di bawah ini untuk membuka hadiahnya 🎁"
];

let currentPopupIndex = 0;

// ============================
//   INIT MIC
// ============================

async function initMic() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        micStatus.textContent = "🎤 Microphone aktif. Tiup untuk memadamkan!";
        detectBlow(stream);

    } catch (err) {
        micStatus.textContent = "🚫 Mic ditolak. Tidak bisa mendeteksi tiupan.";
        console.error("Mic Error:", err);
    }
}

// ============================
//   FIRE PARTICLES
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
//   DETECT BLOW
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
//   EXTINGUISH FLAME
// ============================

function extinguishFlame() {
    if (isExtinguished) return;

    flame.classList.remove('blowing');
    flame.classList.add('extinguished');
    isExtinguished = true;

    stopEmittingParticles();

    message.classList.remove('hidden');
    message.textContent = "Hore! Lilinnya padam! 🎉";

    // Asap
    smokePuffElement.style.opacity = 1;
    smokePuffElement.style.animation = 'smoke-rise 1s forwards ease-out';

    // Buka popup
    setTimeout(() => openPopup(), 800);

    // Tutup mic
    micSource?.disconnect();
    analyser?.disconnect();
    audioContext?.close();
}

// ============================
//   POPUP LOGIC
// ============================

function openPopup() {
    popup.style.display = "flex";
    popupText.textContent = popupParagraphs[0];

    // Putar musik popup
    const popupMusic = document.getElementById("popupMusic");
    popupMusic.play().catch(e => console.log("Autoplay blocked"));
}

popupNext.addEventListener("click", () => {
    currentPopupIndex++;

    if (currentPopupIndex < popupParagraphs.length - 1) {
        popupText.textContent = popupParagraphs[currentPopupIndex];
    } 
    else if (currentPopupIndex === popupParagraphs.length - 1) {
        popupText.textContent = popupParagraphs[currentPopupIndex];
        popupNext.textContent = "🎁 Buka Hadiah";
    }
    else {
        window.location.href = "https://frisy-a.github.io/19November/flower.html";
    }
});

window.onload = initMic;
