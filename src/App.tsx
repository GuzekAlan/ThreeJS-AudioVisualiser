import { useState } from "react";
import AudioPlayer from "./AudioPlayer";
import { Stack } from "@mui/material";

const App = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <AudioPlayer
          audioFile={audioFile}
          setAudioFile={setAudioFile}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      </Stack>
    </>
  );
};

export default App;
