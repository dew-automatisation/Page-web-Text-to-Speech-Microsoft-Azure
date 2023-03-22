const form = document.getElementById('textToSpeechForm');
const textInput = document.getElementById('textInput');
const audioPlayer = document.getElementById('audioPlayer');
const voiceSelect = document.getElementById('voiceSelect');
const apiKeyInput = document.getElementById('apiKeyInput');
const regionInput = document.getElementById('regionInput');
const downloadButton = document.getElementById('downloadButton');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = textInput.value;

    if (text.trim() === '') {
        alert("Veuillez entrer du texte.");
        return;
    }

    try {
        const audioUrl = await convertTextToSpeech(text);
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = 'block';
        audioPlayer.play();

        // Mettez à jour le lien de téléchargement
        downloadButton.href = audioUrl;
        downloadButton.style.display = 'block';
    } catch (error) {
        console.error('Erreur lors de la conversion du texte en audio:', error);
    }
});

async function fetchVoices() {
    const apiKey = apiKeyInput.value;
    const speechRegion = regionInput.value;
    const apiUrl = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;

    const requestOptions = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Ocp-Apim-Subscription-Key': apiKey
        }
    };

    const response = await fetch(apiUrl, requestOptions);
    if (!response.ok) {
        throw new Error(`Erreur lors de l'appel à l'API: ${response.statusText}`);
    }

    const voices = await response.json();
    return voices;
}

async function convertTextToSpeech(text) {
    const apiKey = apiKeyInput.value;
    const speechRegion = regionInput.value;
    const apiUrl = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
    const selectedVoice = voiceSelect.value;

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
            'Ocp-Apim-Subscription-Key': apiKey
        },
        body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-FR">
                    <voice xml:lang="fr-FR" xml:gender="Male" name="${selectedVoice}">
                        ${text}
                    </voice>
                </speak>`
    };

    const response = await fetch(apiUrl, requestOptions);
    if (!response.ok) {
        throw new Error(`Erreur lors de l'appel à l'API: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
}

async function populateVoiceList() {
    try {
        const voices = await fetchVoices();
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.Name;
            option.textContent = `${voice.Name} (${voice.Gender}, ${voice.Locale})`;
            voiceSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des voix:', error);
    }
}

const loadVoicesButton = document.getElementById('loadVoicesButton');

// Ajoutez un gestionnaire d'événements pour le bouton "Charger les voix"
loadVoicesButton.addEventListener('click', () => {
    populateVoiceList();
});

// Modifiez la fonction populateVoiceList pour vider la liste des voix avant de la remplir à nouveau
async function populateVoiceList() {
    try {
        // Videz la liste des voix
        voiceSelect.innerHTML = '';

        const voices = await fetchVoices();
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.Name;
            option.textContent = `${voice.Name} (${voice.Gender}, ${voice.Locale})`;
            voiceSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des voix:', error);
    }
}

// Supprimez l'appel initial à populateVoiceList()


populateVoiceList();
