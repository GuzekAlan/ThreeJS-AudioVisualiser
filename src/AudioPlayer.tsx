import React, { useEffect, useRef, useState } from "react";
import { Button, Stack } from "@mui/material";

interface AudioPlayerProps {
  analyserRef?: React.MutableRefObject<AnalyserNode | null>;
  setPicture?: React.Dispatch<React.SetStateAction<File | null>>;
}

declare global {
  interface Window {
    jsmediatags: any;
  }
}

const AudioPlayer = ({ setPicture, analyserRef }: AudioPlayerProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSourceUrl, setAudioSourceUrl] = useState<string>("");
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  
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
      startAnalyser();
    }
  };

  const onStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // reset audio playback to start
      setIsPlaying(false);
    }
  };

  const startAnalyser = () => {
    if(!audioContext) {
      const context = new AudioContext();
      analyserRef.current = context.createAnalyser();
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;
      analyserRef.current.fftSize = 256;
      const source = context.createMediaElementSource(audioRef.current!)
      source.connect(analyserRef.current);
      analyserRef.current.connect(context.destination);
      setAudioContext(context);
    }
  };

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioSourceUrl(url);
      new window.jsmediatags.Reader(audioFile)
      .setTagsToRead(["picture"])
      .read({
        onSuccess: function (tag: { tags: { picture: File; }}) {
          console.log(tag.tags.picture);
          setPicture(tag.tags.picture);
        },
        onError: function (error: any) {
          setPicture(null);
          console.log(error);
        },
      })
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
        <Button
          variant="contained"
          color="secondary"
          onClick={() => inputRef.current?.click()}
        >
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
