let blowCount = 0;
const flame = document.getElementById('flame');
const message = document.getElementById('wishMessage');
const micStatus = document.getElementById('micStatus');
const fireParticlesContainer = document.getElementById('fireParticles');
const smokePuffElement = document.getElementById('smokePuff'); // Dapatkan elemen asap

let audioContext;
let analyser;
let micSource;
let isExtinguished = false;
let blowDetectedTimer; // Untuk melacak durasi tiupan
const BLOW_THRESHOLD_VOLUME = 90; // Volume minimum untuk dianggap tiupan
const SUSTAINED_BLOW_DURATION = 700; // Durasi tiupan (ms) agar api padam
const PARTICLE_EMIT_INTERVAL = 55; // Interval emisi partikel saat ditiup (ms)
let particleInterval; // Variabel untuk menyimpan interval emisi partikel

async function initMic() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStatus.textContent = "🎤 Microphone aktif. Tiup Lilinya sampai padam!!!";
        detectBlow(stream);
    } catch (err) {
        micStatus.textContent = "🚫 Microphone access denied. Please allow microphone access to blow the candle.";
        console.error("Error accessing microphone:", err);
    }
}

function createFireParticle() {
    const particle = document.createElement('div');
    particle.classList.add('fire-particle');
    // Posisi awal partikel di sekitar dasar api
    const startX = Math.random() * 10 - 5; // -5 to 5
    const startY = Math.random() * 5; // 0 to 5
    particle.style.left = `${50 + startX / 15 * 100}%`; // Konversi ke % relatif
    particle.style.top = `${-15 + startY}px`;
    particle.style.width = `${Math.random() * 5 + 3}px`;
    particle.style.height = `${Math.random() * 8 + 5}px`;

    // Arah "terbang" partikel saat ditiup
    const dx = (Math.random() - 0.5) * 60; // -30 to 30px horizontal displacement
    const dy = - (Math.random() * 40 + 30); // -30 to -70px vertical displacement
    particle.style.setProperty('--dx', `${dx}px`);
    particle.style.setProperty('--dy', `${dy}px`);

    fireParticlesContainer.appendChild(particle);

    // Hapus partikel setelah animasinya selesai
    particle.addEventListener('animationend', () => {
        particle.remove();
    });
}

function emitParticles() {
    // Stop any existing interval before starting a new one
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
    analyser.fftSize = 256; // Ukuran FFT yang lebih kecil untuk respons lebih cepat
    analyser.smoothingTimeConstant = 0.7; // Agak lebih responsif

    micSource.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function analyze() {
        if (isExtinguished) {
            // Pastikan untuk memutuskan semua koneksi audio jika lilin padam
            if (micSource) micSource.disconnect();
            if (analyser) analyser.disconnect();
            if (audioContext) audioContext.close();
            return;
        }

        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;

        if (volume > BLOW_THRESHOLD_VOLUME) {
            // Tiupan terdeteksi
            if (!flame.classList.contains('blowing')) {
                flame.classList.add('blowing'); // Aktifkan animasi "tertiup"
                emitParticles(); // Mulai memancarkan partikel
                // Mulai timer untuk memadamkan api jika tiupan berlanjut
                blowDetectedTimer = setTimeout(() => {
                    extinguishFlame();
                }, SUSTAINED_BLOW_DURATION);
            }
        } else {
            // Tidak ada tiupan atau tiupan berhenti
            if (flame.classList.contains('blowing')) {
                flame.classList.remove('blowing'); // Nonaktifkan animasi "tertiup"
                stopEmittingParticles(); // Hentikan emisi partikel
                clearTimeout(blowDetectedTimer); // Hapus timer pemadaman
            }
        }

        requestAnimationFrame(analyze);
    }

    analyze();
}

