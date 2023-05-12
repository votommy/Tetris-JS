import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.7.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.7.0/firebase-firestore.js';
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

console.log("test");

// self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
// Initialize services
initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider('6Ley3HIhAAAAANlShYkJQQtoCpeZbJLR00-HCVmM')
});
const db = getFirestore(firebaseApp);
const colRef = collection(db, 'highscores');
// Query db for top highscores
const leaders = query(colRef, orderBy('highscore', 'desc'), orderBy('timestamp'), limit(100));

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

    const timestampTooltip = new Date(doc.data().timestamp.seconds*1000).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    text += "<tr title='" + timestampTooltip + "'><td style='padding-right: 50px; padding-left: 15px;'>" + xtraDigit.concat(count) + "</td><td style='padding-right: 150px;'>" + doc.data().name + "</td><td style='padding-right: 15px;'>" + doc.data().highscore + "</td></tr>";
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
    })
    .catch (err => {
        console.log(err.message);
    })

// Add highscore to db
const addScoreForm = document.querySelector(".addScore")
addScoreForm.addEventListener('submit', (e) => {
    document.querySelector("#addScoreBtn").disabled = true; //Disable button so you can only submit once

    e.preventDefault()

    try {
        addDoc(colRef, {
        name: addScoreForm.name.value.toUpperCase(),
        highscore: parseInt(document.querySelector('#score').innerText),
        timestamp: serverTimestamp()
        })
        .then(() => {
            addScoreForm.reset()
            document.querySelector('#namePrompt').style.display = "none";
            window.location.reload();
        })
    }
    catch(err) {
        console.log(err.message);
    }
    
    // .catch (err => {
    //     console.log(err.message);
    // })
    
});
