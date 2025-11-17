// ========================================================
// =============== BLOW TO EXTINGUISH SYSTEM ===============
// ========================================================

let blowCount = 0;
const flame = document.getElementById('flame');
const message = document.getElementById('wishMessage');
const micStatus = document.getElementById('micStatus');
const fireParticlesContainer = document.getElementById('fireParticles');
const smokePuffElement = document.getElementById('smokePuff');

let audioContext, analyser, micSource;
let isExtinguished = false;
let blowDetectedTimer;
let particleInterval;

const BLOW_THRESHOLD_VOLUME = 90;
const SUSTAINED_BLOW_DURATION = 700;
const PARTICLE_EMIT_INTERVAL = 55;

async function initMic() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStatus.textContent = "🎤 Microphone aktif! Tiup lilinnya!";
        detectBlow(stream);
    } catch (err) {
        micStatus.textContent = "🚫 Izin microphone ditolak.";
        console.error(err);
    }
}

function createFireParticle() {
    const p = document.createElement('div');
    p.classList.add('fire-particle');

    const startX = Math.random() * 10 - 5;
    const startY = Math.random() * 5;

    p.style.left = `${50 + (startX / 15) * 100}%`;
    p.style.top = `${-15 + startY}px`;
    p.style.width = `${Math.random() * 5 + 3}px`;
    p.style.height = `${Math.random() * 8 + 5}px`;

    const dx = (Math.random() - 0.5) * 60;
    const dy = -(Math.random() * 40 + 30);

    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);

    fireParticlesContainer.appendChild(p);

    p.addEventListener('animationend', () => p.remove());
}

function emitParticles() {
    clearInterval(particleInterval);
    particleInterval = setInterval(createFireParticle, PARTICLE_EMIT_INTERVAL);
}

function stopEmittingParticles() {
    clearInterval(particleInterval);
}

function detectBlow(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    micSource = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;

    micSource.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    function analyze() {
        if (isExtinguished) return;

        analyser.getByteFrequencyData(data);
        const volume = data.reduce((a, b) => a + b, 0) / data.length;

        if (volume > BLOW_THRESHOLD_VOLUME) {
            if (!flame.classList.contains('blowing')) {
                flame.classList.add('blowing');
                emitParticles();
                blowDetectedTimer = setTimeout(extinguishFlame, SUSTAINED_BLOW_DURATION);
            }
        } else {
            flame.classList.remove('blowing');
            stopEmittingParticles();
            clearTimeout(blowDetectedTimer);
        }

        requestAnimationFrame(analyze);
    }

    analyze();
}

// ========================================================
// ===================== EXTINGUISH =======================
// ========================================================

function extinguishFlame() {
    if (isExtinguished) return;
    isExtinguished = true;

    flame.classList.remove('blowing');
    flame.classList.add('extinguished');

    stopEmittingParticles();

    const birthdaySong = document.getElementById('birthdaySong');
    birthdaySong.play().catch(() => {});

    smokePuffElement.style.opacity = 1;
    smokePuffElement.style.animation = 'smoke-rise 1s forwards ease-out';

    if (micSource) micSource.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext && audioContext.state !== "closed") audioContext.close();

    // Buka POPUP
    openPopup();
}

window.onload = initMic;


// ========================================================
// =================== POPUP SYSTEM =======================
// ========================================================

// Konten paragraf yang ingin ditampilkan
const popupTexts = [
    "Selamat ulang tahun! 🥳",
    "Semoga hari ini membawa banyak kebahagiaan untukmu.",
    "Terima kasih sudah menjadi pribadi yang hebat dan baik.",
    "Sekarang waktunya buka hadiah 🎁"
];

let currentParagraph = 0;

const popup = document.getElementById('popupBox');
const popupText = document.getElementById('popupText');
const nextBtn = document.getElementById('nextParagraph');
const giftBtn = document.getElementById('giftButton');

// Tampilkan popup & paragraf pertama
function openPopup() {
    popup.classList.remove('hidden');
    currentParagraph = 0;
    popupText.textContent = popupTexts[currentParagraph];
    nextBtn.style.display = "block";
    giftBtn.style.display = "none";
}

// Klik tombol Next paragraf
nextBtn.addEventListener('click', () => {
    currentParagraph++;

    if (currentParagraph < popupTexts.length - 1) {
        popupText.textContent = popupTexts[currentParagraph];
    } 
    else {
        popupText.textContent = popupTexts[currentParagraph];
        nextBtn.style.display = "none";
        giftBtn.style.display = "flex"; // Tampilkan tombol hadiah
    }
});

// Tombol hadiah → link kamu
giftBtn.addEventListener('click', () => {
    window.location.href = "https://frisy-a.github.io/19November/flower.html";
});
