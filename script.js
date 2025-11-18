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
/*function showGiftButton() {
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
*/
//coba 1

/*
function showGiftButton() {
    // --- Buat CSS melalui JavaScript ---
    const style = document.createElement("style");
    style.textContent = `
        .gift-button {
            display: inline-block;
            padding: 14px 26px;
            background: linear-gradient(135deg, #ff4d79, #ff7aa8);
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: none;
            border-radius: 12px;
            box-shadow: 0 6px 15px rgba(255, 105, 135, 0.4);
            transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.8s ease;
            opacity: 0;

            animation: softGlow 2.5s infinite alternate ease-in-out,
                       floating 3s ease-in-out infinite;
        }

        .gift-button:hover {
            transform: scale(1.09);
            box-shadow: 0 12px 25px rgba(255, 105, 135, 0.6);
        }

        @keyframes softGlow {
            0% { box-shadow: 0 0 10px rgba(255, 120, 150, 0.5); }
            100% { box-shadow: 0 0 20px rgba(255, 120, 150, 0.9); }
        }

        @keyframes floating {
            0%   { transform: translateY(0); }
            50%  { transform: translateY(-6px); }
            100% { transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    // --- Cari/siapkan container ---
    let giftButtonContainer = document.getElementById("giftButtonContainer");
    if (!giftButtonContainer) {
        giftButtonContainer = document.createElement("div");
        giftButtonContainer.id = "giftButtonContainer";
        document.body.appendChild(giftButtonContainer);
    }

    // --- Buat tombol ---
    const btn = document.createElement("a");
    btn.className = "gift-button";
    btn.href = "https://frisy-a.github.io/19November/flower.html";
    btn.textContent = "🎁 Buka Hadiah";
    btn.style.opacity = "0";

    giftButtonContainer.appendChild(btn);

    // --- Fade-in ---
    setTimeout(() => {
        btn.style.opacity = "1";
    }, 100);
}
*/
// coba 2
/*
function showGiftButton() {

    const style = document.createElement("style");
    style.textContent = `
        .gift-button {
            display: inline-block;
            padding: 14px 26px;
            background: linear-gradient(135deg, #ff4d79, #ff7aa8);
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: none;
            border-radius: 12px;
            box-shadow: 0 6px 15px rgba(255, 105, 135, 0.4);
            transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.8s ease;
            opacity: 0;
            cursor: pointer;

            animation: softGlow 2.5s infinite alternate ease-in-out,
                       floating 3s ease-in-out infinite;
        }

        .gift-button:hover {
            transform: scale(1.09);
            box-shadow: 0 12px 25px rgba(255, 105, 135, 0.6);
        }

        @keyframes softGlow {
            0% { box-shadow: 0 0 10px rgba(255, 120, 150, 0.5); }
            100% { box-shadow: 0 0 20px rgba(255, 120, 150, 0.9); }
        }

        @keyframes floating {
            0%   { transform: translateY(0); }
            50%  { transform: translateY(-6px); }
            100% { transform: translateY(0); }
        }

        /* POPUP */
  /*      .popup-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity .4s;
            pointer-events: none;
        }

        .popup-box {
            background: white;
            padding: 25px;
            border-radius: 14px;
            max-width: 320px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            transform: scale(0.8);
            transition: transform .4s ease;
            
            /* FIX: membuat teks terlihat 
            color: #333;
            font-size: 1rem;
        }

        .popup-box h3 {
            margin-top: 0;
            color: #ff4d79; /* warna judul 
        }

        .popup-bg.active {
            pointer-events: auto;
            opacity: 1;
        }

        .popup-bg.active .popup-box {
            transform: scale(1);
        }

        .close-btn {
            margin-top: 15px;
            padding: 8px 18px;
            background: #ff4d79;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            border: none;
        }
    `;
    document.head.appendChild(style);


    /* =========================
       SIAPKAN CONTAINER
    ========================== 
    let container = document.getElementById("giftButtonContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "giftButtonContainer";
        document.body.appendChild(container);
    }


    /* =========================
       BUAT TOMBOL
    ========================== 
    const btn = document.createElement("a");
    btn.className = "gift-button";
    btn.textContent = "🎁 Buka Hadiah";
    btn.style.opacity = "0";
    container.appendChild(btn);

    setTimeout(() => btn.style.opacity = "1", 100);


    /* =========================
       BUAT POPUP
    ========================== 
    const popupBg = document.createElement("div");
    popupBg.className = "popup-bg";

    const popupBox = document.createElement("div");
    popupBox.className = "popup-box";

    popupBox.innerHTML = `
        <h3>🎉 Selamat Ulang Tahun! 🎉</h3>
        <p>
            Semoga hari ini penuh kebahagiaan,<br>
            cinta, dan kejutan manis.<br><br>
            Terima kasih sudah menjadi pribadi yang luar biasa 💗
        </p>
    `;

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "Lanjutkan";
    popupBox.appendChild(closeBtn);

    popupBg.appendChild(popupBox);
    document.body.appendChild(popupBg);


    /* =========================
       EVENT CLICK
    ========================== 
    btn.addEventListener("click", () => {
        popupBg.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
        popupBg.classList.remove("active");

        setTimeout(() => {
            window.location.href = "https://frisy-a.github.io/19November/flower.html";
        }, 300);
    });
}
*/
//COBA3

