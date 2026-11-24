import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";
import logoUrl from "../../assets/images/logokaizecon.png";
import {
  transcribeAudio,
  groupWordsIntoSpeakerTurns,
  formatTimestamp,
  getElevenLabsApiKey,
  setElevenLabsApiKey,
  TranscriptionResponse,
  DiarizedTurn,
} from "../../services/elevenlabsService";
import { generateClinicalSummary } from "../../api/ApiPath";
import {
  MicrophoneIcon,
  WaveformIcon,
  AudioSpeakerIcon,
  PlayIcon,
  StopIcon,
  CloudUploadIcon,
} from "../../icons/conferenceIcons";

type InputTab = "record" | "upload";
type ViewTab = "formatted" | "plain";
type LiveTurn = DiarizedTurn & { pending?: boolean };

// Live slicing tuning (audio is cut at natural pauses for ElevenLabs Scribe)
const SPEECH_RMS_THRESHOLD = 0.012; // RMS above this counts as voice
const SILENCE_CUT_SECONDS = 0.7; // pause length that ends a phrase
const MIN_SLICE_SECONDS = 1.2; // don't send tiny fragments
const MAX_SLICE_SECONDS = 12; // force a cut during long continuous speech
const PRE_ROLL_SECONDS = 0.3; // audio kept before speech starts

