/**
 * ElevenLabs Speech-to-Text & Speaker Diarization Service
 * Endpoint: POST https://api.elevenlabs.io/v1/speech-to-text
 * Model: scribe_v1 / scribe_v1_base with diarize=true
 */

export interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  type: "word" | "spacing" | "audio_event" | string;
  speaker_id?: string | null;
  logprob?: number;
}

export interface TranscriptionResponse {
  language_code?: string;
  language_probability?: number;
  audio_duration_secs?: number;
  text: string;
  words?: TranscriptWord[];
}

export interface DiarizedTurn {
  id: string;
  speakerId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
  words: TranscriptWord[];
  audioEvents: string[];
}

const STORAGE_KEY = "elevenlabs_api_key";

/**
 * Get ElevenLabs API Key from environment variables (.env) or localStorage
 */
export const getElevenLabsApiKey = (): string => {
  const envKey = (
    import.meta.env.VITE_ELEVENLABS_API_KEY ||
    (import.meta.env as any).ELEVENLABS_API_KEY ||
    ""
  ).trim();
  if (envKey) return envKey;

  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  }
  return "";
};

/**
 * Save ElevenLabs API Key to localStorage
 */
export const setElevenLabsApiKey = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
};

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export const formatTimestamp = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
};

/**
 * Speaker palette colors for distinct visual tags
 */
