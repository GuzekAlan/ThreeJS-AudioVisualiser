import { useRef } from "react";
import { Stack } from "@mui/material";
import AudioPlayer from "./AudioPlayer";
import Visualizer from "./Visualizer";

const App = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  return (
    <>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Visualizer audioRef={audioRef} analyserRef={analyserRef} />
        <AudioPlayer audioRef={audioRef} analyserRef={analyserRef} />
      </Stack>
    </>
  );
};

export default App;
