// --- 1. PASSWORD SYSTEM ---
const sahiPassword = "Aditya"; 

function checkPassword() {
    let input = document.getElementById("passInput").value;
    if (input === sahiPassword) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-app").style.display = "block";
        sessionStorage.setItem("isLoggedIn", "true");
    } else {
        showCustomAlert("❌ Galat Password!", "Kripya sahi password daalein.");
    }
}

window.onload = function() {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-app").style.display = "block";
    }
}

function logout() {
    sessionStorage.clear();
    location.reload(); 
}

// --- 2. VIP ALERT ENGINE ---
let confirmAction = null; 

function showCustomAlert(title, message, isConfirm = false, onOk = null) {
    document.getElementById('alertTitle').innerText = title;
    document.getElementById('alertText').innerHTML = message;
    
    let overlay = document.getElementById('customAlertOverlay');
    let box = document.getElementById('customAlertBox');
    let cancelBtn = document.getElementById('alertCancelBtn');
    let okBtn = document.getElementById('alertOkBtn');

    if(isConfirm) {
        cancelBtn.style.display = "inline-block";
        confirmAction = onOk;
        okBtn.onclick = function() {
            if(confirmAction) confirmAction();
            closeAlert();
        };
    } else {
        cancelBtn.style.display = "none";
        okBtn.onclick = closeAlert;
    }

    overlay.style.display = "flex";
    setTimeout(() => { box.classList.add('show'); }, 10); 
}

function closeAlert() {
    let box = document.getElementById('customAlertBox');
    box.classList.remove('show'); 
    setTimeout(() => { 
        document.getElementById('customAlertOverlay').style.display = "none"; 
    }, 300);
}

// --- 3. INDEXEDDB (BADA GODAAM) SYSTEM ---
let db;
let currentFilesData = []; 

let request = indexedDB.open("AlmirahDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    let objectStore = db.createObjectStore("samaanStore", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
};

// File Select Handle Karna
document.getElementById('samaanFile').addEventListener('change', function(event) {
    currentFilesData = []; 
    let files = event.target.files;

    for(let i = 0; i < files.length; i++) {
        // Size check (Max 2MB per file)
        if(files[i].size > 2000000) {
            showCustomAlert("⚠️ Size Limit", "Ek ya usse zyada files bahut badi hain! Kripya 2MB se choti file chunein.");
            document.getElementById('samaanFile').value = "";
            currentFilesData = [];
            return;
        }

        let reader = new FileReader();
        reader.onload = function(e) {
            currentFilesData.push({
                fileName: files[i].name,
                fileType: files[i].type,
                fileData: e.target.result
            });
        };
        reader.readAsDataURL(files[i]);
    }
});

function samaanJodo() {
    let naamInput = document.getElementById("nayaNaam").value;
    let jagahInput = document.getElementById("nayiJagah").value;
    let msgBox = document.getElementById("saveMessage");

    if (naamInput === "" || jagahInput === "") {
        showCustomAlert("⚠️ Khali Dabbe!", "Samaan ka naam aur jagah bharna zaroori hai.");
        return;
    }

    let nayaSamaan = { 
        naam: naamInput, 
        jagah: jagahInput, 
        files: currentFilesData 
    };
    
    let transaction = db.transaction(["samaanStore"], "readwrite");
    let store = transaction.objectStore("samaanStore");
    store.add(nayaSamaan); 

    transaction.oncomplete = function() {
        document.getElementById("nayaNaam").value = "";
        document.getElementById("nayiJagah").value = "";
        document.getElementById("samaanFile").value = "";
        currentFilesData = []; 
        
        msgBox.innerHTML = "✅ Samaan Godaam mein save ho gaya!";
        msgBox.style.color = "#11998e";
        setTimeout(() => { msgBox.innerHTML = ""; }, 3000);
    };

    transaction.onerror = function() {
        showCustomAlert("❌ Error", "Samaan save nahi ho paya!");
    };
}

function khojo() {
    let searchInput = document.getElementById("searchBox").value.toLowerCase();
    let resultBox = document.getElementById("resultArea");
    resultBox.innerHTML = ""; 

    if (searchInput === "") {
        showCustomAlert("⚠️ Dhyan Dein", "Pahle dhoondhne ke liye kisi samaan ka naam likhiye!");
        return;
    }

    let transaction = db.transaction(["samaanStore"], "readonly");
    let store = transaction.objectStore("samaanStore");
    let request = store.getAll(); 

    request.onsuccess = function(event) {
        let saaraSamaan = event.target.result;
        let milaKya = false;

        for (let i = 0; i < saaraSamaan.length; i++) {
            if (saaraSamaan[i].naam.toLowerCase().includes(searchInput)) {
                
                let finalResult = "✅ Mil gaya! Yeh yahan hai: <br><br>📍 <b style='color:#ff416c;'>" + saaraSamaan[i].jagah + "</b><br><br>";

                if (saaraSamaan[i].files && saaraSamaan[i].files.length > 0) {
                    for(let j = 0; j < saaraSamaan[i].files.length; j++) {
                        let f = saaraSamaan[i].files[j];
                        if (f.fileType.includes("image")) {
                            finalResult += `<img src="${f.fileData}" style="max-width: 100%; border-radius: 8px; border: 2px solid #a1c4fd; margin-bottom: 10px;"><br>`;
                        } else if (f.fileType.includes("pdf")) {
                            finalResult += `<a href="${f.fileData}" download="${f.fileName}" style="display: inline-block; padding: 10px 15px; margin-bottom: 10px; background: linear-gradient(135deg, #b224ef, #7579ff); color: white; text-decoration: none; border-radius: 8px;">📄 ${f.fileName} Download</a><br>`;
                        }
                    }
                }

                // Delete Button
                finalResult += `<button onclick="deleteSamaan(${saaraSamaan[i].id})" style="background: linear-gradient(135deg, #ff416c, #ff4b2b); margin-top: 15px;">🗑️ Ise Delete Karein</button>`;

                resultBox.innerHTML = finalResult;
                milaKya = true;
                break;
            }
        }

        if (!milaKya) {
            showCustomAlert("❌ Nahi Mila", "Yeh samaan humari list mein nahi hai. Shayad kisi ne jagah badal di hai!");
        }
    };
}

function deleteSamaan(id) {
    showCustomAlert("⚠️ Dhyan Dein!", "Kya aap sach mein is samaan aur iski files ko hamesha ke liye delete karna chahte hain?", true, function() {
        let transaction = db.transaction(["samaanStore"], "readwrite");
        let store = transaction.objectStore("samaanStore");
        let request = store.delete(id);

        request.onsuccess = function() {
            let resultBox = document.getElementById("resultArea");
            resultBox.innerHTML = "🗑️ Samaan safaltapoorvak delete ho gaya!";
            resultBox.style.color = "#ff416c"; 
            document.getElementById("searchBox").value = ""; 
        };

        request.onerror = function() {
            showCustomAlert("❌ Error", "Delete nahi ho paya!");
        };
    });
}
