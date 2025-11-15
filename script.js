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
    <style>
/* --- Container --- */
.gift-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    cursor: pointer;
}

/* --- Kotak Kado --- */
.gift-box {
    position: relative;
    width: 120px;
    height: 120px;
    background: linear-gradient(145deg, #ff3d85, #ff77a9);
    border-radius: 10px;
    box-shadow: 
        0 10px 20px rgba(255, 50, 120, 0.4),
        inset 0 0 10px rgba(255, 255, 255, 0.4);
    transform-style: preserve-3d;
    transition: transform 0.4s ease;
    animation: bounce 2s infinite ease-in-out;
}

/* --- Tutup Kado --- */
.gift-lid {
    position: absolute;
    top: -25px;
    left: 0;
    width: 120px;
    height: 40px;
    background: linear-gradient(145deg, #ff5c9b, #ff8fb9);
    border-radius: 8px;
    box-shadow: 
        0 8px 15px rgba(255, 70, 140, 0.35),
        inset 0 0 10px rgba(255, 255, 255, 0.4);
    transition: transform 0.4s ease;
    transform-origin: bottom center;
}

/* --- Pita Horizontal --- */
.ribbon-horizontal {
    position: absolute;
    top: 45px;
    left: 0;
    width: 100%;
    height: 20px;
    background: #ffb4d1;
}

/* --- Pita Vertikal --- */
.ribbon-vertical {
    position: absolute;
    left: 50px;
    top: 0;
    width: 20px;
    height: 100%;
    background: #ffb4d1;
}

/* --- Animasi bergetar halus --- */
@keyframes bounce {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
}

/* --- Hover: tutup membuka dan kotak berputar 3D --- */
.gift-container:hover .gift-box {
    transform: rotateX(20deg) rotateY(15deg) scale(1.05);
}

.gift-container:hover .gift-lid {
    transform: rotateX(25deg);
}

/* --- Teks ajakan --- */
.gift-text {
    text-align: center;
    margin-top: 15px;
    font-size: 20px;
    color: #ff3d85;
    font-weight: bold;
    animation: glow 1.5s infinite;
}

@keyframes glow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}
</style>

<div class="gift-container" 
     onclick="window.location.href='https://frisy-a.github.io/19November/flower.html'">
    
    <div class="gift-box">
        <div class="gift-lid"></div>
        <div class="ribbon-horizontal"></div>
        <div class="ribbon-vertical"></div>
    </div>
</div>

<div class="gift-text">🎁 Klik untuk membuka hadiah 🎁</div>
}
 
    // message.textContent = "SELAMAT";
   // {
   // var a = document.createElement('a');
    //var linkText = document.createTextNode("Selamat lilinnya sudah padam! \nBuka Hadiahnya Di Sini");
    //document.style.color = "red";
   // a.appendChild(linkText);
   // a.title = " Selamat lilinnya sudah padam! \nBuka Hadiahnya Di Sini" // = style="color:white;background-color: orange;">Download</a>;
   // a.href = "https://frisy-a.github.io/19November/flower.html"  //style="color:white;background-color: orange;">Download</a>
   // document.body.appendChild(a);
   // }
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



































