// DOM Elements
const proposalCard = document.getElementById('proposal-card');
const schedulerCard = document.getElementById('scheduler-card');
const successCard = document.getElementById('success-card');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const dateForm = document.getElementById('date-form');

// State Variables
let yesScale = 1.0;
const maxYesScale = window.innerWidth < 480 ? 1.6 : 2.5;
let noClickCount = 0;

// Escape messages for the No button (Emoji-free)
const messages = [
    "Emin misin?",
    "Bir daha düşün?",
    "Pişman olursun...",
    "Yemekler benden ama?",
    "Sadece bir şans ver?",
    "Lütfen?",
    "Söz, çok eğleneceğiz!",
    "Beni üzme lütfen...",
    "Yine mi Hayır?",
    "Tıklayamayacaksın ki!",
    "Bak son kararın mı?",
    "Kalbimi kırıyorsun...",
    "Belki bir kahve?",
    "Israr etsem?",
    "Bir şans daha?",
    "Hemen hayır deme!",
    "Gözlerini kapatıp bir daha seç?",
    "Lütfen evet de...",
    "Çok tatlıyız ama biz!",
    "Bence de evet!"
];

// Set min date of date picker to today
const today = new Date();
const yyyy = today.getFullYear();
let mm = today.getMonth() + 1;
let dd = today.getDate();
if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;
dateInput.min = `${yyyy}-${mm}-${dd}`;
dateInput.value = `${yyyy}-${mm}-${dd}`;
timeInput.value = "19:00"; // Default time (7 PM)

// Runaway "No" Button Functionality
function moveNoButton(e) {
    // Switch to absolute positioning after first hover/touch
    if (!noBtn.classList.contains('absolute-mode')) {
        noBtn.classList.add('absolute-mode');
        document.body.appendChild(noBtn);
    }

    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    
    // Viewport boundaries
    const maxX = window.innerWidth - btnWidth - 40;
    const maxY = window.innerHeight - btnHeight - 40;

    // Get current cursor/touch coordinates to avoid spawning underneath it
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;

    if (e) {
        if (e.clientX) {
            cursorX = e.clientX;
            cursorY = e.clientY;
        } else if (e.touches && e.touches[0]) {
            cursorX = e.touches[0].clientX;
            cursorY = e.touches[0].clientY;
        }
    }

    // Try finding coordinates that are at least 150px away from the cursor
    let targetX = Math.max(20, Math.floor(Math.random() * maxX));
    let targetY = Math.max(20, Math.floor(Math.random() * maxY));
    
    for (let i = 0; i < 30; i++) {
        const potentialX = Math.max(20, Math.floor(Math.random() * maxX));
        const potentialY = Math.max(20, Math.floor(Math.random() * maxY));
        const distance = Math.hypot(potentialX + btnWidth / 2 - cursorX, potentialY + btnHeight / 2 - cursorY);
        
        if (distance > 160) {
            targetX = potentialX;
            targetY = potentialY;
            break;
        }
    }

    // Relocate button
    noBtn.style.left = `${targetX}px`;
    noBtn.style.top = `${targetY}px`;

    // Make Yes button grow
    if (yesScale < maxYesScale) {
        yesScale += 0.15;
        yesBtn.style.transform = `scale(${yesScale})`;
    }

    // Change No button text dynamically
    noBtn.querySelector('.btn-text').innerText = messages[noClickCount % messages.length];
    noClickCount++;
}

// Bind Events to No Button
noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent click delay and double tap zoom on mobile
    moveNoButton(e);
});
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButton(e);
});

// Yes Button Click Action - Switch Card & Show Static Background Roses
yesBtn.addEventListener('click', () => {
    // Hide proposal
    proposalCard.classList.add('hidden');
    
    // Remove the runaway No button from the DOM
    noBtn.remove();
    
    // Wait for the transition of hiding, then show scheduler and fade in background roses
    setTimeout(() => {
        proposalCard.style.display = 'none';
        schedulerCard.classList.remove('hidden');
        document.getElementById('background-roses').classList.add('active');
    }, 400);
});

// Form Submission & API Request to Vercel Serverless Function
dateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const chosenDate = dateInput.value;
    const chosenTime = timeInput.value;
    const selectedActivityElement = document.querySelector('input[name="activity"]:checked');
    const chosenActivity = selectedActivityElement ? selectedActivityElement.value : "Buluşma";
    
    const submitBtn = dateForm.querySelector('.btn-submit');
    const originalBtnContent = submitBtn.innerHTML;
    
    // Disable button to prevent double tap
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-text">Gönderiliyor...</span>';
    
    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: chosenDate,
                time: chosenTime,
                activity: chosenActivity
            })
        });
        
        if (response.ok) {
            // Hide scheduler card
            schedulerCard.classList.add('hidden');
            
            // Transition body background to a warmer, romantic tone
            document.body.style.transition = 'background 4s ease-in-out';
            document.body.style.background = 'radial-gradient(circle at center, #fff0f5 0%, #ffe4e1 55%, #ffd1dc 100%)';
            
            // Wait for transition, then show success card
            setTimeout(() => {
                schedulerCard.style.display = 'none';
                successCard.classList.remove('hidden');
            }, 400);
        } else {
            const errData = await response.json();
            const detailMsg = (errData.details && errData.details.description) ? `\nDetay: ${errData.details.description}` : '';
            alert('Gönderim başarısız oldu. Hata: ' + (errData.error || 'Bilinmeyen Hata') + detailMsg);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    } catch (error) {
        console.error('Error sending date plan:', error);
        alert('Gönderim sırasında bağlantı hatası oluştu. Lütfen tekrar dene kanka!');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
    }
});
