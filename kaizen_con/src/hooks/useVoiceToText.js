import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom React hook for Voice-to-Text using the native Web Speech API.
 * 
 * Features:
 * - Supports window.SpeechRecognition and window.webkitSpeechRecognition.
 * - Real-time interim results and non-duplicating transcript aggregation.
 * - Preserves existing typed text (appends newly recognized speech).
 * - Automatic session cleanup and unmount abort.
 * - Comprehensive error handling with user-friendly messages.
 * - Configurable language (defaults to 'en-IN').
 */
export default function useVoiceToText({
  lang = 'en-IN',
  onTranscriptChange,
  onError,
} = {}) {
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'error'
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');

  // Determine browser Web Speech API availability
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Clear current error
  const clearError = useCallback(() => {
    setVoiceError('');
    if (voiceState === 'error') {
      setVoiceState('idle');
    }
  }, [voiceState]);

  // Cleanly abort / cancel recognition without triggering error state
  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setVoiceState('idle');
  }, []);

  // Stop recording normally (processes remaining results and transitions to idle)
  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState === 'listening') {
      setVoiceState('processing');
      try {
        recognitionRef.current.stop();
      } catch {
        abortListening();
      }
    }
  }, [voiceState, abortListening]);

  // Start voice recognition
  const startListening = useCallback(
    (currentInput = '') => {
      if (!isSpeechSupported) {
        const msg =
          'Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.';
        setVoiceError(msg);
        setVoiceState('error');
        if (onError) onError(msg);
        return;
      }

      // If already listening, stop first
      if (voiceState === 'listening') {
        stopListening();
        return;
      }

      // Clean up any stale instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      setVoiceError('');
      baseTextRef.current = currentInput || '';

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setVoiceState('listening');
          setVoiceError('');
        };

        recognition.onresult = (event) => {
          let sessionFinal = '';
          let sessionInterim = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptPiece = result[0]?.transcript || '';
            if (result.isFinal) {
              sessionFinal += (sessionFinal ? ' ' : '') + transcriptPiece.trim();
            } else {
              sessionInterim += (sessionInterim ? ' ' : '') + transcriptPiece.trim();
            }
          }

          const sessionTotal = [sessionFinal, sessionInterim]
            .filter(Boolean)
            .join(' ')
            .trim();

          const base = baseTextRef.current.trim();
          const combined = base
            ? sessionTotal
              ? `${base} ${sessionTotal}`
              : base
            : sessionTotal;

          if (onTranscriptChange) {
            onTranscriptChange(combined);
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition event error:', event.error);
          if (event.error === 'aborted') {
            // User aborted explicitly, don't show error
            return;
          }

          let message = `Speech recognition error (${event.error}). Please try again.`;
          switch (event.error) {
            case 'not-allowed':
            case 'service-not-allowed':
              message =
                'Microphone access denied. Please allow microphone permissions in your browser settings.';
              break;
            case 'audio-capture':
              message =
                'No microphone was detected. Please connect a working microphone.';
              break;
            case 'no-speech':
              // Silent timeout; user didn't speak
              message = 'No speech detected. Click the microphone to try again.';
              break;
            case 'network':
              message =
                'Network error during voice recognition. Please check your internet connection.';
              break;
            default:
              break;
          }

          setVoiceError(message);
          setVoiceState('error');
          if (onError) onError(message, event.error);
        };

        recognition.onend = () => {
          recognitionRef.current = null;
          setVoiceState((prev) =>
            prev === 'listening' || prev === 'processing' ? 'idle' : prev
          );
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error('Failed to initialize speech recognition:', err);
        const errMsg =
          'Failed to start microphone. Please check browser permissions and try again.';
        setVoiceError(errMsg);
        setVoiceState('error');
        if (onError) onError(errMsg, err);
      }
    },
    [isSpeechSupported, voiceState, lang, onTranscriptChange, onError, stopListening]
  );

  // Toggle listening on/off
  const toggleListening = useCallback(
    (currentInput = '') => {
      if (voiceState === 'listening') {
        stopListening();
      } else {
        startListening(currentInput);
      }
    },
    [voiceState, startListening, stopListening]
  );

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSpeechSupported,
    voiceState, // 'idle' | 'listening' | 'processing' | 'error'
    voiceError,
    startListening,
    stopListening,
    abortListening,
    toggleListening,
    clearError,
  };
}
