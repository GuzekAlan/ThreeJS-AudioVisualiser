import { Canvas, useFrame, useLoader} from "@react-three/fiber";
import { MutableRefObject, Suspense, useMemo, useRef } from "react";
import { Mesh, PlaneGeometry, ShaderMaterial, TextureLoader} from "three";

const fragmentShader = `
in vec2 uvInterpolator;
uniform sampler2D u_texture;
uniform float u_freq;

void main() {
  vec2 uv = uvInterpolator;
  uv.y = uv.y + sin(uv.x * 10.0 + u_freq * 10.0) * 0.1;
  gl_FragColor = texture2D(u_texture, uv);
}
`
const vertexShader = `
  out vec2 uvInterpolator;

  void main() {
    uvInterpolator = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

interface ImgProps {
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  analyserRef?: React.MutableRefObject<AnalyserNode | null>;
}

const Img = ({analyserRef}: ImgProps) => {
  const mesh: MutableRefObject<Mesh<PlaneGeometry, ShaderMaterial>> = useRef(
    null!
  );

  useFrame(() => {
    if(analyserRef.current) {
      const array = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(array);

      const average = array.reduce((a, b) => a + b, 0) / array.length;
      mesh.current.material.uniforms.u_freq.value = average;
    }
  });

  const texture = useLoader(TextureLoader, 'beliver.png');
  const uniforms = useMemo(
    () => ({
      u_texture: { type: "t", value: texture},
      u_freq: { value: 0},
    }),
    [texture]
  );

  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={5}>
      <planeGeometry args={[1, 1]} />
      {/* <meshStandardMaterial map={texture} /> */}
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

interface VisualizerProps {
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  analyserRef?: React.MutableRefObject<AnalyserNode | null>;
}

const Visualizer = ({audioRef, analyserRef}: VisualizerProps ) => {
 
  return (
    <>
      <Canvas style={{ height: "80vh", aspectRatio: "1/1" }}>
        <Suspense fallback={null}>
          <Img audioRef={audioRef} analyserRef={analyserRef}/>
        </Suspense>
      </Canvas>
    </>
  );
};

export default Visualizer;
