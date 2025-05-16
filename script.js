const fileInput = document.getElementById("file-input");
const passwordInput = document.getElementById("password");
const encryptBtn = document.getElementById("encrypt-btn");
const decryptBtn = document.getElementById("decrypt-btn");
const messageDiv = document.getElementById("message");

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function showMessage(msg, color = "black") {
  messageDiv.textContent = msg;
  messageDiv.style.color = color;
}

encryptBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  const password = passwordInput.value;

  if (!file) {
    showMessage("Please select a file to encrypt.", "red");
    return;
  }
  if (!password) {
    showMessage("Please enter a password.", "red");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      // Encrypt file content as Base64
      const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
      const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString();
      // Save encrypted file with .enc extension
      downloadFile(file.name + ".enc", encrypted);
      showMessage("File encrypted successfully!", "green");
    } catch (err) {
      showMessage("Encryption failed.", "red");
    }
  };
  reader.readAsArrayBuffer(file);
});

decryptBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  const password = passwordInput.value;

  if (!file) {
    showMessage("Please select an encrypted file to decrypt.", "red");
    return;
  }
  if (!password) {
    showMessage("Please enter a password.", "red");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const encryptedStr = new TextDecoder().decode(e.target.result);
      const decrypted = CryptoJS.AES.decrypt(encryptedStr, password);
      const typedArray = new Uint8Array(decrypted.sigBytes);

      for (let i = 0; i < decrypted.sigBytes; i++) {
        typedArray[i] = decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8) & 0xff;
      }
      downloadFile(file.name.replace(".enc", ""), typedArray);
      showMessage("File decrypted successfully!", "green");
    } catch (err) {
      showMessage("Decryption failed. Check password and file.", "red");
    }
  };
  reader.readAsArrayBuffer(file);
});
