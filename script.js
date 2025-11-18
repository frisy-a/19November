//--------------------------------------
// TIUP LILIN
//--------------------------------------
let blowCount = 0;
const flame = document.getElementById('flame');
const message = document.getElementById('wishMessage');
const micStatus = document.getElementById('micStatus');
const fireParticlesContainer = document.getElementById('fireParticles');
const smokePuffElement = document.getElementById('smokePuff');

let audioContext;
let analyser;
let micSource;

async function startMic() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    micSource = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    micSource.connect(analyser);
    micStatus.innerText = "Mic aktif 🎤";

    detectBlow();
}

function detectBlow() {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function analyze() {
        analyser.getByteFrequencyData(dataArray);
        let volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

        if (volume > 80) {
            blowCount++;
            flame.style.opacity = 0.4;

            if (blowCount > 4) {
                putOutCandle();
                return;
            }
        } else {
            flame.style.opacity = 1;
        }

        requestAnimationFrame(analyze);
    }
    analyze();
}

function putOutCandle() {
    flame.style.opacity = 0;
    smokePuffElement.classList.add("show");

    message.innerText = "Lilin padam! 🎉";
    micStatus.innerText = "Mic dimatikan.";

    showGiftButton();
}

//--------------------------------------
// TOMBOL HADIAH
//--------------------------------------
function showGiftButton() {
    const giftBtn = document.createElement("button");
    giftBtn.id = "giftBtn";
    giftBtn.innerText = "🎁 Lihat Hadiah";

    giftBtn.style.cssText = `
        padding: 12px 20px;
        margin-top: 20px;
        background: #ff4f7b;
        color: white;
        border: none;
        font-size: 18px;
        border-radius: 12px;
        cursor: pointer;
    `;

    giftBtn.onclick = () => {
        document.getElementById("openPopupBtn").style.display = "block";
        giftBtn.style.display = "none";
    };

    document.body.appendChild(giftBtn);
}

//--------------------------------------
// POPUP SYSTEM
//--------------------------------------
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const popupNext = document.getElementById("popupNext");
const popupClose = document.getElementById("popupClose");
const openPopupBtn = document.getElementById("openPopupBtn");

openPopupBtn.onclick = openPopup;

// Musik
const popupMusic = new Audio("music.mp3"); // ganti dengan musikmu
popupMusic.loop = true;

const paragraphs = [
    "Hai kamu! Terima kasih sudah meniup lilinnya.",
    "Ada sesuatu yang ingin aku sampaikan buat kamu.",
    "Semoga hari-harimu selalu dipenuhi kebahagiaan.",
    "Dan ini… hadiah spesial untukmu ❤️"
];

let currentParagraph = 0;

function openPopup() {
    popup.style.display = "flex";
    popupMusic.play();
    popupText.innerText = paragraphs[currentParagraph];
}

popupNext.onclick = () => {
    currentParagraph++;

    if (currentParagraph < paragraphs.length) {
        popupText.innerText = paragraphs[currentParagraph];
    } else {
        // tombol terakhir menuju link hadiah
        window.location.href = "https://frisy-a.github.io/19November/flower.html";
    }
};

popupClose.onclick = () => {
    popup.style.display = "none";
    popupMusic.pause();
};

//--------------------------------------
// START
//--------------------------------------
startMic();
