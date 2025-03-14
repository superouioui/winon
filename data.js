function saveStats() {
    let stats = JSON.parse(localStorage.getItem('apneaStats') || '[]');
    if (completedRounds.length > 0) {
        const sessionData = {
            date: new Date().toISOString(),
            rounds: completedRounds.map(round => ({
                emptyTime: round.emptyTime !== undefined ? round.emptyTime : 0,
                tooEasy: round.tooEasy || false
            }))
        };
        stats.push(sessionData);
        localStorage.setItem('apneaStats', JSON.stringify(stats));
    }
    appConfig.rounds = currentSession.map(round => ({
        emptyTime: round.isInfinite ? 'infinite' : (round.emptyTime !== undefined ? round.emptyTime : 60),
        isInfinite: round.isInfinite || false,
        tooEasy: round.tooEasy || false
    }));
    localStorage.setItem('apneaConfig', JSON.stringify(appConfig));
    loadStats();
}

function loadStats() {
    const stats = JSON.parse(localStorage.getItem('apneaStats') || '[]');
    const list = document.getElementById('statsList');
    list.innerHTML = stats.reverse().map(stat => {
        // Calculer la somme des temps d’apnée vide pour cette session
        const totalEmptyTime = stat.rounds.reduce((sum, round) => {
            return sum + (typeof round.emptyTime === 'number' ? round.emptyTime : 0);
        }, 0);

        return `
            <li>
                ${new Date(stat.date).toLocaleDateString()} - 
                ${stat.rounds.length} rounds<br>
                ${stat.rounds.map((r, i) => `
                    Round ${i + 1}: Apnée vide: ${r.emptyTime}s ${r.tooEasy ? '(trop facile)' : ''}
                `).join('<br>')}
                <br><strong>Total apnée vide: ${totalEmptyTime}s</strong>
            </li>
        `;
    }).join('');
}

function exportStats() {
    const stats = JSON.parse(localStorage.getItem('apneaStats') || '[]');
    if (stats.length === 0) {
        alert("Aucune statistique à exporter.");
        return;
    }
    let markdown = '# Historique des performances\n\n';
    stats.forEach(stat => {
        markdown += `## ${new Date(stat.date).toLocaleDateString()}\n`;
        stat.rounds.forEach((round, index) => {
            markdown += `- Round ${index + 1}:\n`;
            markdown += `  - Apnée vide: ${round.emptyTime}s ${round.tooEasy ? '(trop facile)' : ''}\n`;
        });
        markdown += '\n';
    });
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apnee_stats.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearStats() {
    localStorage.removeItem('apneaStats');
    loadStats();
}

function exportStats() {
    const stats = JSON.parse(localStorage.getItem('apneaStats') || '[]');
    if (stats.length === 0) {
        alert("Aucune statistique à exporter.");
        return;
    }
    let markdown = '# Historique des performances\n\n';
    stats.forEach(stat => {
        const totalEmptyTime = stat.rounds.reduce((sum, round) => {
            return sum + (typeof round.emptyTime === 'number' ? round.emptyTime : 0);
        }, 0);
        markdown += `## ${new Date(stat.date).toLocaleDateString()}\n`;
        stat.rounds.forEach((round, index) => {
            markdown += `- Round ${index + 1}:\n`;
            markdown += `  - Apnée vide: ${round.emptyTime}s ${round.tooEasy ? '(trop facile)' : ''}\n`;
        });
        markdown += `\n**Total apnée vide: ${totalEmptyTime}s**\n\n`;
    });
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apnee_stats.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importConfig(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedConfig = JSON.parse(e.target.result);
            if (!importedConfig.breathCount || !importedConfig.breathSpeed || !importedConfig.fullTime || !importedConfig.rounds) {
                alert("Le fichier JSON n'a pas une structure valide pour la configuration.");
                return;
            }
            appConfig = importedConfig;
            localStorage.setItem('apneaConfig', JSON.stringify(appConfig));
            loadConfig();
            alert("Configuration importée avec succès !");
        } catch (error) {
            alert("Erreur lors de l'importation : fichier invalide ou corrompu.");
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}