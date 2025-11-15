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
        micStatus.textContent = "🎤 Microphone aktif. Tiup Lilinya sampai padam sekarang!!!";
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
    
   {
    // Buat elemen tombol
    const a = document.createElement('a');
    a.className = "gift-button";
    a.href = "https://frisy-a.github.io/19November/flower.html";
    a.title = "Selamat lilinnya sudah padam! Buka hadiahnya di sini";
    a.innerHTML = `
        <span class="gift-emoji">🎁</span>
        Buka Hadiah
    `;

    // Cegah default click
    a.addEventListener("click", function (e) {
        e.preventDefault();
        showCutePopup(a.href);
    });

    document.body.appendChild(a);

    // --- Popup Lucu + Floating Hearts ---
    function showCutePopup(link) {
        const popup = document.createElement("div");
        popup.className = "cute-popup";

        popup.innerHTML = `
            <div class="popup-box">
                <div class="popup-emoji">✨🎁✨</div>
                <div class="popup-text">
                    Yeayy! Kamu berhasil memadamkan lilinnya! 🕯️💖<br>
                    Siap buka hadiahnya? 🎀
                </div>
                <button class="popup-btn">Awww OK 🩷</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Jalankan animasi hati melayang
        startFloatingHearts(popup);

        // Tombol OK
        popup.querySelector(".popup-btn").onclick = () => {
            popup.remove();
            window.location.href = link;
        };
    }

    // --- Membuat hati melayang ---
    function startFloatingHearts(container) {
        const interval = setInterval(() => {
            // Kalau popup sudah hilang, hentikan animasi
            if (!document.body.contains(container)) {
                clearInterval(interval);
                return;
            }

            const heart = document.createElement("div");
            heart.className = "floating-heart";
            heart.textContent = "💗";

            // Posisi acak secara horizontal
            heart.style.left = Math.random() * 80 + 10 + "%";

            // Ukuran acak (biar lebih hidup)
            const size = Math.random() * 20 + 20;
            heart.style.fontSize = size + "px";

            container.appendChild(heart);

            // Hapus setelah animasi selesai
            setTimeout(() => heart.remove(), 3000);
        }, 300); // setiap 0.3 detik bikin 1 hati
    }

    // Tambahkan style ke dokumen
    const style = document.createElement("style");
    style.innerHTML = `
        .gift-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #ff6699;
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: bold;
            text-decoration: none;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(255, 0, 100, 0.3);
            transition: 0.3s;
            gap: 10px;
        }
        .gift-button:hover {
            background: #ff3d85;
            transform: scale(1.07);
            box-shadow: 0 8px 20px rgba(255, 0, 130, 0.4);
        }
        .gift-emoji {
            font-size: 24px;
        }

        /* --- Popup Lucu --- */
        .cute-popup {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(255, 150, 180, 0.4);
            backdrop-filter: blur(3px);
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s ease;
            z-index: 9999;
            overflow: hidden;
        }
        .popup-box {
            background: #fff0f6;
            padding: 25px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 8px 20px rgba(255, 0, 150, 0.3);
            animation: popIn 0.35s ease;
            max-width: 300px;
            position: relative;
            z-index: 10;
        }
        .popup-emoji {
            font-size: 36px;
            margin-bottom: 10px;
        }
        .popup-text {
            font-size: 16px;
            color: #ff4f9a;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        .popup-btn {
            background: #ff72b6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.25s;
        }
        .popup-btn:hover {
            background: #ff4a9f;
            transform: scale(1.07);
        }

        /* --- Floating Hearts --- */
        .floating-heart {
            position: absolute;
            bottom: 20px;
            animation: rise 3s linear forwards;
            opacity: 0.9;
        }

        @keyframes rise {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-250px) scale(1.8); opacity: 0; }
        }

        /* Animasi popup */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes popIn {
            from { transform: scale(0.6); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
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












































