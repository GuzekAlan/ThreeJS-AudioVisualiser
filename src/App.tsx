import { useRef, useState } from "react";
import { Stack } from "@mui/material";
import AudioPlayer from "./AudioPlayer";
import Visualizer from "./Visualizer";

const App = () => {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [picture, setPicture] = useState<File | null>(null);


  return (
    <>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Visualizer picture={picture} analyserRef={analyserRef} />
        <AudioPlayer setPicture={setPicture} analyserRef={analyserRef} />
      </Stack>
    </>
  );
};

export default App;