export const SPEAKER_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700", ring: "ring-blue-500", dot: "bg-blue-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-300 dark:border-emerald-700", ring: "ring-emerald-500", dot: "bg-emerald-500" },
  { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300", border: "border-purple-300 dark:border-purple-700", ring: "ring-purple-500", dot: "bg-purple-500" },
  { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-300 dark:border-amber-700", ring: "ring-amber-500", dot: "bg-amber-500" },
  { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-300 dark:border-rose-700", ring: "ring-rose-500", dot: "bg-rose-500" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-300 dark:border-cyan-700", ring: "ring-cyan-500", dot: "bg-cyan-500" },
  { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-300 dark:border-indigo-700", ring: "ring-indigo-500", dot: "bg-indigo-500" },
  { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-700 dark:text-teal-300", border: "border-teal-300 dark:border-teal-700", ring: "ring-teal-500", dot: "bg-teal-500" },
];

/**
 * Get color style for speaker index or speaker_id
 */
export const getSpeakerColor = (speakerId: string | null | undefined, indexHint: number = 0) => {
  if (!speakerId) return SPEAKER_COLORS[0];
  const match = speakerId.match(/\d+/);
  const num = match ? parseInt(match[0], 10) : indexHint;
  return SPEAKER_COLORS[Math.abs(num) % SPEAKER_COLORS.length];
};

/**
 * Group raw words array into diarized conversation turns
 */
export function groupWordsIntoSpeakerTurns(
  words: TranscriptWord[],
  speakerNames: Record<string, string> = {}
): DiarizedTurn[] {
  if (!words || words.length === 0) return [];

  const turns: DiarizedTurn[] = [];
  let currentSpeakerId: string | null = null;
  let currentTurnWords: TranscriptWord[] = [];
  let currentAudioEvents: string[] = [];

  const finalizeTurn = () => {
    if (currentTurnWords.length === 0 && currentAudioEvents.length === 0) return;

    const speakerId = currentSpeakerId || "speaker_0";
    const speakerLabel =
      speakerNames[speakerId] ||
      `Speaker ${speakerId.replace(/^speaker_?/i, "").trim() || "1"}`;

    const startTime = currentTurnWords[0]?.start ?? 0;
    const endTime = currentTurnWords[currentTurnWords.length - 1]?.end ?? startTime;

    // Build turn text cleanly
    let text = "";
    let hasActualWords = false;

    for (const w of currentTurnWords) {
      if (w.type === "spacing") {
        text += w.text || " ";
      } else if (w.type === "audio_event") {
        const cleanEvt = (w.text || "").replace(/^\[+|\]+$/g, "").trim();
        // Skip purely technical noise like static from the spoken dialogue text
        if (cleanEvt.toLowerCase() === "static") {
          continue;
        }
        text += ` [${cleanEvt}] `;
      } else {
        hasActualWords = true;
        text += (text.length > 0 && !text.endsWith(" ") ? " " : "") + w.text;
      }
    }

    // If no spoken words were detected in this turn (only static or noise)
    const trimmedText = text.trim();
    const displayText = hasActualWords
      ? trimmedText
      : currentAudioEvents.length > 0
      ? `(${currentAudioEvents.map((e) => e.replace(/^\[+|\]+$/g, "")).join(", ")})`
      : "(No speech detected)";

    turns.push({
      id: `turn_${turns.length + 1}_${startTime}`,
      speakerId,
      speakerName: speakerLabel,
      startTime,
      endTime,
      text: displayText,
      words: [...currentTurnWords],
      audioEvents: [...currentAudioEvents],
    });

    currentTurnWords = [];
    currentAudioEvents = [];
  };

  for (const word of words) {
    if (word.type === "audio_event") {
      currentAudioEvents.push(word.text);
      currentTurnWords.push(word);
      continue;
    }

    const speakerId = word.speaker_id || "speaker_0";

    if (currentSpeakerId === null) {
      currentSpeakerId = speakerId;
    } else if (speakerId !== currentSpeakerId && word.type === "word") {
      // Speaker changed
      finalizeTurn();
      currentSpeakerId = speakerId;
    }

    currentTurnWords.push(word);
  }

  // Finalize last turn
  finalizeTurn();

  return turns;
}

export interface TranscribeOptions {
  apiKey?: string;
  modelId?: string; // 'scribe_v1'
  languageCode?: string; // 'eng' or ''
  diarize?: boolean; // true
  tagAudioEvents?: boolean; // true
  numSpeakers?: number;
}

/**
 * Transcribe Audio File/Blob via ElevenLabs Speech-to-Text API
 */
export async function transcribeAudio(
  audioData: Blob | File,
  options: TranscribeOptions = {}
): Promise<TranscriptionResponse> {
  const apiKey = (options.apiKey || getElevenLabsApiKey()).trim();

  if (!apiKey) {
    throw new Error(
      "ElevenLabs API Key is missing. Please set your ELEVENLABS_API_KEY in the settings or .env file."
    );
  }

  const formData = new FormData();

  // Create a file object with a proper extension and clean MIME if it's a raw Blob
  let fileToSend: File | Blob = audioData;
  if (!(audioData instanceof File)) {
    const rawType = (audioData.type || "audio/wav").split(";")[0].trim().toLowerCase();
    const ext = rawType.includes("wav")
      ? "wav"
      : rawType.includes("mp3") || rawType.includes("mpeg")
      ? "mp3"
      : rawType.includes("ogg")
      ? "ogg"
      : rawType.includes("mp4")
      ? "mp4"
      : "webm";
    const cleanMime = ext === "wav" ? "audio/wav" : rawType || "audio/webm";
    fileToSend = new File([audioData], `recorded_audio.${ext}`, { type: cleanMime });
  }

  formData.append("file", fileToSend);
  formData.append("model_id", options.modelId || "scribe_v1");
  formData.append("diarize", options.diarize !== false ? "true" : "false");
  formData.append("tag_audio_events", options.tagAudioEvents !== false ? "true" : "false");

  if (options.languageCode && options.languageCode.trim()) {
    formData.append("language_code", options.languageCode.trim());
  }

  if (options.numSpeakers && options.numSpeakers > 0) {
    formData.append("num_speakers", String(options.numSpeakers));
  }

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    let errMessage = `ElevenLabs API error: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.detail?.message) {
        errMessage = errJson.detail.message;
      } else if (errJson?.detail) {
        errMessage = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
      } else if (errJson?.message) {
        errMessage = errJson.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errMessage);
  }

  const result: TranscriptionResponse = await response.json();
  return result;
}

/**
 * Fetch remote audio file and convert to Blob
 */
export async function fetchAudioFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download audio from URL: ${response.status} ${response.statusText}`);
  }
  return await response.blob();
}

