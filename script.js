document.addEventListener('DOMContentLoaded', () => {
    // Firebase configuration (replace with your actual config)
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    const hourlyRateInput = document.getElementById('hourlyRate');
    const minutesInput = document.getElementById('minutes');
    const addMinutesButton = document.getElementById('addMinutes');
    const loggedMinutesList = document.getElementById('loggedMinutesList');
    const totalTimeDisplay = document.getElementById('totalTime');
    const totalPriceDisplay = document.getElementById('totalPrice');

    let loggedMinutes = [];
    let hourlyRate = 0;

    // Load data from Firebase
    async function loadData() {
        const snapshot = await firebase.database().ref('/data').once('value');
        const data = snapshot.val();

        if (data) {
            loggedMinutes = data.loggedMinutes || [];
            hourlyRate = data.hourlyRate || 0;

            updateLoggedMinutesList();
            hourlyRateInput.value = hourlyRate;
            calculateAndDisplayTotals();
        }
    }

    // Save data to Firebase
    async function saveData() {
        await firebase.database().ref('/data').set({
            loggedMinutes: loggedMinutes,
            hourlyRate: hourlyRate
        });
    }

    // Update the list of logged minutes
    function updateLoggedMinutesList() {
        loggedMinutesList.innerHTML = '';
        loggedMinutes.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.date}: ${item.minutes} minutter`;
            loggedMinutesList.appendChild(listItem);
        });
    }

    // Calculate and display total time and price
    function calculateAndDisplayTotals() {
        const totalMinutes = loggedMinutes.reduce((sum, item) => sum + item.minutes, 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        totalTimeDisplay.textContent = `Total tid: ${hours} timer og ${minutes} minutter`;

        hourlyRate = parseFloat(hourlyRateInput.value) || 0;
        const totalHours = totalMinutes / 60;
        const totalPrice = totalHours * hourlyRate;
        totalPriceDisplay.textContent = `Total pris: ${totalPrice.toFixed(2)} kr`;
    }

    // Event listener for adding minutes
    addMinutesButton.addEventListener('click', () => {
        const minutesValue = parseInt(minutesInput.value);

        if (!isNaN(minutesValue) && minutesValue > 0) {
            const now = new Date();
            const dateString = now.toLocaleDateString();
            loggedMinutes.push({ date: dateString, minutes: minutesValue });
            minutesInput.value = ''; // Clear the input field

            updateLoggedMinutesList();
            calculateAndDisplayTotals();
            saveData();
        } else {
            alert('Vennligst skriv inn et gyldig antall minutter.');
        }
    });

    // Event listener for hourly rate input change
    hourlyRateInput.addEventListener('input', () => {
        hourlyRate = parseFloat(hourlyRateInput.value) || 0;
        calculateAndDisplayTotals();
        saveData();
    });

    // Load data when the page loads
    loadData();
});