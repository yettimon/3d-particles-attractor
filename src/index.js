import * as THREE from "three";
import ReactDOM from "react-dom";
import React, { Suspense, useCallback, useRef, useMemo } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import "./styles.css";

const Distance = (x1, x2, y1, y2) => {
  const a = x1 - x2;
  const b = y1 - y2;
  const distance = a * a + b * b;
  return distance;
};

function Swarm({ count, mouse }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 1;
      const factor = 1;
      const speed = 0;
      const xFactor = -20 + Math.random() * 30;
      const yFactor = -20 + Math.random() * 30;
      const zFactor = -20 + Math.random() * 30;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 5;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;

      particle.mx += (mouse.current[0] - particle.mx) * 0.01;
      particle.my += (mouse.current[1] - particle.my) * 0.01;
      dummy.position.set(
        (particle.mx / 10) * a +
          xFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b +
          yFactor +
          Math.sin((t / 10) * factor) +
          (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b +
          zFactor +
          Math.cos((t / 10) * factor) +
          (Math.sin(t * 3) * factor) / 10
      );
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      mesh.current.instanceMatrix.needsUpdate = true;
      if (
        Distance(
          dummy.position.x,
          mouse.current[0],
          dummy.position.y,
          mouse.current[1]
        ) <= 10000
        //Math.round(dummy.position.x) === Math.round(mouse.current[0]) ||
        //Math.round(dummy.position.y) === Math.round(mouse.current[1])
      ) {
        dummy.scale.set(3, 3, 3);
        mesh.current.setMatrixAt(i, dummy.matrix);
      } else {
        dummy.scale.set(1, 1, 1);
        mesh.current.setMatrixAt(i, dummy.matrix);
      }
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        <meshPhongMaterial attach="material" color="#7f7f7f" />
      </instancedMesh>
    </>
  );
}

function App() {
  const mouse = useRef([0, 0]);
  const onMouseMove = useCallback(
    ({ clientX: x, clientY: y }) =>
      (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
    []
  );
  return (
    <div style={{ width: "100%", height: "100%" }} onMouseMove={onMouseMove}>
      <Canvas
        gl={{ alpha: false, antialias: false, logarithmicDepthBuffer: false }}
        camera={{ fov: 75, position: [0, 0, 70] }}
        onCreated={({ gl }) => {
          gl.setClearColor("white");
          gl.toneMapping = THREE.Uncharted2ToneMapping;
          gl.outputEncoding = THREE.sRGBEncoding;
        }}
      >
        <ambientLight intensity={1.25} />
        <pointLight position={[100, 100, 100]} />
        <pointLight position={[-100, -100, -100]} color="lightpink" />
        <Swarm mouse={mouse} count={300} />
        <Suspense fallback={null}></Suspense>
      </Canvas>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