function showGiftButton() {

    /* =========================
       TAMBAHKAN CSS
    ========================== */
    const style = document.createElement("style");
    style.textContent = `
        .gift-button {
            display: inline-block;
            padding: 14px 26px;
            background: linear-gradient(135deg, #ff4d79, #ff7aa8);
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: none;
            border-radius: 12px;
            box-shadow: 0 6px 15px rgba(255, 105, 135, 0.4);
            transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.8s ease;
            cursor: pointer;
            opacity: 0;
            animation: softGlow 2.5s infinite alternate ease-in-out,
                       floating 3s ease-in-out infinite;
        }

        .gift-button:hover {
            transform: scale(1.09);
            box-shadow: 0 12px 25px rgba(255, 105, 135, 0.6);
        }

        @keyframes softGlow {
            0% { box-shadow: 0 0 10px rgba(255, 120, 150, 0.5); }
            100% { box-shadow: 0 0 20px rgba(255, 120, 150, 0.9); }
        }

        @keyframes floating {
            0%   { transform: translateY(0); }
            50%  { transform: translateY(-6px); }
            100% { transform: translateY(0); }
        }

        /* Popup 
        .popup-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.65);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity .4s ease;
        }

        .popup-bg.active {
            opacity: 1;
            pointer-events: auto;
        }

        .popup-box {
            background: white;
            padding: 25px;
            border-radius: 14px;
            width: 300px;
            text-align: center;
            color: #333;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            transform: scale(0.8);
            transition: transform .4s ease;
        }

        .popup-bg.active .popup-box {
            transform: scale(1);
        }

        .message-text {
            min-height: 120px;
            white-space: pre-line;
            font-size: 1rem;
            line-height: 1.4em;
        }

        .next-btn {
            margin-top: 15px;
            padding: 10px 20px;
            background: #ff4d79;
            border: none;
            color: white;
            cursor: pointer;
            border-radius: 8px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);


    /* =========================
       BUAT CONTAINER
    ========================== */
    let container = document.getElementById("giftButtonContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "giftButtonContainer";
        document.body.appendChild(container);
    }


    /* =========================
       TOMBOL HADIAH
    ========================== */
    const btn = document.createElement("a");
    btn.className = "gift-button";
    btn.textContent = "🎁 Buka Hadiah";
    container.appendChild(btn);

    setTimeout(() => btn.style.opacity = "1", 100);


    /* =========================
       POPUP ELEMENTS
    ========================== */
    const popupBg = document.createElement("div");
    popupBg.className = "popup-bg";

    const popupBox = document.createElement("div");
    popupBox.className = "popup-box";

    const textBox = document.createElement("div");
    textBox.className = "message-text";
    textBox.textContent = "";

    const nextBtn = document.createElement("button");
    nextBtn.className = "next-btn";
    nextBtn.textContent = "Next";

    popupBox.appendChild(textBox);
    popupBox.appendChild(nextBtn);
    popupBg.appendChild(popupBox);
    document.body.appendChild(popupBg);


    /* =========================
       CUSTOM MUSIC DI SINI
    ========================== */
    const audio = document.createElement("audio");
    audio.volume = 0.7;

    const source = document.createElement("source");
    source.src = "popup.mp3";   // ganti sesuai nama file MP3 lokalmu
    source.type = "audio/mpeg";

    audio.appendChild(source);
    document.body.appendChild(audio);


    /* =========================
       TEXT PER KLIK
    ========================== */

    // *** EDIT TEKSNYA DI SINI ***
    const messages = [
        "🎉 Selamat Ulang Tahun! 🎉",
        "Hari ini spesial banget, sama kayak kamu.",
        "Semoga semua mimpi indahmu berjalan satu per satu.",
        "Terima kasih sudah jadi orang baik di hidup banyak orang.",
        "Dan… semoga hari ini membawa senyum besar untukmu 💗",
        "Sekarang saatnya buka hadiahmu!"
    ];

    let idx = 0;

    function showNextText() {
        if (idx < messages.length) {
            textBox.textContent = messages[idx];
            idx++;
        } else {
            // sudah habis → redirect
            window.location.href = "https://frisy-a.github.io/19November/flower.html";
        }
    }


    /* =========================
       EVENT HANDLER
    ========================== */

    // buka popup
    btn.addEventListener("click", () => {
        popupBg.classList.add("active");
        audio.play().catch(()=>{});   // musik mulai
        idx = 0;
        showNextText();               // tampilkan text pertama
    });

    // tombol next → tampilkan kalimat berikutnya
    nextBtn.addEventListener("click", () => {
        showNextText();
    });
}



/*
function showGiftButton() {

    /* =========================
       TAMBAHKAN CSS
    ========================== 
    const style = document.createElement("style");
    style.textContent = `
        .gift-button {
            display: inline-block;
            padding: 14px 26px;
            background: linear-gradient(135deg, #ff4d79, #ff7aa8);
            color: white;
            font-size: 1.2rem;
            font-weight: bold;
            text-decoration: none;
            border-radius: 12px;
            box-shadow: 0 6px 15px rgba(255, 105, 135, 0.4);
            transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.8s ease;
            cursor: pointer;
            opacity: 0;
            animation: softGlow 2.5s infinite alternate ease-in-out,
                       floating 3s ease-in-out infinite;
        }

        .gift-button:hover {
            transform: scale(1.09);
            box-shadow: 0 12px 25px rgba(255, 105, 135, 0.6);
        }

        @keyframes softGlow {
            0% { box-shadow: 0 0 10px rgba(255, 120, 150, 0.5); }
            100% { box-shadow: 0 0 20px rgba(255, 120, 150, 0.9); }
        }

        @keyframes floating {
            0%   { transform: translateY(0); }
            50%  { transform: translateY(-6px); }
            100% { transform: translateY(0); }
        }

        .popup-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.65);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity .4s ease;
            z-index: 1000;
        }

        .popup-bg.active {
            opacity: 1;
            pointer-events: auto;
        }

        .popup-box {
            background: white;
            padding: 25px;
            border-radius: 14px;
            width: 320px;
            text-align: center;
            color: #333;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            transform: scale(0.8);
            transition: transform .4s ease;
            position: relative;
            overflow: hidden;
        }

        .popup-bg.active .popup-box {
            transform: scale(1);
        }

        .message-text {
            min-height: 120px;
            white-space: pre-line;
            font-size: 1rem;
            line-height: 1.4em;
            font-family: "Courier New", monospace;
        }

        .next-btn {
            margin-top: 15px;
            padding: 10px 20px;
            background: linear-gradient(45deg, #ff4d79, #ff7aa8);
            border: none;
            color: white;
            cursor: pointer;
            border-radius: 8px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(255, 77, 121, 0.5);
            animation: glowBtn 2s infinite alternate;
        }

        @keyframes glowBtn {
            0% { box-shadow: 0 4px 12px rgba(255, 77, 121, 0.5); transform: scale(1);}
            50% { box-shadow: 0 6px 20px rgba(255, 120, 150, 0.7); transform: scale(1.05);}
            100% { box-shadow: 0 4px 12px rgba(255, 77, 121, 0.5); transform: scale(1);}
        }

        .confetti {
            position: absolute;
            width: 8px;
            height: 8px;
            background: #ff4d79;
            top: 0;
            left: 50%;
            opacity: 0.9;
            border-radius: 50%;
            pointer-events: none;
            animation: confettiFall 2s linear forwards;
        }

        @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg);}
            100% { transform: translateY(300px) rotate(360deg); opacity:0;}
        }
    `;
    document.head.appendChild(style);

    /* =========================
       CONTAINER
    ========================== 
    let container = document.getElementById("giftButtonContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "giftButtonContainer";
        document.body.appendChild(container);
    }

    /* =========================
       TOMBOL HADIAH
    ========================== 
    const btn = document.createElement("a");
    btn.className = "gift-button";
    btn.textContent = "🎁 Buka Hadiah";
    container.appendChild(btn);

    setTimeout(() => btn.style.opacity = "1", 100);

    /* =========================
       POPUP
    ========================== 
    const popupBg = document.createElement("div");
    popupBg.className = "popup-bg";

    const popupBox = document.createElement("div");
    popupBox.className = "popup-box";

    const textBox = document.createElement("div");
    textBox.className = "message-text";

    const nextBtn = document.createElement("button");
    nextBtn.className = "next-btn";
    nextBtn.textContent = "Next";

    popupBox.appendChild(textBox);
    popupBox.appendChild(nextBtn);
    popupBg.appendChild(popupBox);
    document.body.appendChild(popupBg);

    /* =========================
       AUDIO LOKAL & TYPING SOUND
    ========================== 
    const audio = document.createElement("audio");
    audio.volume = 0.7;
    const source = document.createElement("source");
    source.src = "popup.mp3"; // ganti dengan MP3 lokalmu
    source.type = "audio/mpeg";
    audio.appendChild(source);
    document.body.appendChild(audio);

    //suara huruf
    const typeSound = document.createElement("audio");
    const typeSource = document.createElement("source");
    typeSource.src = "typing.mp3"; // suara ketik pendek
    typeSource.type = "audio/mpeg";
    typeSound.appendChild(typeSource);
    document.body.appendChild(typeSound);

    /* =========================
       TEKS
    ========================== 
    const messages = [
        "🎉 Selamat Ulang Tahun! 🎉",
        "Hari ini hari spesialmu.",
        "Semoga kamu selalu dikelilingi kebahagiaan.",
        "Kamu adalah orang yang luar biasa.",
        "Terima kasih sudah ada 💗",
        "Sekarang… waktunya membuka hadiahmu!"
    ];

    let index = 0;

    /* =========================
       FUNGSI TYPING DENGAN SUARA
    ========================== 
    function typeText(text, callback) {
        textBox.textContent = "";
        let i = 0;
        const interval = setInterval(() => {
            textBox.textContent += text.charAt(i);
            // mainkan suara ketik
            typeSound.currentTime = 0;
            typeSound.play().catch(()=>{});
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (callback) callback();

                // jika teks terakhir → confetti
                if (index === messages.length) createConfetti();
            }
        }, 50);
    }

    function showNext() {
        if (index < messages.length) {
            typeText(messages[index]);
            index++;
        } else {
            window.location.href = "https://frisy-a.github.io/19November/flower.html";
        }
    }

    /* =========================
       CONFETTI
    ========================== 
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const c = document.createElement("div");
            c.className = "confetti";
            c.style.left = Math.random() * 100 + "%";
            c.style.backgroundColor = `hsl(${Math.random()*360}, 80%, 60%)`;
            popupBox.appendChild(c);
            setTimeout(() => c.remove(), 2500);
        }
    }

    /* =========================
       EVENT
    ========================== 
    btn.addEventListener("click", () => {
        popupBg.classList.add("active");
        index = 0;
        showNext();
        audio.play().catch(()=>{});
    });

    nextBtn.addEventListener("click", () => {
        showNext();
    });
}

*/
window.onload = initMic;