/**
 * Encode raw single-channel 32-bit Float PCM samples into a valid 16-bit PCM WAV Blob
 */
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");

  // fmt subchunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * 1 * 16/8)
  view.setUint16(32, 2, true); // BlockAlign (1 * 16/8)
  view.setUint16(34, 16, true); // BitsPerSample

  // data subchunk
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);

  // Write clamped 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export default function LiveTranscriptPage() {
  const { success, error: toastError, info } = useToast();

  // API Key State (loaded strictly from .env or localStorage)
  const [apiKey, setApiKeyState] = useState<string>(getElevenLabsApiKey());
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>("");

  // Input Selection Tab
  const [activeTab, setActiveTab] = useState<InputTab>("record");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Live Microphone & Streaming Recognition State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [liveInterimText, setLiveInterimText] = useState<string>("");
  const [liveDraftText, setLiveDraftText] = useState<string>("");
  const transcriptBodyRef = useRef<HTMLDivElement | null>(null);

  // Transcript Turns (Single Speaker)
  const [turns, setTurns] = useState<LiveTurn[]>([]);

  // ElevenLabs STT State (for File Upload / Audio URL)
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionResult, setTranscriptionResult] =
    useState<TranscriptionResponse | null>(null);

  // Audio Playback Preview
  const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Clinical Summary API State
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [clinicalSummary, setClinicalSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // View & Filters
  const [viewTab, setViewTab] = useState<ViewTab>("formatted");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Audio & Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sampleRateRef = useRef<number>(44100);

  // Current audio slice (cut at natural pauses, sent to ElevenLabs Scribe)
  const sliceChunksRef = useRef<Float32Array[]>([]);
  const sliceSamplesRef = useRef<number>(0);
  const sliceStartSampleRef = useRef<number>(0);
  const sliceHasSpeechRef = useRef<boolean>(false);
  const silenceSamplesRef = useRef<number>(0);
  const sessionSamplesRef = useRef<number>(0);
  const allSessionSamplesRef = useRef<Float32Array[]>([]);

  // Browser (Web Speech) instant text not yet attached to a Scribe slice
  const draftFinalRef = useRef<string>("");
  const interimRef = useRef<string>("");
  const consumedInterimRef = useRef<string>("");
  const lastBrowserTurnEndRef = useRef<number>(0);
  const webSpeechDisabledRef = useRef<boolean>(false);
  const webSpeechFailuresRef = useRef<number>(0);

  // ElevenLabs Scribe live state
  const scribeEnabledRef = useRef<boolean>(false);
  const scribeKeyRef = useRef<string>("");
  const scribeFailuresRef = useRef<number>(0);

  // Keep refs synchronized
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Sync API Key from environment on mount
  useEffect(() => {
    const key = getElevenLabsApiKey();
    if (key && key !== apiKey) {
      setApiKeyState(key);
    }
  }, []);

  // Auto-scroll the transcript to the newest words while recording
  useEffect(() => {
    const el = transcriptBodyRef.current;
    if (el && isRecordingRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [turns, liveDraftText, liveInterimText]);

  const makeTurnId = () =>
    `turn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Commit browser-only text as a final turn (used when Scribe is unavailable)
  const commitBrowserTurn = useCallback((text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    const nowSecs = sessionSamplesRef.current / sampleRateRef.current;
    const startTime = lastBrowserTurnEndRef.current;
    const endTime = Math.max(startTime + 1, nowSecs);
    lastBrowserTurnEndRef.current = endTime;
    setTurns((prev) => [
      ...prev,
      {
        id: makeTurnId(),
        speakerId: "speaker_0",
        speakerName: "Speaker",
        startTime,
        endTime,
        text: cleanText,
        words: [],
        audioEvents: [],
      },
    ]);
  }, []);

  /**
   * Cut the current audio slice and send it to ElevenLabs Scribe.
   * The browser's instant text for this slice is shown immediately and then
   * replaced in place by the more accurate Scribe text (no duplicates).
   */
  const flushSlice = useCallback(() => {
    const chunks = sliceChunksRef.current;
    const total = sliceSamplesRef.current;
    const hadSpeech = sliceHasSpeechRef.current;
    const sr = sampleRateRef.current;
    const startTime = sliceStartSampleRef.current / sr;
    const endTime = startTime + total / sr;

    sliceChunksRef.current = [];
    sliceSamplesRef.current = 0;
    sliceHasSpeechRef.current = false;
    silenceSamplesRef.current = 0;
    sliceStartSampleRef.current = sessionSamplesRef.current;

    // Instant browser text that belongs to this slice (used as a fallback)
    let fallback = draftFinalRef.current.trim();
    if (interimRef.current.trim()) {
      fallback = `${fallback} ${interimRef.current.trim()}`.trim();
      consumedInterimRef.current = interimRef.current.trim();
      interimRef.current = "";
      setLiveInterimText("");
    }
    draftFinalRef.current = "";
    setLiveDraftText("");

    const sendToScribe = scribeEnabledRef.current && hadSpeech && total >= sr * 0.4;
    if (!sendToScribe && !fallback) return;

    const turnId = makeTurnId();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        speakerId: "speaker_0",
        speakerName: "Speaker",
        startTime,
        endTime,
        text: fallback,
        words: [],
        audioEvents: [],
        pending: sendToScribe,
      },
    ]);
    if (!sendToScribe) return;

    const merged = new Float32Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const finalize = (scribeText: string) => {
      setTurns((prev) =>
        prev.flatMap((t) => {
          if (t.id !== turnId) return [t];
          const text = scribeText || t.text;
          return text ? [{ ...t, text, pending: false }] : [];
        })
      );
    };

    transcribeAudio(encodeWAV(merged, sr), {
      apiKey: scribeKeyRef.current,
      modelId: "scribe_v1",
      diarize: false,
      tagAudioEvents: false,
      languageCode: "eng",
    })
      .then((res) => {
        scribeFailuresRef.current = 0;
        const cleanText = (res.text || "")
          .replace(/\[.*?\]|\(.*?\)/g, "")
          .replace(/\s+/g, " ")
          .trim();
        finalize(cleanText.length > 1 ? cleanText : "");
      })
      .catch((err: any) => {
        console.warn("ElevenLabs Scribe slice failed:", err);
        finalize("");
        scribeFailuresRef.current += 1;
        if (scribeFailuresRef.current === 1) {
          toastError(`ElevenLabs Scribe: ${err?.message || "transcription failed"}`);
        }
        if (scribeFailuresRef.current >= 3 && scribeEnabledRef.current) {
          // Stop calling a failing API; keep browser live text instead
          scribeEnabledRef.current = false;
          info("ElevenLabs Scribe unavailable — continuing with browser live transcription.");
        }
      });
  }, [info, toastError]);

  // Remove words already attached to a previous slice from new browser text
  const stripConsumed = (text: string, consumed: string): string => {
    if (!consumed) return text;
    const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
    const words = text.trim().split(/\s+/);
    const used = consumed.trim().split(/\s+/);
    let i = 0;
    while (i < used.length && i < words.length && norm(words[i]) === norm(used[i])) i++;
    return i === used.length ? words.slice(i).join(" ") : text.trim();
  };

  // Handle a finalized phrase from the browser speech engine
  const addBrowserFinal = useCallback(
    (text: string) => {
      const clean = stripConsumed(text, consumedInterimRef.current).trim();
      consumedInterimRef.current = "";
      if (!clean) return;
      if (scribeEnabledRef.current) {
        draftFinalRef.current = `${draftFinalRef.current} ${clean}`.trim();
        setLiveDraftText(draftFinalRef.current);
      } else {
        commitBrowserTurn(clean);
      }
    },
    [commitBrowserTurn]
  );

  // Clean up AudioContext & Speech Recognition on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (scriptProcessorRef.current) {
        try {
          scriptProcessorRef.current.disconnect();
        } catch {
          // ignore
        }
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close().catch(() => { });
    };
  }, []);

  /**
   * Start/restart Web Speech API recognition (instant on-screen words)
   */
  const startWebSpeech = useCallback(() => {
    if (!isRecordingRef.current || webSpeechDisabledRef.current) return;
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    // Detach and stop any previous instance so it can't trigger a restart loop
    const old = recognitionRef.current;
    if (old) {
      old.onend = null;
      old.onresult = null;
      old.onerror = null;
      try {
        old.abort();
      } catch {
        // ignore
      }
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      const navLang = navigator.language || "en-US";
      recognition.lang = navLang.toLowerCase().startsWith("en") ? navLang : "en-US";
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        webSpeechFailuresRef.current = 0;
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || "";
          if (res.isFinal) {
            addBrowserFinal(text);
          } else {
            interim += text;
          }
        }
        interimRef.current = stripConsumed(interim, consumedInterimRef.current);
        setLiveInterimText(interimRef.current);
      };

      recognition.onerror = (event: any) => {
        const err = event?.error;
        if (err === "no-speech" || err === "aborted") return;
        console.warn("Speech recognition error:", err);
        if (err === "not-allowed" || err === "service-not-allowed") {
          webSpeechDisabledRef.current = true;
          if (!scribeEnabledRef.current) {
            toastError("Browser speech recognition was blocked. Allow microphone access or add an ElevenLabs API key.");
          }
        } else if (err === "network") {
          webSpeechFailuresRef.current += 1;
          if (webSpeechFailuresRef.current >= 3) {
            webSpeechDisabledRef.current = true;
            if (scribeEnabledRef.current) {
              info("Browser instant preview unavailable — words will appear from ElevenLabs Scribe after each pause.");
            } else {
              toastError("Browser speech service is unreachable (network). Add an ElevenLabs API key to transcribe.");
            }
          }
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current && !webSpeechDisabledRef.current) {
          setTimeout(() => startWebSpeech(), 300);
        }
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition start skipped:", err);
    }
  }, [addBrowserFinal, info, toastError]);

  /**
   * Start Live Microphone: Dual Engine Real-Time Transcription
   * Engine 1: Web Speech API — instant word-by-word text on screen
   * Engine 2: ElevenLabs Scribe — each spoken phrase (cut at natural pauses)
   *           is transcribed and replaces the instant text in place
   */
  const startRecording = async () => {
    const hasWebSpeech = !!(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    const key = (apiKey || getElevenLabsApiKey()).trim();
    if (!hasWebSpeech && !key) {
      toastError("This browser has no live speech recognition. Add an ElevenLabs API key or use Chrome/Edge.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx: AudioContext = new AudioCtx();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === "suspended") await audioCtx.resume();
      const sr = audioCtx.sampleRate;
      sampleRateRef.current = sr;

      const source = audioCtx.createMediaStreamSource(stream);
      const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;
      const zeroGain = audioCtx.createGain();
      zeroGain.gain.value = 0;
      source.connect(scriptProcessor);
      scriptProcessor.connect(zeroGain);
      zeroGain.connect(audioCtx.destination);

      // Reset all session state
      scribeKeyRef.current = key;
      scribeEnabledRef.current = !!key;
      scribeFailuresRef.current = 0;
      webSpeechDisabledRef.current = false;
      webSpeechFailuresRef.current = 0;
      sliceChunksRef.current = [];
      sliceSamplesRef.current = 0;
      sliceStartSampleRef.current = 0;
      sliceHasSpeechRef.current = false;
      silenceSamplesRef.current = 0;
      sessionSamplesRef.current = 0;
      allSessionSamplesRef.current = [];
      draftFinalRef.current = "";
      interimRef.current = "";
      consumedInterimRef.current = "";
      lastBrowserTurnEndRef.current = 0;
      setLiveDraftText("");
      setLiveInterimText("");
      setTranscriptionResult(null);

      scriptProcessor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return;
        const copy = new Float32Array(e.inputBuffer.getChannelData(0));
        allSessionSamplesRef.current.push(copy);

        // RMS volume for the meter + speech detection
        let sumSquares = 0;
        for (let i = 0; i < copy.length; i++) sumSquares += copy[i] * copy[i];
        const rms = Math.sqrt(sumSquares / copy.length);
        setAudioLevel(Math.min(100, Math.round(rms * 450)));
        const isSpeech = rms > SPEECH_RMS_THRESHOLD;

        // Append to the current slice
        if (sliceSamplesRef.current === 0) {
          sliceStartSampleRef.current = sessionSamplesRef.current;
        }
        sliceChunksRef.current.push(copy);
        sliceSamplesRef.current += copy.length;
        sessionSamplesRef.current += copy.length;

        if (!sliceHasSpeechRef.current) {
          if (isSpeech) {
            sliceHasSpeechRef.current = true;
            silenceSamplesRef.current = 0;
          } else {
            // Leading silence: keep only a short pre-roll before speech
            while (
              sliceChunksRef.current.length > 1 &&
              sliceSamplesRef.current - sliceChunksRef.current[0].length >= sr * PRE_ROLL_SECONDS
            ) {
              const dropped = sliceChunksRef.current.shift()!;
              sliceSamplesRef.current -= dropped.length;
              sliceStartSampleRef.current += dropped.length;
            }
            return;
          }
        } else if (isSpeech) {
          silenceSamplesRef.current = 0;
        } else {
          silenceSamplesRef.current += copy.length;
        }

        const sliceSecs = sliceSamplesRef.current / sr;
        const silenceSecs = silenceSamplesRef.current / sr;
        if (
          (silenceSecs >= SILENCE_CUT_SECONDS && sliceSecs >= MIN_SLICE_SECONDS) ||
          sliceSecs >= MAX_SLICE_SECONDS
        ) {
          flushSlice();
        }
      };

      setIsRecording(true);
      isRecordingRef.current = true;
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      startWebSpeech();

      info(
        key
          ? "Microphone active! Speak now — words appear live and are refined by ElevenLabs Scribe."
          : "Microphone active (browser speech only — add an ElevenLabs key for Scribe accuracy)."
      );
    } catch (err: any) {
      console.error("Microphone access error:", err);
      toastError(err?.message || "Failed to access microphone. Please allow microphone permissions.");
    }
  };

  /**
   * Stop Live Recording & Finalize Transcript
   */
  const stopRecording = () => {
    if (!isRecordingRef.current) return;
    setIsRecording(false);
    isRecordingRef.current = false;
    setAudioLevel(0);

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.onaudioprocess = null;
      try {
        scriptProcessorRef.current.disconnect();
      } catch {
        // ignore
      }
    }

    // Finalize the trailing audio + any instant text still on screen
    if (scribeEnabledRef.current) {
      flushSlice();
    } else {
      const remaining = `${draftFinalRef.current} ${interimRef.current}`.trim();
      draftFinalRef.current = "";
      interimRef.current = "";
      setLiveDraftText("");
      setLiveInterimText("");
      commitBrowserTurn(remaining);
    }

    // Build full audio playback from all recorded samples
    const sr = sampleRateRef.current;
    if (allSessionSamplesRef.current.length > 0) {
      let fullLength = 0;
      for (const c of allSessionSamplesRef.current) fullLength += c.length;
      const fullBuffer = new Float32Array(fullLength);
      let off = 0;
      for (const c of allSessionSamplesRef.current) {
        fullBuffer.set(c, off);
        off += c.length;
      }
      setActiveAudioSrc(URL.createObjectURL(encodeWAV(fullBuffer, sr)));
    }

    audioContextRef.current?.close().catch(() => { });
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());

    success("Recording stopped. Transcript finalized.");
  };

  /**
   * Clear All Transcripts to start fresh
   */
  const handleClearTranscript = () => {
    if (isRecording) {
      stopRecording();
    }
    setTurns([]);
    setLiveInterimText("");
    setLiveDraftText("");
    setClinicalSummary(null);
    setTranscriptionResult(null);
    setActiveAudioSrc(null);
    info("Transcript cleared.");
  };

  /**
   * Transcribe Audio File / URL via ElevenLabs Scribe STT
   */
  const handleTranscribeBatch = async () => {
    const currentKey = apiKey || getElevenLabsApiKey();
    if (!currentKey) {
      setTempApiKey("");
      setShowApiKeyModal(true);
      toastError("Please provide an ElevenLabs API Key to start transcription.");
      return;
    }

    setIsTranscribing(true);

    try {
      let audioBlobToSend: Blob | null = null;

      if (activeTab === "upload") {
        if (!selectedFile) {
          toastError("Please select an audio file first.");
          setIsTranscribing(false);
          return;
        }
        audioBlobToSend = selectedFile;
      }

      if (!audioBlobToSend) {
        toastError("No audio source selected.");
        setIsTranscribing(false);
        return;
      }

      info("Transcribing audio with ElevenLabs Scribe...");
      const response = await transcribeAudio(audioBlobToSend, {
        apiKey: currentKey,
        modelId: "scribe_v1",
        diarize: false,
        tagAudioEvents: true,
        languageCode: "eng",
      });

      setTranscriptionResult(response);

      // Convert response into turns
      if (response.words && response.words.length > 0) {
        const batchTurns = groupWordsIntoSpeakerTurns(response.words);
        setTurns(batchTurns);
      } else if (response.text) {
        setTurns([
          {
            id: `turn_${Date.now()}`,
            speakerId: "speaker_0",
            speakerName: "Speaker",
            startTime: 0,
            endTime: response.audio_duration_secs || 0,
            text: response.text,
            words: [],
            audioEvents: [],
          },
        ]);
      }

      success("ElevenLabs speech-to-text completed successfully!");
    } catch (err: any) {
      console.error("Transcription error:", err);
      toastError(err.message || "Failed to transcribe audio. Check your API key and quota.");
    } finally {
      setIsTranscribing(false);
    }
  };

  // Save API Key modal handler
  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setElevenLabsApiKey(trimmed);
    setApiKeyState(trimmed);
    setShowApiKeyModal(false);
    success("ElevenLabs API Key saved successfully!");
  };

  // Seek audio playback
  const handleSeekAudio = (timeInSeconds: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = timeInSeconds;
      audioPlayerRef.current.play().catch(() => { });
      setIsPlayingAudio(true);
    }
  };

  // Build clean full transcript text string (single speaker)
  const fullTranscriptText = useMemo(() => {
    const parts: string[] = [];
    const committed = turns.map((t) => t.text.trim()).filter(Boolean);
    if (committed.length > 0) {
      parts.push(committed.join("\n\n"));
    }
    const live = `${liveDraftText} ${liveInterimText}`.trim();
    if (live) {
      parts.push(live);
    }
    return parts.join("\n\n");
  }, [turns, liveDraftText, liveInterimText]);

  const hasLiveText = !!`${liveDraftText}${liveInterimText}`.trim();

  // Copy full transcript to clipboard
  const handleCopyTranscript = () => {
    if (!fullTranscriptText) {
      toastError("No transcript text to copy.");
      return;
    }
    navigator.clipboard.writeText(fullTranscriptText);
    success("Transcript copied to clipboard!");
  };

  // Download transcript as text file
  const handleDownloadText = () => {
    if (!fullTranscriptText) {
      toastError("No transcript text to download.");
      return;
    }
    const blob = new Blob([fullTranscriptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    success("Transcript downloaded as .txt");
  };

  // Call Clinical Summary API (POST /api/clinical/summary)
  const handleGenerateClinicalSummary = async () => {
    const textToSend = fullTranscriptText.trim();
    if (!textToSend) {
      toastError("No transcript available. Please speak or upload audio first.");
      return;
    }

    setIsGeneratingSummary(true);
    try {
      info("Sending transcript to Clinical Summary API...");
      const res = await generateClinicalSummary(textToSend);
      const summaryText =
        res?.data?.summary ||
        res?.summary ||
        res?.result ||
        (typeof res === "string" ? res : JSON.stringify(res?.data || res));

      setClinicalSummary(summaryText);
      setShowSummaryModal(true);
      success(res?.success_message || "Clinical summary generated successfully!");
    } catch (err: any) {
      console.error("Clinical summary generation failed:", err);
      toastError(err.message || "Failed to generate clinical summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopySummary = () => {
    if (!clinicalSummary) return;
    navigator.clipboard.writeText(clinicalSummary);
    success("Clinical summary copied to clipboard!");
  };

  const handleDownloadSummary = () => {
    if (!clinicalSummary) return;
    const blob = new Blob([clinicalSummary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clinical_summary_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    success("Clinical summary downloaded as .txt");
  };

  // Filtered turns based on search
  const filteredTurns = useMemo(() => {
    return turns.filter((turn) => {
      return (
        !searchQuery ||
        turn.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [turns, searchQuery]);

  return (
    <>
      <PageMeta
        title="Live Transcript (Real-Time Speech-to-Text) | KaizenCon Admin"
        description="Real-time conference live audio transcription and clinical summary."
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-outfit flex flex-col">
        {/* Top Standalone Header Navbar (No Sidebar) */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3.5">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={logoUrl}
                alt="Kaizen Con 2027"
                className="h-8 sm:h-9 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.tried1) {
                    target.dataset.tried1 = "true";
                    target.src = "/assets/logokaizecon-CnNRsUqz.png";
                    return;
                  }
                  if (!target.dataset.tried2) {
                    target.dataset.tried2 = "true";
                    target.src = "/images/logokaizecon.png";
                    return;
                  }
                  target.style.display = "none";
                }}
              />
            </Link>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>Live Speech-to-Text Studio</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time Speech</span>
                </span>
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 hidden md:block">
                Direct live conference speech transcription
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Close Window / Tab Button */}
            <button
              type="button"
              onClick={() => window.close()}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Close this tab"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Full-Width Main Content */}
        <main className="flex-1 w-full max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* MAIN GRID: AUDIO INPUT CARD & TRANSCRIPTION DISPLAY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: AUDIO INPUT & CONTROLS (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Audio Source Tabs Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <WaveformIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Audio Source</span>
                  </h3>
                  <div className="flex p-0.5 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveTab("record")}
                      className={`px-3 py-1 rounded-md transition-all ${activeTab === "record"
                        ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      Live Mic
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("upload")}
                      className={`px-3 py-1 rounded-md transition-all ${activeTab === "upload"
                        ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      File Upload
                    </button>
                  </div>
                </div>

                {/* TAB 1: LIVE MICROPHONE REAL-TIME DICTATION */}
                {activeTab === "record" && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 flex flex-col items-center justify-center text-center">
                      {/* Live Visualizer Wave */}
                      <div className="relative mb-4 flex items-center justify-center">
                        <div
                          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                            isRecording
                              ? audioLevel > 5
                                ? "bg-emerald-500/15 text-emerald-600 ring-8 ring-emerald-500/25 animate-pulse"
                                : "bg-rose-500/10 text-rose-600 ring-8 ring-rose-500/20 animate-pulse"
                              : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          <MicrophoneIcon className="w-10 h-10" />
                        </div>
                        {isRecording && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
                          </span>
                        )}
                      </div>

                      {/* Timer & Live Status */}
                      <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white mb-1">
                        {formatTimestamp(recordingSeconds)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-3">
                        {isRecording
                          ? "Listening to speech... Spoken words will appear live on the right screen"
                          : "Click below to begin live real-time transcription"}
                      </p>

                      {/* Volume Indicator Bar */}
                      {isRecording && (
                        <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden shadow-inner">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-75 ${
                              audioLevel > 5 ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.max(6, audioLevel)}%` }}
                          />
                        </div>
                      )}

                      {/* Primary Toggle: Start / Stop Live Dictation */}
                      <div className="flex items-center gap-3">
                        {!isRecording ? (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                          >
                            <MicrophoneIcon className="w-5 h-5" />
                            <span>Start Live Speaking</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-md transition-all cursor-pointer"
                          >
                            <StopIcon className="w-5 h-5 text-rose-500" />
                            <span>Stop Speaking</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reset / Clear Button */}
                    {turns.length > 0 && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleClearTranscript}
                          className="text-xs text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Clear Current Transcript
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: AUDIO FILE UPLOAD */}
                {activeTab === "upload" && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-gray-50/50 dark:bg-gray-750">
                      <input
                        type="file"
                        id="audioFileInput"
                        className="hidden"
                        accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setSelectedFile(file);
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setActiveAudioSrc(url);
                          }
                        }}
                      />
                      <label
                        htmlFor="audioFileInput"
                        className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <CloudUploadIcon className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          {selectedFile ? selectedFile.name : "Click to select conference audio"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {selectedFile
                            ? `Size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                            : "Supports MP3, WAV, M4A, AAC, WEBM, OGG"}
                        </div>
                      </label>
                    </div>

                    {/* Transcribe Batch Button */}
                    <button
                      type="button"
                      onClick={handleTranscribeBatch}
                      disabled={isTranscribing || !selectedFile}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${isTranscribing || !selectedFile
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                        }`}
                    >
                      {isTranscribing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Transcribing with ElevenLabs Scribe...</span>
                        </>
                      ) : (
                        <>
                          <WaveformIcon className="w-5 h-5" />
                          <span>Convert Audio to Text</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* AUDIO PREVIEW PLAYER */}
                {activeAudioSrc && (
                  <div className="mt-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-750 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                        <AudioSpeakerIcon className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Audio Playback</span>
                        {isPlayingAudio && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 animate-pulse font-medium">
                            Playing
                          </span>
                        )}
                      </span>
                      <span className="font-mono">
                        {formatTimestamp(audioCurrentTime)} /{" "}
                        {isFinite(audioDuration) && audioDuration > 0
                          ? formatTimestamp(audioDuration)
                          : "--:--"}
                      </span>
                    </div>
                    <audio
                      ref={audioPlayerRef}
                      src={activeAudioSrc}
                      controls
                      className="w-full h-8"
                      onTimeUpdate={(e) => {
                        const target = e.currentTarget;
                        setAudioCurrentTime(target.currentTime);
                      }}
                      onLoadedMetadata={(e) => {
                        const target = e.currentTarget;
                        setAudioDuration(target.duration);
                      }}
                      onPlay={() => setIsPlayingAudio(true)}
                      onPause={() => setIsPlayingAudio(false)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: REAL-TIME STREAMING TRANSCRIPT OUTPUT (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col min-h-[620px]">
              {/* Output Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Live Transcript</span>
                    {isRecording && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>LIVE</span>
                      </span>
                    )}
                    {isTranscribing && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>Transcribing...</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {isRecording
                      ? "Listening to speech... Spoken words will appear live below"
                      : transcriptionResult
                        ? `Duration: ${formatTimestamp(
                          transcriptionResult.audio_duration_secs || 0
                        )} • Language: ${transcriptionResult.language_code || "eng"}`
                        : turns.length > 0
                          ? `${turns.length} dialogue turns captured`
                          : "Spoken dialogue will be transcribed directly here"}
                  </p>
                </div>

                {/* View Mode Tabs */}
                <div className="flex items-center gap-2">
                  <div className="flex p-0.5 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewTab("formatted")}
                      className={`px-2.5 py-1 rounded-md transition-all ${viewTab === "formatted"
                        ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      Formatted
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewTab("plain")}
                      className={`px-2.5 py-1 rounded-md transition-all ${viewTab === "plain"
                        ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      Plain Text
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              {(turns.length > 0 || isRecording) && (
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-750/30 flex items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    Transcript Content
                  </span>
                  <input
                    type="text"
                    placeholder="Search spoken words..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56"
                  />
                </div>
              )}

              {/* TRANSCRIPT BODY */}
              <div ref={transcriptBodyRef} className="flex-1 p-4 sm:p-5 overflow-y-auto max-h-[550px] scroll-smooth">
                {/* Empty State */}
                {turns.length === 0 && !isRecording && !isTranscribing && (
                  <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-400">
                      <WaveformIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        No Transcription Yet
                      </h4>
                      <p className="text-xs text-gray-400 max-w-sm mt-1">
                        Click &quot;Start Live Speaking&quot; on the left to begin. Your words will appear live on this screen as you speak!
                      </p>
                    </div>
                  </div>
                )}

                {/* Batch Transcribing Loading State */}
                {isTranscribing && turns.length === 0 && (
                  <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Processing Audio with ElevenLabs Scribe
                      </h4>
                      <p className="text-xs text-gray-400 max-w-sm mt-1">
                        Transcribing speech to text...
                      </p>
                    </div>
                  </div>
                )}

                {/* VIEW 1: FORMATTED CONVERSATION VIEW */}
                {viewTab === "formatted" && (turns.length > 0 || isRecording) && (
                  <div className="space-y-4">
                    {filteredTurns.map((turn) => {
                      return (
                        <div
                          key={turn.id}
                          className="p-4 rounded-xl border border-gray-100 dark:border-gray-700/80 bg-gray-50/40 dark:bg-gray-755 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all space-y-2 group"
                        >
                          {/* Timestamp Header */}
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleSeekAudio(turn.startTime)}
                              className="text-[11px] font-mono text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 cursor-pointer bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700"
                              title="Jump audio to this timestamp"
                            >
                              <PlayIcon className="w-2.5 h-2.5 text-indigo-500" />
                              <span>
                                {formatTimestamp(turn.startTime)} -{" "}
                                {formatTimestamp(turn.endTime)}
                              </span>
                            </button>

                            {/* Audio events tags (if any) */}
                            {turn.audioEvents && turn.audioEvents.length > 0 && (
                              <div className="flex items-center gap-1">
                                {turn.audioEvents.map((evt, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 italic"
                                  >
                                    [{evt}]
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Spoken Text */}
                          <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed font-normal">
                            {turn.text ? (
                              <span className={turn.pending ? "text-gray-500 dark:text-gray-400" : ""}>
                                {turn.text}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Transcribing phrase...</span>
                            )}
                            {turn.pending && (
                              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 align-middle">
                                <span className="w-2.5 h-2.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                Scribe
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    })}

                    {/* LIVE STREAMING TURN BUBBLE (Words written live as speaker speaks) */}
                    {isRecording && (
                      <div className="p-4 rounded-xl border-2 border-indigo-500/50 bg-indigo-50/60 dark:bg-indigo-950/40 space-y-2 shadow-xs animate-in fade-in duration-100">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            <span>Speaking Live...</span>
                          </span>
                          <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                            {formatTimestamp(recordingSeconds)}
                          </span>
                        </div>

                        {/* Word-by-word streaming text */}
                        <p className="text-sm text-gray-900 dark:text-white leading-relaxed font-medium">
                          {hasLiveText ? (
                            <>
                              {liveDraftText && <span>{liveDraftText} </span>}
                              {liveInterimText && (
                                <span className="text-indigo-700/80 dark:text-indigo-300/80">{liveInterimText}</span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              Listening... Speak into your microphone now to see words live
                            </span>
                          )}
                          <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 dark:bg-indigo-400 animate-pulse align-middle" />
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* VIEW 2: PLAIN TEXT VIEW */}
                {viewTab === "plain" && (turns.length > 0 || hasLiveText) && (
                  <div className="space-y-4">
                    <textarea
                      readOnly
                      rows={14}
                      value={fullTranscriptText}
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-xs font-mono leading-relaxed focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Output Footer Actions Bar */}
              {(turns.length > 0 || hasLiveText || clinicalSummary) && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyTranscript}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                    >
                      Copy Transcript
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadText}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                    >
                      Download .txt
                    </button>
                    <button
                      type="button"
                      onClick={handleClearTranscript}
                      className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Clinical Summary Action Button (Placed on Right Side) */}
                  <div className="flex items-center gap-2">
                    {clinicalSummary && (
                      <button
                        type="button"
                        onClick={() => setShowSummaryModal(true)}
                        className="px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Summary</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleGenerateClinicalSummary}
                      disabled={isGeneratingSummary || isRecording || (!turns.length && !hasLiveText)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Send transcript payload to POST https://api.kaizencon.in/api/clinical/summary"
                    >
                      {isGeneratingSummary ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Clinical Summary...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{clinicalSummary ? "Regenerate Clinical Summary" : "Generate Clinical Summary"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* INLINE CLINICAL SUMMARY SECTION (When Generated) */}
              {clinicalSummary && (
                <div className="p-4 sm:p-5 border-t border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                        <span>Clinical Summary</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          POST /api/clinical/summary
                        </span>
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadSummary}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white dark:bg-gray-900 border border-purple-200/60 dark:border-purple-800/40 text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {clinicalSummary}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ELEVENLABS API KEY MODAL */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <WaveformIcon className="w-5 h-5 text-indigo-600" />
                <span>ElevenLabs API Key</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your ElevenLabs API key is configured from the <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[11px]">.env</code> file (<code className="text-indigo-600 dark:text-indigo-400">VITE_ELEVENLABS_API_KEY</code>). You can also override it here for this browser session.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                ELEVENLABS_API_KEY
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="sk_..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Save API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLINICAL SUMMARY MODAL */}
      {showSummaryModal && clinicalSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Clinical Summary</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Generated Successfully
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Generated from transcript payload via POST https://api.kaizencon.in/api/clinical/summary
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[420px] overflow-y-auto p-4 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-normal whitespace-pre-wrap">
              {clinicalSummary}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                >
                  Copy Summary
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSummary}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                >
                  Download .txt
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
