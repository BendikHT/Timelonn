import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAfrEyE9jhJKXsmpxFzWp-ZMVcPTU2oYGA",
        authDomain: "timelonn-87d2c.firebaseapp.com",
        projectId: "timelonn-87d2c",
        storageBucket: "timelonn-87d2c.firebasestorage.app",
        messagingSenderId: "396806207876",
        appId: "1:396806207876:web:04bca684709d034fe885d1",
        measurementId: "G-TWFN3M9HWR"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const hourlyRateInput = document.getElementById('hourlyRate');
    const minutesInput = document.getElementById('minutesWorked');
    const addMinutesButton = document.getElementById('addMinutes');
    const loggedMinutesList = document.getElementById('minutesList');
    const totalTimeDisplay = document.getElementById('totalTime');
    const totalPriceDisplay = document.getElementById('totalPrice');

    let loggedMinutes = [];
    let hourlyRate = 0;

    // Load data from Firestore
    async function loadData() {
        const docRef = doc(db, "timelonn", "userdata");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            loggedMinutes = data.loggedMinutes || [];
            hourlyRate = data.hourlyRate || 0;

            updateLoggedMinutesList();
            hourlyRateInput.value = hourlyRate;
            calculateAndDisplayTotals();
        }
    }

    // Save data to Firestore
    async function saveData() {
        const docRef = doc(db, "timelonn", "userdata");
        await setDoc(docRef, {
            loggedMinutes: loggedMinutes,
            hourlyRate: hourlyRate
        });
    }

    function updateLoggedMinutesList() {
        loggedMinutesList.innerHTML = '';
        loggedMinutes.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.date}: ${item.minutes} minutter`;
            loggedMinutesList.appendChild(listItem);
        });
    }

    function calculateAndDisplayTotals() {
        const totalMinutes = loggedMinutes.reduce((sum, item) => sum + item.minutes, 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        totalTimeDisplay.textContent = `${hours} timer, ${minutes} minutter`;

        hourlyRate = parseFloat(hourlyRateInput.value) || 0;
        const totalHours = totalMinutes / 60;
        const totalPrice = totalHours * hourlyRate;
        totalPriceDisplay.textContent = `${totalPrice.toFixed(2)} kr`;
    }

    addMinutesButton.addEventListener('click', () => {
        const minutesValue = parseInt(minutesInput.value);

        if (!isNaN(minutesValue) && minutesValue > 0) {
            const now = new Date();
            const dateString = now.toLocaleDateString();
            loggedMinutes.push({ date: dateString, minutes: minutesValue });
            minutesInput.value = '';

            updateLoggedMinutesList();
            calculateAndDisplayTotals();
            saveData();
        } else {
            alert('Vennligst skriv inn et gyldig antall minutter.');
        }
    });

    hourlyRateInput.addEventListener('input', () => {
        hourlyRate = parseFloat(hourlyRateInput.value) || 0;
        calculateAndDisplayTotals();
        saveData();
    });

    loadData();
});