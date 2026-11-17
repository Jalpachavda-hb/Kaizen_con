# example.py
import os
from dotenv import load_dotenv
from io import BytesIO
import requests
from elevenlabs.client import ElevenLabs

load_dotenv()

elevenlabs = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY"),
)

audio_url = (
    "https://storage.googleapis.com/eleven-public-cdn/audio/marketing/nicole.mp3"
)
response = requests.get(audio_url)
audio_data = BytesIO(response.content)

# Transcribe with Speaker Diarization
transcription = elevenlabs.speech_to_text.convert(
    file=audio_data,
    model_id="scribe_v1",  # Scribe model
    tag_audio_events=True,  # Tag audio events like laughter, applause, etc.
    language_code="eng",  # Language of the audio file. If set to None, detected automatically.
    diarize=True,  # Annotate who is speaking (speaker_id)
)

print("Transcription Result:")
print("Text:", transcription.text)
if hasattr(transcription, "words") and transcription.words:
    print("\nSpeaker-Annotated Words:")
    current_speaker = None
    for word in transcription.words:
        spk = getattr(word, "speaker_id", "speaker_0")
        if spk != current_speaker:
            current_speaker = spk
            print(f"\n[{current_speaker}]: ", end="")
        print(word.text, end=" ")
    print()
else:
    print(transcription)

