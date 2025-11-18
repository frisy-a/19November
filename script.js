//--------------------------------------
// DETEKSI TIUPAN FIXED
//--------------------------------------
let flame = document.getElementById("flame");
let message = document.getElementById("wishMessage");
let micStatus = document.getElementById("micStatus");
let smokePuff = document.getElementById("smokePuff");

let audioContext, analyser, dataArray;
let candleBlown = false;

async function startMic() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const micSource = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;

        micSource.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        micStatus.innerText = "🎤 Mic Aktif - Tiup untuk memadamkan";
        detectBlow();
    } catch (err) {
        micStatus.innerText = "❌ Akses mic ditolak!";
        console.error(err);
    }
}

function detectBlow() {
    function loop() {
        analyser.getByteFrequencyData(dataArray);
        let volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        // Efek api goyang
        flame.style.opacity = Math.max(0.2, 1 - volume / 90);

        // PADAM jika volume besar
        if (volume > 50 && !candleBlown) {
            extinguishCandle();
            candleBlown = true;
        }

        requestAnimationFrame(loop);
    }
    loop();
}

function extinguishCandle() {
    flame.style.opacity = 0;

    smokePuff.classList.add("show");

    message.innerText = "Yeay! Lilinnya sudah padam 🎉";
    micStatus.innerText = "Mic dimatikan";

    // Tampilkan tombol hadiah
    showGiftButton();
}

//------------------------------------------------------
// TOMBOL HADIAH + POPUP
//------------------------------------------------------
function showGiftButton() {
    const btn = document.createElement("button");
    btn.id = "openPopupBtn";
    btn.innerText = "🎁 Lihat Hadiah";

    btn.style.cssText = `
        display:block;
        margin:20px auto;
        padding:12px 22px;
        background:#ff4d6d;
        color:white;
        border:none;
        border-radius:10px;
        font-size:18px;
        cursor:pointer;
        box-shadow:0 4px 8px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
        openPopup();
    });
}

//------------------------------------------------------
// POPUP dengan text NEXT per paragraf + musik
//------------------------------------------------------
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const nextButton = document.getElementById("nextButton");
const popupMusic = document.getElementById("popupMusic");

// Isi paragraf
const paragraphs = [
    "Selamat yaa! Kamu sudah berhasil meniup lilinnya 🎉",
    "Aku sudah menyiapkan sesuatu yang spesial untukmu.",
    "Semoga hadiah kecil ini bisa membuat harimu lebih indah ✨",
    "Sekarang… siap untuk membuka hadiahnya? 💐"
];

let currentIndex = 0;

function openPopup() {
    popup.style.display = "flex";
    popupText.innerText = paragraphs[currentIndex];

    // Putar musik popup
    popupMusic.play().catch(err => console.log("Autoplay diblok:", err));

    nextButton.onclick = nextParagraph;
}

function nextParagraph() {
    currentIndex++;

    if (currentIndex < paragraphs.length) {
        popupText.innerText = paragraphs[currentIndex];
    } else {
        // Ubah tombol menjadi tombol buka hadiah
        nextButton.innerText = "🎁 Buka Hadiah";
        nextButton.onclick = () => {
            window.location.href = "https://frisy-a.github.io/19November/flower.html";
        };
    }
}

// Mulai mic otomatis ketika halaman load
window.onload = startMic;
