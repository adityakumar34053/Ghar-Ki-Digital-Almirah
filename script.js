// Password System
const sahiPassword = "Aditya"; // Yahan aap apna manpasand password likh sakte hain

function checkPassword() {
    let input = document.getElementById("passInput").value;
    let error = document.getElementById("loginError");

    if (input === sahiPassword) {
        // Agar password sahi hai toh login screen chhupao aur app dikhao
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-app").style.display = "block";
        
        // Yaad rakhne ke liye ki login ho chuka hai (session)
        sessionStorage.setItem("isLoggedIn", "true");
    } else {
        error.innerHTML = "❌ Galat Password! Dubara koshish karein.";
    }
}

// Page refresh hone par check karein ki kya pehle se logged in hain
window.onload = function() {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-app").style.display = "block";
    }
}

function logout() {
    sessionStorage.clear();
    location.reload(); // Page refresh karke wapas login screen par le jayega
}

// --- Aapka purana IndexedDB aur Khojo/SamaanJodo wala code yahan se niche rahega ---



// script.js - Delete Feature aur IndexedDB ke sath

let db;
let currentFilesData = []; // Ek sath kai files save karne ke liye list

// 1. Browser ke andar 'AlmirahDB' naam ka Database (Godaam) banana
let request = indexedDB.open("AlmirahDB", 1);

// Agar pehli baar app khul rahi hai, toh naya dabba (Object Store) banega
request.onupgradeneeded = function(event) {
    db = event.target.result;
    // 'samaanStore' naam ka ek dabba banaya jisme har samaan ko ek unique ID milegi
    let objectStore = db.createObjectStore("samaanStore", { keyPath: "id", autoIncrement: true });
};

// Jab database successfully open ho jaye
request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Database Ready Hai!");
};

// 2. Ek sath kai files ko select karna aur padhna
document.getElementById('samaanFile').addEventListener('change', function(event) {
    currentFilesData = []; // Purani files hata do
    let files = event.target.files;

    for(let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onload = function(e) {
            // Har file ka naam, type aur data list mein jod do
            currentFilesData.push({
                fileName: files[i].name,
                fileType: files[i].type,
                fileData: e.target.result
            });
        };
        reader.readAsDataURL(files[i]);
    }
});

// 3. Naya Samaan Database mein Save karna
function samaanJodo() {
    let naamInput = document.getElementById("nayaNaam").value;
    let jagahInput = document.getElementById("nayiJagah").value;
    let msgBox = document.getElementById("saveMessage");

    if (naamInput === "" || jagahInput === "") {
        msgBox.innerHTML = "⚠️ Naam aur Jagah bharna zaroori hai!";
        msgBox.style.color = "red";
        return;
    }

    let nayaSamaan = { 
        naam: naamInput, 
        jagah: jagahInput, 
        files: currentFilesData // Saari files isme pack ho gayin
    };
    
    // Database mein add karne ka process (Transaction)
    let transaction = db.transaction(["samaanStore"], "readwrite");
    let store = transaction.objectStore("samaanStore");
    store.add(nayaSamaan); // Godaam mein daal diya

    // Jab successfully save ho jaye
    transaction.oncomplete = function() {
        document.getElementById("nayaNaam").value = "";
        document.getElementById("nayiJagah").value = "";
        document.getElementById("samaanFile").value = "";
        currentFilesData = []; // Memory clear
        
        msgBox.innerHTML = "✅ Samaan aur saari files Godaam mein save ho gayin!";
        msgBox.style.color = "green";
        setTimeout(() => { msgBox.innerHTML = ""; }, 3000);
    };

    transaction.onerror = function() {
        msgBox.innerHTML = "❌ Error: Save nahi ho paya!";
        msgBox.style.color = "red";
    };
}

// 4. Database se Samaan Dhoondhna
function khojo() {
    let searchInput = document.getElementById("searchBox").value.toLowerCase();
    let resultBox = document.getElementById("resultArea");
    resultBox.innerHTML = ""; // Purana result clear karo

    if (searchInput === "") {
        resultBox.innerHTML = "⚠️ Pahle kisi samaan ka naam likhiye!";
        resultBox.style.color = "red";
        return;
    }

    let transaction = db.transaction(["samaanStore"], "readonly");
    let store = transaction.objectStore("samaanStore");
    let request = store.getAll(); // Godaam se saara samaan nikal lo

    request.onsuccess = function(event) {
        let saaraSamaan = event.target.result;
        let milaKya = false;

        for (let i = 0; i < saaraSamaan.length; i++) {
            if (saaraSamaan[i].naam.toLowerCase().includes(searchInput)) {
                
                let finalResult = "✅ Mil gaya! Yeh yahan hai: <br><br>📍 <b>" + saaraSamaan[i].jagah + "</b><br><br>";

                // Agar is samaan ke sath files hain, toh sabko dikhao
                if (saaraSamaan[i].files && saaraSamaan[i].files.length > 0) {
                    for(let j = 0; j < saaraSamaan[i].files.length; j++) {
                        let f = saaraSamaan[i].files[j];
                        if (f.fileType.includes("image")) {
                            finalResult += `<img src="${f.fileData}" style="max-width: 100%; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 10px;"><br>`;
                        } else if (f.fileType.includes("pdf")) {
                            finalResult += `<a href="${f.fileData}" download="${f.fileName}" style="display: inline-block; padding: 10px 15px; margin-bottom: 10px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">📄 ${f.fileName} Download</a><br>`;
                        }
                    }
                }

                // NAYA CODE: Delete Button Add Karna
                // Har samaan ki ek unique ID hoti hai (saaraSamaan[i].id), wahi ID hum delete function ko de rahe hain
                finalResult += `<button onclick="deleteSamaan(${saaraSamaan[i].id})" style="background-color: #dc3545; margin-top: 15px;">🗑️ Ise Delete Karein</button>`;

                resultBox.innerHTML = finalResult;
                resultBox.style.color = "green";
                milaKya = true;
                break;
            }
        }

        if (!milaKya) {
            resultBox.innerHTML = "❌ Yeh samaan humari list mein nahi mila!";
            resultBox.style.color = "red";
        }
    };
}

// 5. NAYA FUNCTION: Samaan ko Database se hamesha ke liye udana (Delete karna)
function deleteSamaan(id) {
    // Confirm box dikhana taki galti se delete na ho jaye
    let confirmDelete = confirm("⚠️ Kya aap sach mein is samaan aur iski files ko hamesha ke liye delete karna chahte hain?");
    
    if (confirmDelete) {
        let transaction = db.transaction(["samaanStore"], "readwrite");
        let store = transaction.objectStore("samaanStore");
        let request = store.delete(id); // ID ke hisaab se delete kar diya

        request.onsuccess = function() {
            let resultBox = document.getElementById("resultArea");
            resultBox.innerHTML = "🗑️ Samaan aur files safaltapoorvak delete ho gayin!";
            resultBox.style.color = "red"; 
            document.getElementById("searchBox").value = ""; // Search box khali kar diya
        };

        request.onerror = function() {
            alert("❌ Error: Delete nahi ho paya!");
        };
    }
}
