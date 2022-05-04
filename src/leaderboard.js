import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.7.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.7.0/firebase-firestore.js';
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/9.7.0/firebase-app-check.js';

// Initialize Firebase
const firebaseApp = initializeApp( {
    apiKey: "AIzaSyBdtpqJx7-NCx643lDKgfAzz5Gz_XNhFmw",
    authDomain: "jstetris-2b64d.firebaseapp.com",
    projectId: "jstetris-2b64d",
    storageBucket: "jstetris-2b64d.appspot.com",
    messagingSenderId: "926826076612",
    appId: "1:926826076612:web:c79d1f239a6a058c236c91"
});

// Initialize services
initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider('6LeV3cQfAAAAAP7Y9-LYh4EbGEgn_Ux5gx0DKxNL')
});
const db = getFirestore(firebaseApp);
const colRef = collection(db, 'highscores');
// Query db for top highscores
const leaders = query(colRef, orderBy('highscore', 'desc'), limit(100));

// Set up leaderboard
const outputTable = document.querySelector("#leaderboard");
let text = "<h2>LEADERBOARD</h2><table>";
let xtraDigit = "0";
let count = 1;

// Render leaderboard
function renderLeaderboard(doc) {
    if (count > 9) {
        xtraDigit = "";
    }
    text += "<tr><td style='padding-right: 50px;'>" + xtraDigit.concat(count) + "</td><td style='padding-right: 150px;'>" + doc.data().name + "</td><td>" + doc.data().highscore + "</td></tr>";
    count++;
}

// Iterate through the queried db
getDocs(leaders)
    .then((snapshot) => {
        document.querySelector('#leaderboard').style.display = "block";
        let highscores = []

        snapshot.docs.forEach((doc) => {
            highscores.push({ ...doc.data(), id: doc.id });
            renderLeaderboard(doc);
        })
        text += "</table>";
        outputTable.innerHTML = text;

        console.log(highscores);
    })
    .catch (err => {
        console.log(err.message);
    })

// Add highscore to db
const addScoreForm = document.querySelector(".addScore")
addScoreForm.addEventListener('submit', (e) => {
    e.preventDefault()

    addDoc(colRef, {
        name: addScoreForm.name.value.toUpperCase(),
        highscore: parseInt(document.querySelector('#score').innerText),
    })
    .then(() => {
        addScoreForm.reset()
        document.querySelector('#namePrompt').style.display = "none";
        window.location.reload();
    })
})