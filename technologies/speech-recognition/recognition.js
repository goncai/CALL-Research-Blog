let API_KEY;
window.onload = function () {
  API_KEY = prompt("Please enter your API key:");
};

async function sendToAssemblyAI(audioBlob, API_KEY) {
  try {
    const wavBlob = await convertToWav(audioBlob);
    console.log("Uploading audio to AssemblyAI...");

    const audioFile = new File([wavBlob], "audio.wav", { type: "audio/wav" });

    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { Authorization: API_KEY },
      body: audioFile,
    });

    const uploadData = await uploadResponse.json();
    if (!uploadData.upload_url) {
      throw new Error("Failed to upload audio to AssemblyAI");
    }

    console.log("Audio uploaded successfully:", uploadData.upload_url);

    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        Authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio_url: uploadData.upload_url }),
    });

    const transcriptData = await transcriptResponse.json();
    console.log("AssemblyAI Response:", transcriptData);

    if (transcriptData.id) {
      console.log(`Job ID: ${transcriptData.id}, waiting for transcription...`);
      const transcription = await getTranscription(transcriptData.id, API_KEY);
      document.getElementById('speechRecognitionText').innerText = transcription;
    }
  } catch (error) {
    console.error("Error sending to AssemblyAI:", error);
  }
}

async function getTranscription(transcriptionId, API_KEY) {
  const POLL_INTERVAL = 1000; // Check every 1 second
  console.log(`Checking transcription status for Job ID: ${transcriptionId}`);
  while (true) {
    try {
      const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptionId}`, {
        method: "GET",
        headers: { Authorization: API_KEY },
      });

      const data = await response.json();

      if (data.status === "completed") {
        console.log("Transcription completed!");
        console.log("All Assembly AI data returned:", data);
        console.log("Transcript:", data.text);
        return data.text;
      } else if (data.status === "error") {
        console.error("Transcription failed:", data.error);
        return null;
      } else {
        console.log(`Status: ${data.status}... Waiting.`);
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }
    } catch (error) {
      console.error("Error checking transcription status:", error);
      return null;
    }
  }
}