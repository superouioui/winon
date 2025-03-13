function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    evt.target.classList.add('active');
}

function addRound(emptyTime = 60, isInfinite = false, tooEasy = false) {
    const div = document.createElement('div');
    div.className = 'round-config';
    div.innerHTML = `
        Round ${document.querySelectorAll('.round-config').length + 1}
        <label>Temps apnée vide:</label>
        <input type="number" class="emptyTime" min="10" value="${emptyTime}" ${isInfinite ? 'disabled' : ''}>
        <label>Infini:</label>
        <input type="checkbox" class="infiniteEmpty" ${isInfinite ? 'checked' : ''}>
        <label>Trop facile:</label>
        <input type="checkbox" class="tooEasy" ${tooEasy ? 'checked' : ''}>
        <button onclick="this.parentElement.remove(); saveConfig()">Supprimer</button>
    `;
    div.querySelector('.emptyTime').addEventListener('change', saveConfig);
    div.querySelector('.infiniteEmpty').addEventListener('change', function() {
        div.querySelector('.emptyTime').disabled = this.checked;
        saveConfig();
    });
    div.querySelector('.tooEasy').addEventListener('change', saveConfig);
    document.getElementById('roundsContainer').appendChild(div);
    saveConfig();
}

function saveConfig() {
    appConfig.breathCount = parseInt(document.getElementById('breathCount').value);
    appConfig.breathSpeed = parseInt(document.getElementById('breathSpeed').value);
    appConfig.fullTime = parseInt(document.getElementById('fullTime').value);
    appConfig.rounds = Array.from(document.querySelectorAll('.round-config')).map(round => ({
        emptyTime: round.querySelector('.infiniteEmpty').checked ? 'infinite' : parseInt(round.querySelector('.emptyTime').value),
        isInfinite: round.querySelector('.infiniteEmpty').checked,
        tooEasy: round.querySelector('.tooEasy').checked
    }));
    localStorage.setItem('apneaConfig', JSON.stringify(appConfig));
}

function loadConfig() {
    const saved = localStorage.getItem('apneaConfig');
    if (saved) {
        appConfig = JSON.parse(saved);
        document.getElementById('breathCount').value = appConfig.breathCount;
        document.getElementById('breathSpeed').value = appConfig.breathSpeed;
        document.getElementById('fullTime').value = appConfig.fullTime;
        document.getElementById('roundsContainer').innerHTML = '';
        appConfig.rounds.forEach(round => addRound(round.isInfinite ? 60 : round.emptyTime, round.isInfinite, round.tooEasy));
    } else {
        document.getElementById('breathCount').value = appConfig.breathCount;
        document.getElementById('breathSpeed').value = appConfig.breathSpeed;
        document.getElementById('fullTime').value = appConfig.fullTime;
        addRound();
    }
}