import { Canvas, useFrame, useLoader} from "@react-three/fiber";
import { MutableRefObject, Suspense, useEffect, useMemo, useRef} from "react";
import { Mesh, PlaneGeometry, ShaderMaterial, TextureLoader} from "three";

const fragmentShader = `
in vec2 uvInterpolator;
uniform sampler2D u_texture;
uniform float u_freq0;
uniform float u_freq1;
uniform float u_freq2;
uniform float u_freq3;
uniform float u_freq4;

float PI = 3.1415926535897932384626433832795;
float pow2(float x) { return x*x; }

void main() {
  vec2 uv = uvInterpolator;

  float intensity = 0.001;
  float r = sqrt(pow2(uv.x - 0.5) + pow2(uv.y - 0.5));
  float angle = atan(uv.y - 0.5, uv.x - 0.5);
  float dx = cos(angle) * r;
  float dy = sin(angle) * r;
  
  if(r > 0. && r < 0.2) {
      uv.x -= dx*u_freq0 * intensity;
      uv.y -= dy*u_freq0 * intensity;
  }
  if(r > 0.2 && r < 0.4) {
      uv.x -= dx*u_freq1 * intensity;
      uv.y -= dy*u_freq1 * intensity;
  }
  if(r > 0.4 && r < 0.6) {
      uv.x -= dx*u_freq2 * intensity;
      uv.y -= dy*u_freq2 * intensity;
  }
  if(r > 0.6 && r < 0.8) {
      uv.x -= dx*u_freq3 * intensity;
      uv.y -= dy*u_freq3 * intensity;
  }
  if(r > 0.8 && r < 1.0) {
      uv.x -= dx*u_freq4 * intensity;
      uv.y -= dy*u_freq4 * intensity;
  }
  

  float freq = u_freq2;
  uv.y -= sin(uv.x*10. + float(int(freq)%5)) * intensity * 0.1 * freq;
  uv.x -= sin(uv.y*10. + float(int(freq)%5)) * intensity * 0.1 * freq;
  vec4 col = texture(u_texture, uv);
  gl_FragColor = col;
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
  analyserRef?: React.MutableRefObject<AnalyserNode | null>;
  picture?: any;
}

function bytesToBase64(byteArray) {
  return btoa(
    byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
}

const Img = ({picture, analyserRef}: ImgProps) => {
  const mesh: MutableRefObject<Mesh<PlaneGeometry, ShaderMaterial>> = useRef(
    null!
  );

  const defaultTexture = useLoader(TextureLoader, "music.png");

  useEffect(() => {
    if (picture) {
      const base64flag = `data:${picture.format};base64,`;
      const imageString = base64flag + bytesToBase64(picture.data);
      const tex = new TextureLoader().load(imageString);
      mesh.current.material.uniforms.u_texture.value = tex;
    } else {
      mesh.current.material.uniforms.u_texture.value = defaultTexture;
    }
  }, [picture]);

  useFrame(() => {
    if(analyserRef.current) {
      const array = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(array);

      for (let i = 0; i < 5; i++) {
        array
      }
      const arrays = array.reduce((acc, value, index) => {
          acc[Math.floor(index / array.length * 5)].push(value);
        return acc;
      }, [[0], [0], [0], [0], [0]])

      const averages = arrays.map((array) => array.reduce((a, b) => a + b, 0) / array.length);

      console.log(averages);
      mesh.current.material.uniforms.u_freq0.value = averages[0];
      mesh.current.material.uniforms.u_freq1.value = averages[1];
      mesh.current.material.uniforms.u_freq2.value = averages[2];
      mesh.current.material.uniforms.u_freq3.value = averages[3];
      mesh.current.material.uniforms.u_freq4.value = averages[4];
    }
  });

  const uniforms = useMemo(
    () => ({
      u_texture: { type: "t", value: defaultTexture},
      u_freq0: { value: 0},
      u_freq1: { value: 0},
      u_freq2: { value: 0},
      u_freq3: { value: 0},
      u_freq4: { value: 0},
    }), [defaultTexture]);

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
  analyserRef?: React.MutableRefObject<AnalyserNode | null>;
  picture?: File | null;
}

const Visualizer = ({picture, analyserRef}: VisualizerProps ) => {
 
  return (
    <>
      <Canvas style={{ height: "80vh", aspectRatio: "1/1" }}>
        <Suspense fallback={null}>
          <Img picture={picture} analyserRef={analyserRef}/>
        </Suspense>
      </Canvas>
    </>
  );
};

export default Visualizer;