function extinguishFlame() {
    if (isExtinguished) return; // Mencegah pemadaman ganda

    flame.classList.remove('blowing'); // Pastikan animasi blowing dihapus
    flame.classList.add('extinguished'); // Aktifkan kelas padam
    isExtinguished = true;

    stopEmittingParticles(); // Hentikan partikel sepenuhnya

    // Tampilkan pesan
    message.classList.remove('hidden');
    
 // Buat elemen tombol
// ====== INJECT CSS ======
(function() {
    const css = `
    .cute-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: popupFadeIn 0.4s ease-out;
    }

    @keyframes popupFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .popup-box {
        background: #ffffff;
        padding: 25px 30px;
        width: 330px;
        max-width: 90%;
        border-radius: 20px;
        text-align: center;
        position: relative;
        box-shadow: 0 0 18px rgba(255, 125, 170, 0.4);
        animation: popScale 0.4s ease;
    }

    @keyframes popScale {
        0% { transform: scale(0.6); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }

    .popup-emoji {
        font-size: 30px;
        margin-bottom: 10px;
    }

    .popup-text {
        font-size: 15px;
        color: #555;
        margin-bottom: 20px;
        line-height: 1.5;
        animation: fadeParagraph 0.5s ease;
    }

    @keyframes fadeParagraph {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .popup-next-btn,
    .popup-final-btn {
        background: #ff7fbf;
        border: none;
        padding: 10px 18px;
        border-radius: 12px;
        font-size: 15px;
        color: white;
        cursor: pointer;
        transition: 0.2s;
        box-shadow: 0 3px 10px rgba(255, 120, 170, 0.4);
    }

    .popup-next-btn:hover,
    .popup-final-btn:hover {
        background: #ff5fae;
        transform: scale(1.05);
    }

    .cute-popup::before,
    .cute-popup::after {
        content: "💗";
        position: absolute;
        font-size: 22px;
        animation: floatHearts 4s infinite linear;
        opacity: 0.8;
    }

    .cute-popup::before {
        left: 25%;
        animation-delay: 0s;
    }
    .cute-popup::after {
        right: 25%;
        animation-delay: 2s;
    }

    @keyframes floatHearts {
        0% { transform: translateY(20px); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translateY(-220px); opacity: 0; }
    }

    .gift-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #ff89c7;
        color: white;
        padding: 12px 20px;
        text-decoration: none;
        font-size: 15px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(255, 120, 170, 0.4);
        transition: 0.2s;
    }

    .gift-button:hover {
        background: #ff6bb8;
        transform: scale(1.07);
    }

    .gift-emoji {
        font-size: 18px;
    }
    `;

    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
})();


// ====== GIFT BUTTON ======
const a = document.createElement('a');
a.className = "gift-button";
a.href = "https://frisy-a.github.io/19November/flower.html";
a.title = "Selamat lilinnya sudah padam! Buka hadiahnya di sini";
a.innerHTML = `
    <span class="gift-emoji">🎁</span>
    Buka Hadiah
`;

a.addEventListener("click", function (e) {
    e.preventDefault();
    showCutePopup(a.href);
});

document.body.appendChild(a);


// ===== POPUP FUNCTION =====
function showCutePopup(link) {
    if (document.querySelector('.cute-popup')) return;

    const popup = document.createElement("div");
    popup.className = "cute-popup";

    popup.innerHTML = `
        <div class="popup-box">
            <div class="popup-emoji">✨🎁✨</div>
            <div class="popup-text"></div>
            <button class="popup-next-btn">Lanjut 🩷</button>
            <button class="popup-final-btn" style="display:none;">Buka Hadiah 🎁</button>
        </div>
    `;

    document.body.appendChild(popup);

    const textContainer = popup.querySelector(".popup-text");
    const nextBtn = popup.querySelector(".popup-next-btn");
    const finalBtn = popup.querySelector(".popup-final-btn");

    const paragraphs = [
        "Yeayyy!! Sekali lagi selamat ulang tahun ya Marr..",
        "Susah nggak niup Lilinya? ☺️☺️☺️",
        "Maaf yaa menyusahkanmu 🥹🥹🥹",
        "Hmmm.. Semoga kamu selalu baik-baik saja yaa 💗💗💗",
        "I hope you’re always happy.. surrounded by people who cherish you, support you, and love you endlessly just the way you deserve 😇.",
        "May Lord Jesus always be with you, watching over you, guiding your steps, and filling your heart with peace. Jesus bless you 😇",
        "Semoga bikin kamu senyum yaa 💞🥰"
    ];

    let index = 0;

    textContainer.innerHTML = paragraphs[index];

    nextBtn.addEventListener("click", function () {
        index++;

        if (index < paragraphs.length) {
            textContainer.style.animation = "none";
            void textContainer.offsetWidth;
            textContainer.style.animation = "";
            textContainer.innerHTML = paragraphs[index];
        } else {
            nextBtn.style.display = "none";
            finalBtn.style.display = "block";
        }
    });

    finalBtn.addEventListener("click", function () {
        window.location.href = link;
    });
}


      // Putar lagu ulang tahun
    const birthdaySong = document.getElementById('birthdaySong');
    birthdaySong.play().catch((error) => {
        console.warn("Autoplay prevented:", error);
    });

    // Animasi asap
    smokePuffElement.style.opacity = 1;
    smokePuffElement.style.animation = 'smoke-rise 1s forwards ease-out';

    // Putuskan koneksi mikrofon setelah padam
    if (micSource) micSource.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext) audioContext.close();
}



window.onload = initMic;


















































