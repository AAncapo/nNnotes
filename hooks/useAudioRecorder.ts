/* eslint-disable prettier/prettier */
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export default function useRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  // const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    };

    init();
  }, []);

  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;
    try {
      await recording.pauseAsync();
      setIsPaused(true);
      if (timer) clearInterval(timer);
    } catch (err) {
      console.error('Failed to pause recording', err);
    }
  };

  const resumeRecording = async () => {
    if (!recording) return;
    try {
      await recording.startAsync();
      setIsPaused(false);
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
    } catch (err) {
      console.error('Failed to resume recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();

      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      if (timer) clearInterval(timer);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  return {
    recording,
    isRecording,
    isPaused,
    duration,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
