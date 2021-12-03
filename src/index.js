import * as THREE from "three";
import ReactDOM from "react-dom";
import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree, extend } from "react-three-fiber";
import niceColors from "nice-color-palettes";
import Effects from "./Effects";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
extend({ OrbitControls });

const CameraControls = () => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls class.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls

  const {
    camera,
    gl: { domElement },
  } = useThree();

  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef();
  useFrame((state) => controls.current.update());
  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      enableZoom={true}
    />
  );
};

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const data = Array.from({ length: 1000 }, () => ({
  color: niceColors[17][Math.floor(Math.random() * 5)],
  scale: 1,
}));

function Boxes() {
  const [hovered, set] = useState();
  const colorArray = useMemo(
    () =>
      Float32Array.from(
        new Array(1000)
          .fill()
          .flatMap((_, i) => tempColor.set(data[i].color).toArray())
      ),
    []
  );
  const meshRef = useRef();
  const prevRef = useRef();
  useEffect(() => void (prevRef.current = hovered), [hovered]);
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    let i = 0;
    for (let x = 0; x < 10; x++)
      for (let y = 0; y < 10; y++)
        for (let z = 0; z < 10; z++) {
          const id = i++;
          tempObject.position.set(5 - x, 5 - y, 5 - z);
          tempObject.rotation.z = tempObject.rotation.y * 2;
          if (hovered !== prevRef.Current) {
            tempColor
              .set(id === hovered ? "white" : data[id].color)
              .toArray(colorArray, id * 3);

            meshRef.current.geometry.attributes.color.needsUpdate = true;
          }
          const scale = (data[id].scale = THREE.MathUtils.lerp(
            data[id].scale,
            id === hovered ? 3 : 1,
            0.1
          ));

          if (!id) {
            const rotation = (data[id].rotation.y =
              Math.sin(x / 4 + time) +
              Math.sin(y / 4 + time) +
              Math.sin(z / 4 + time));
            tempObject.rotation.y.setScalar(rotation);
            tempObject.rotation.z = tempObject.rotation.y * 2;
          }
          tempObject.scale.setScalar(scale);
          tempObject.updateMatrix();
          meshRef.current.setMatrixAt(id, tempObject.matrix);
        }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, 1000]}
      onPointerMove={(e) => set(e.instanceId)}
      onPointerOut={(e) => set(undefined)}
    >
      <boxGeometry args={[0.6, 0.6, 0.6]}>
        <instancedBufferAttribute
          attachObject={["attributes", "color"]}
          args={[colorArray, 3]}
        />
      </boxGeometry>
      <meshPhongMaterial vertexColors={THREE.VertexColors} />
    </instancedMesh>
  );
}

ReactDOM.render(
  <Canvas
    linear
    gl={{ antialias: false, alpha: false }}
    camera={{ position: [0, 0, 15] }}
    onCreated={({ gl }) => gl.setClearColor("#f0f0f0")}
  >
    <CameraControls />
    <ambientLight />
    <pointLight position={[150, 150, 150]} intensity={0.55} />
    <Boxes />
    <Effects />
  </Canvas>,
  document.getElementById("root")
);
