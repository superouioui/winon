// État global
let currentSession = [];
let currentRound = 0;
let completedRounds = [];
let audioContext;
let isPracticing = false;
let stopRequested = false;
let appConfig = {
    breathCount: 30,
    breathSpeed: 30,
    fullTime: 60,
    rounds: []
};

// Initialisation une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    initialize();
});

// Fonction d’initialisation
function initialize() {
    loadConfig();
    loadStats();
    document.getElementById('breathCount').addEventListener('change', saveConfig);
    document.getElementById('breathSpeed').addEventListener('change', saveConfig);
    document.getElementById('fullTime').addEventListener('change', saveConfig);
    document.getElementById('emptyLungsMp3').addEventListener('change', saveConfig); // Ajout ici
}