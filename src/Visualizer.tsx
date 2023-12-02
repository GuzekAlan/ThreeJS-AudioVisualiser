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

void main() {
  vec2 uv = uvInterpolator;
  
  uv.y = uv.y + cos(uv.x * 10.0 + u_freq0*0.02) * 0.001 * u_freq1;
  uv.x = uv.x + sin(uv.y * 10.0 + u_freq2*0.02) * 0.001 * u_freq3;
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

      const arrays = array.reduce((acc, value, index) => {
        if (index % 5 == 0){
          acc.push([value]);
        } else {
          acc[acc.length - 1].push(value);
        }
        return acc;
      }, [])

      const averages = arrays.map((array) => array.reduce((a, b) => a + b, 0) / array.length);

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
