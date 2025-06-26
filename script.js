// Game state
let gameState = {
    codes: ['', '', '', ''],
    selectedAncestry: null,
    segmentAssignments: new Array(8).fill('unassigned'),
    quizAnswers: [null, null, null],
    introTimer: 30, //30 1 minutes
    gameTimer: 120, //480 8 minutes
    currentScreen: 'start'
};

// Timer functions
function startIntro() {
    console.log("Start intro clicked");
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('intro-screen').classList.remove('hidden');
    gameState.currentScreen = 'intro';
    
    const introInterval = setInterval(() => {
        gameState.introTimer--;
        updateIntroTimer();
        
        if (gameState.introTimer <= 0) {
            clearInterval(introInterval);
            startGame();
        }
    }, 1000);
}

function updateIntroTimer() {
    const minutes = Math.floor(gameState.introTimer / 60);
    const seconds = gameState.introTimer % 60;
    document.getElementById('intro-timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const progress = ((120 - gameState.introTimer) / 120) * 100;
    document.getElementById('intro-progress').style.width = `${progress}%`;
}

function startGame() {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    gameState.currentScreen = 'game';

    // Make sure only challenge 1 is unlocked and visible
    document.getElementById('challenge1').classList.remove('locked');
    document.getElementById('challenge2').classList.add('locked');
    document.getElementById('challenge3').classList.add('locked');
    document.getElementById('challenge4').classList.add('locked');
    document.getElementById('final-escape').classList.add('locked');

    const gameInterval = setInterval(() => {
        gameState.gameTimer--;
        updateGameTimer();
        
        if (gameState.gameTimer <= 0) {
            clearInterval(gameInterval);
            // Time's up - could add failure screen here
            alert('Time\'s up! The lab remains locked...');
        }
    }, 1000);
}

function updateGameTimer() {
    const minutes = Math.floor(gameState.gameTimer / 60);
    const seconds = gameState.gameTimer % 60;
    document.getElementById('game-timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const progress = ((480 - gameState.gameTimer) / 480) * 100;
    document.getElementById('game-progress').style.width = `${progress}%`;
}

// Challenge 1: Admixture functions
function updateSliders() {
    const european = document.getElementById('european');
    const african = document.getElementById('african');
    const asian = document.getElementById('asian');
    
    european.oninput = () => {
        document.getElementById('eur-value').textContent = european.value;
        updateTotal();
    };
    
    african.oninput = () => {
        document.getElementById('afr-value').textContent = african.value;
        updateTotal();
    };
    
    asian.oninput = () => {
        document.getElementById('asn-value').textContent = asian.value;
        updateTotal();
    };
}

function updateTotal() {
    const eur = parseInt(document.getElementById('european').value);
    const afr = parseInt(document.getElementById('african').value);
    const asn = parseInt(document.getElementById('asian').value);
    const total = eur + afr + asn;
    
    document.getElementById('total-percentage').textContent = total;
    
    // Enable button only when total is 100
    document.getElementById('admixture-btn').disabled = total !== 100;
}

function checkAdmixture() {
    const eur = parseInt(document.getElementById('european').value);
    const afr = parseInt(document.getElementById('african').value);
    const asn = parseInt(document.getElementById('asian').value);
    
    // Target: European 45%, African 35%, Asian 20% (±5% tolerance)
    const eurCorrect = Math.abs(eur - 45) <= 5;
    const afrCorrect = Math.abs(afr - 35) <= 5;
    const asnCorrect = Math.abs(asn - 20) <= 5;
    
    if (eurCorrect && afrCorrect && asnCorrect) {
        gameState.codes[0] = '2';
        document.getElementById('challenge1-result').innerHTML = 
            '<div style="background: #27ae60; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>✅ SUCCESS!</strong> First digit obtained: <strong>2</strong><br><small>Key Learning: Admixture analysis reveals global ancestry proportions crucial for understanding population structure!</small></div>';
        unlockChallenge(2);
    } else {
        document.getElementById('challenge1-result').innerHTML = 
            '<div style="background: #e74c3c; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>❌ INCORRECT</strong> Proportions not within acceptable range. Try again!<br><small>Target: European 45%, African 35%, Asian 20% (±5% tolerance)</small></div>';
    }
}

// Challenge 2: RFMix functions
function selectAncestry(ancestry) {
    gameState.selectedAncestry = ancestry;
    document.getElementById('selected-ancestry').textContent = ancestry.charAt(0).toUpperCase() + ancestry.slice(1);
    
    // Update button styles
    document.querySelectorAll('.ancestry-btn').forEach(btn => btn.style.opacity = '0.5');
    document.querySelector(`.ancestry-btn.${ancestry}`).style.opacity = '1';
}

function assignSegment(index) {
    if (!gameState.selectedAncestry) {
        alert('Please select an ancestry first!');
        return;
    }
    
    const segment = document.querySelectorAll('.segment')[index];
    segment.className = `segment ${gameState.selectedAncestry}`;
    gameState.segmentAssignments[index] = gameState.selectedAncestry;
    
    // Check if all segments are assigned
    const allAssigned = gameState.segmentAssignments.every(assignment => assignment !== 'unassigned');
    document.getElementById('rfmix-btn').disabled = !allAssigned;
}

function checkRFMix() {
    const segments = document.querySelectorAll('.segment');
    let correctCount = 0;
    
    segments.forEach((segment, index) => {
        const correct = segment.dataset.correct;
        const assigned = gameState.segmentAssignments[index];
        if (correct === assigned) {
            correctCount++;
        }
    });
    
    if (correctCount >= 6) {
        gameState.codes[1] = '3';
        document.getElementById('challenge2-result').innerHTML = 
            '<div style="background: #27ae60; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>✅ SUCCESS!</strong> Second digit obtained: <strong>3</strong><br><small>Key Learning: RFMix performs local ancestry inference - identifying which chromosome parts come from which ancestral populations!</small></div>';
        unlockChallenge(3);
    } else {
        document.getElementById('challenge2-result').innerHTML = 
            '<div style="background: #e74c3c; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>❌ INCORRECT</strong> Only ' + correctCount + '/8 segments correct. Need at least 6/8. Try again!</div>';
    }
}

// Challenge 3: Quiz functions
function selectQuizOption(questionIndex, optionIndex) {
    // Clear previous selections for this question
    for (let i = 0; i < 3; i++) {
        document.getElementById(`q${questionIndex + 1}-${i}`).classList.remove('selected');
    }
    
    // Select current option
    document.getElementById(`q${questionIndex + 1}-${optionIndex}`).classList.add('selected');
    gameState.quizAnswers[questionIndex] = optionIndex;
    
    // Enable button if all questions answered
    const allAnswered = gameState.quizAnswers.every(answer => answer !== null);
    document.getElementById('quiz-btn').disabled = !allAnswered;
}

function checkQuiz() {
    // Correct answers: [1, 1, 1] (all B options)
    const correctAnswers = [1, 1, 1];
    let correctCount = 0;
    
    for (let i = 0; i < 3; i++) {
        if (gameState.quizAnswers[i] === correctAnswers[i]) {
            correctCount++;
        }
    }
    
    if (correctCount === 3) {
        gameState.codes[2] = '1';
        document.getElementById('challenge3-result').innerHTML = 
            '<div style="background: #27ae60; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>✅ SUCCESS!</strong> Third digit obtained: <strong>1</strong><br><small>Key Learning: Understanding pathways is crucial for avoiding false associations in PRS analysis!</small></div>';
        unlockChallenge(4);
    } else {
        document.getElementById('challenge3-result').innerHTML = 
            '<div style="background: #e74c3c; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>❌ INCORRECT</strong> Only ' + correctCount + '/3 correct. Need at least 2/3. Review Prof O\'Reilly\'s key points!</div>';
    }
}

// Challenge 4: Benchmarking functions
function setupBenchmarkingInputs() {
    const inputs = ['bridge-rank', 'csx-rank', 'standard-rank'];
    inputs.forEach(id => {
        document.getElementById(id).oninput = () => {
            checkBenchmarkingInputs();
        };
    });
}

function checkBenchmarkingInputs() {
    const bridge = document.getElementById('bridge-rank').value;
    const csx = document.getElementById('csx-rank').value;
    const standard = document.getElementById('standard-rank').value;
    
    const allFilled = bridge && csx && standard;
    const validRanks = [bridge, csx, standard].every(rank => rank >= 1 && rank <= 3);
    const uniqueRanks = new Set([bridge, csx, standard]).size === 3;
    
    document.getElementById('benchmark-btn').disabled = !(allFilled && validRanks && uniqueRanks);
}

function checkBenchmarking() {
    const bridge = parseInt(document.getElementById('bridge-rank').value);
    const csx = parseInt(document.getElementById('csx-rank').value);
    const standard = parseInt(document.getElementById('standard-rank').value);
    
    // Correct ranking: BridgePRS=1, PRS-CSx=2, Standard=3
    if (bridge === 1 && csx === 2 && standard === 3) {
        gameState.codes[3] = '5';
        document.getElementById('challenge4-result').innerHTML = 
            '<div style="background: #27ae60; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>✅ SUCCESS!</strong> Fourth digit obtained: <strong>5</strong><br><small>Key Learning: BridgePRS uses two-stage Bayesian methods for optimal cross-population PRS portability!</small></div>';
        unlockFinalChallenge();
    } else {
        document.getElementById('challenge4-result').innerHTML = 
            '<div style="background: #e74c3c; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>❌ INCORRECT</strong> Remember: rank by portability across populations (BridgePRS=best, Standard=worst)</div>';
    }
}

// Final Challenge functions
function unlockFinalChallenge() {
    document.getElementById('final-escape').classList.remove('locked');
    document.getElementById('final-escape').scrollIntoView({ behavior: 'smooth' });
    
    // Update collected codes display
    const codesDisplay = gameState.codes.map(code => code || '_').join(' ');
    document.getElementById('collected-codes').textContent = codesDisplay;
    
    // Enable final input if all codes collected
    const allCodes = gameState.codes.every(code => code !== '');
    if (allCodes) {
        document.getElementById('final-code').disabled = false;
        document.getElementById('final-code').focus();
        
        document.getElementById('final-code').oninput = () => {
            const code = document.getElementById('final-code').value;
            document.getElementById('final-btn').disabled = code.length !== 4;
        };
    }
}

function checkFinalCode() {
    const enteredCode = document.getElementById('final-code').value;
    const correctCode = gameState.codes.join(''); // Should be "2315"
    
    if (enteredCode === correctCode) {
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('success-screen').classList.remove('hidden');
    } else {
        document.getElementById('final-result').innerHTML = 
            '<div style="background: #e74c3c; padding: 15px; border-radius: 8px; margin: 10px 0;"><strong>❌ INCORRECT CODE</strong> Check your collected digits and try again!</div>';
    }
}

// Utility functions
function unlockChallenge(challengeNumber) {
    document.getElementById(`challenge${challengeNumber}`).classList.remove('locked');
    document.getElementById(`challenge${challengeNumber}`).scrollIntoView({ behavior: 'smooth' });
    
    // Update collected codes display
    const codesDisplay = gameState.codes.map(code => code || '_').join(' ');
    if (document.getElementById('collected-codes')) {
        document.getElementById('collected-codes').textContent = codesDisplay;
    }
}

function resetGame() {
    // Reset game state
    gameState = {
        codes: ['', '', '', ''],
        selectedAncestry: null,
        segmentAssignments: new Array(8).fill('unassigned'),
        quizAnswers: [null, null, null],
        introTimer: 30,
        gameTimer: 480,
        currentScreen: 'start'
    };
    
    // Reset UI
    document.getElementById('success-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    
    // Lock all challenges except first one
    document.getElementById('challenge2').classList.add('locked');
    document.getElementById('challenge3').classList.add('locked');
    document.getElementById('challenge4').classList.add('locked');
    document.getElementById('final-escape').classList.add('locked');
    
    // Reset form elements
    document.getElementById('european').value = 33;
    document.getElementById('african').value = 33;
    document.getElementById('asian').value = 34;
    document.getElementById('eur-value').textContent = '33';
    document.getElementById('afr-value').textContent = '33';
    document.getElementById('asn-value').textContent = '34';
    document.getElementById('total-percentage').textContent = '100';
    
    // Reset segments
    document.querySelectorAll('.segment').forEach(segment => {
        segment.className = 'segment unassigned';
    });
    
    // Reset quiz
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Reset ranking inputs
    document.getElementById('bridge-rank').value = '';
    document.getElementById('csx-rank').value = '';
    document.getElementById('standard-rank').value = '';
    
    // Reset final code
    document.getElementById('final-code').value = '';
    
    // Clear all result divs
    ['challenge1-result', 'challenge2-result', 'challenge3-result', 'challenge4-result', 'final-result'].forEach(id => {
        document.getElementById(id).innerHTML = '';
    });
}

// Initialize when page loads
window.onload = function() {
    console.log("Window loaded");
    updateSliders();
    setupBenchmarkingInputs();

    // Hide all screens except start
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('success-screen').classList.add('hidden');

    // Lock all challenges
    document.getElementById('challenge2').classList.add('locked');
    document.getElementById('challenge3').classList.add('locked');
    document.getElementById('challenge4').classList.add('locked');
    document.getElementById('final-escape').classList.add('locked');
};
