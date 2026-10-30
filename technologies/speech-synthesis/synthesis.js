let API_KEY;
window.onload = function () {
API_KEY = prompt("Please enter your API key:");
};
function submitText() {
const input = document.getElementById("inputText").value;
document.getElementById("submittedText").textContent = input;
synthesiseSpeech(input); //
}
let synthesisURL= "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128"
function synthesiseSpeech(input) {
const url = synthesisURL;
const data = {
text: input,
model_id: "eleven_multilingual_v2",
};
fetch(url, {
method: "POST",
headers: {
"xi-api-key": API_KEY,
"Content-Type": "application/json",
},
body: JSON.stringify(data),
})
.then((response) => {
if (!response.ok) {
throw new Error(`HTTP error! Status: ${response.status}`);
}
return response.blob(); // Convert response to audio Blob
})
.then((blob) => {
const audioUrl = URL.createObjectURL(blob);
const audioElement = document.getElementById("synthesisAudio");
audioElement.src = audioUrl;
audioElement.play(); // Play the generated speech
})
.catch((error) => console.error("Error:", error));
}
