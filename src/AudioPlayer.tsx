import React, { useEffect, useRef, useState } from "react";
import { Button, Stack } from "@mui/material";

interface AudioPlayerProps {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const AudioPlayer = ({
  audioFile,
  setAudioFile,
  isPlaying,
  setIsPlaying,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [audioSourceUrl, setAudioSourceUrl] = useState<string>("");

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onStop();
      setAudioFile(event.target.files[0]);
    }
  };

  const onPlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const onStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // reset audio playback to start
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioSourceUrl(url);
    } else {
      setAudioSourceUrl("");
    }

    // Clean up URL object when the component unmounted
    return () => {
      if (audioSourceUrl) URL.revokeObjectURL(audioSourceUrl);
    };
  }, [audioFile]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".mp3"
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      <audio ref={audioRef} src={audioSourceUrl} />
      <Stack direction="row" spacing="4rem">
        <Button variant="contained" color="secondary" onClick={() => inputRef.current?.click()}>
          Upload MP3
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={onPlay}
          disabled={!audioFile || isPlaying}
        >
          Play
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onStop}
          disabled={!audioFile || !isPlaying}
        >
          Stop
        </Button>
      </Stack>
    </div>
  );
};

export default AudioPlayer;
