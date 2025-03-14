async function startSession() {
    if (isPracticing) return;
    isPracticing = true;
    stopRequested = false;
    completedRounds = [];
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('stopBtn').style.display = 'block';
    
    const breathCount = parseInt(document.getElementById('breathCount').value);
    const breathSpeed = parseInt(document.getElementById('breathSpeed').value);
    const breathDuration = 60 / breathSpeed * 1000;

    currentSession = Array.from(document.querySelectorAll('.round-config')).map(round => ({
        emptyTime: round.querySelector('.infiniteEmpty').checked ? 'infinite' : parseInt(round.querySelector('.emptyTime').value),
        fullTime: appConfig.fullTime,
        isInfinite: round.querySelector('.infiniteEmpty').checked
    }));

    for (currentRound = 0; currentRound < currentSession.length && !stopRequested; currentRound++) {
        await prepareRound();
        if (stopRequested) break;
        updateRoundInfo(currentRound, currentSession[currentRound].emptyTime);
        await doHyperventilation(breathCount, breathDuration);
        if (stopRequested) break;
        updateRoundInfo(currentRound, currentSession[currentRound].emptyTime);
        await doEmptyLungs(currentSession[currentRound]);
        if (stopRequested) break;
        updateRoundInfo(currentRound, currentSession[currentRound].emptyTime);
        await doFullLungs(currentSession[currentRound].fullTime, currentSession[currentRound]);
        if (!stopRequested) completedRounds.push(currentSession[currentRound]);
    }
    
    saveStats();
    playEndSessionSound();
    isPracticing = false;
    document.getElementById('roundInfo').textContent = '-';
    document.getElementById('startBtn').style.display = 'block';
    document.getElementById('stopBtn').style.display = 'none';
}

function stopSession() {
    stopRequested = true;
}

async function doHyperventilation(count, duration) {
    const circle = document.querySelector('.breath-circle');
    const counter = document.getElementById('counter');
    circle.className = 'breath-circle hyperventilation';
    
    for (let i = count; i > 0 && !stopRequested; i--) {
        counter.textContent = i;
        circle.style.transform = 'scale(1.2)';
        playSound(440);
        if (i === 2) playSound(880, 0.2);
        await new Promise(r => setTimeout(r, duration / 2));
        circle.style.transform = 'scale(1)';
        playSound(330);
        await new Promise(r => setTimeout(r, duration / 2));
        if (i === 1) playSound(660, 0.5);
    }
}

async function doEmptyLungs(round) {
    const circle = document.querySelector('.breath-circle');
    const counter = document.getElementById('counter');
    circle.className = 'breath-circle empty';
    
    // Créer un objet Audio si un MP3 est défini
    let audio;
    if (appConfig.emptyLungsMp3Url) {
        audio = new Audio(appConfig.emptyLungsMp3Url);
        audio.loop = true; // Répéter le MP3 pendant toute la durée
        audio.play();
    }

    if (round.isInfinite) {
        let time = 0;
        counter.textContent = time;
        const interval = setInterval(() => {
            if (stopRequested) clearInterval(interval);
            else {
                time++;
                counter.textContent = time;
            }
        }, 1000);
        
        await new Promise(resolve => {
            document.addEventListener('click', function stopInfinite() {
                clearInterval(interval);
                if (audio) audio.pause(); // Arrêter le MP3
                document.removeEventListener('click', stopInfinite);
                resolve();
            });
        });
        round.emptyTime = time;
    } else {
        return new Promise(resolve => {
            let remaining = round.emptyTime;
            counter.textContent = remaining;
            const interval = setInterval(() => {
                if (stopRequested) {
                    clearInterval(interval);
                    if (audio) audio.pause(); // Arrêter le MP3
                    resolve();
                } else if (remaining-- <= 0) {
                    clearInterval(interval);
                    if (audio) audio.pause(); // Arrêter le MP3
                    playSound(660);
                    resolve();
                }
                counter.textContent = remaining;
            }, 1000);
        });
    }
}

async function doFullLungs(time, round) {
    const circle = document.querySelector('.breath-circle');
    const counter = document.getElementById('counter');
    const easyCheckbox = document.getElementById('easyCheckbox');
    easyCheckbox.style.display = 'block';
    document.getElementById('tooEasy').checked = false;
    
    circle.className = 'breath-circle full';
    
    return new Promise(resolve => {
        let remaining = time;
        counter.textContent = remaining;
        const interval = setInterval(() => {
            if (stopRequested) {
                clearInterval(interval);
                easyCheckbox.style.display = 'none';
                resolve();
            } else if (remaining-- <= 0) {
                clearInterval(interval);
                playSound(660);
                round.tooEasy = document.getElementById('tooEasy').checked;
                easyCheckbox.style.display = 'none';
                resolve();
            }
            counter.textContent = remaining;
        }, 1000);
    });
}

async function prepareRound() {
    const counter = document.getElementById('counter');
    for (let i = 3; i > 0; i--) {
        counter.textContent = i;
        playSound(550, 0.1);
        await new Promise(r => setTimeout(r, 1000));
    }
}

function updateRoundInfo(roundIndex, emptyTime) {
    const roundInfo = document.getElementById('roundInfo');
    roundInfo.textContent = `Round ${roundIndex + 1} - Apnée vide: ${emptyTime === 'infinite' ? 'infini' : `${emptyTime}s`}`;
}

function playSound(freq, duration = 0.1) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = freq;
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration);
}

function playEndSessionSound() {
    const notes = [440, 523.25, 659.25, 880];
    let time = audioContext.currentTime;
    notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.5, time + index * 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + index * 0.2 + 0.15);
        oscillator.start(time + index * 0.2);
        oscillator.stop(time + index * 0.2 + 0.15);
    });
}