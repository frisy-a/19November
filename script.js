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
    particleInterval = setInt
