import React, { useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import ModelPath from "./RobotExpressive1.glb";

export default function RoboUm({ ...props }) {
  const group = props.useRef;
  const { nodes, /*materials,*/ animations } = useGLTF(ModelPath);
  const { actions } = useAnimations(animations, group);

  const tras = () => {
    group.current.position.z -= 0.1;
    group.current.rotation.y = Math.PI / 1;
  };
  const frente = () => {
    group.current.position.z += 0.1;
    group.current.rotation.y = 0;
  };
  const esquerda = () => {
    group.current.position.x += 0.1;
    group.current.rotation.y = Math.PI / 2;
  };
  const direita = () => {
    group.current.position.x -= 0.1;
    group.current.rotation.y = Math.PI / 2;
  };

  useFrame((state) => {
    const diferencaZ =
      props.goToPosition && props.goToPosition[2]
        ? Math.round(group.current.position.z) -
          Math.round(props.goToPosition[2])
        : undefined;
    const diferencaX =
      props.goToPosition && props.goToPosition[0]
        ? Math.round(group.current.position.x) -
          Math.round(props.goToPosition[0])
        : undefined;
    if (diferencaZ && diferencaZ !== 0) {
      if (diferencaX === 0) {
        if (diferencaZ > 0) tras();
        if (diferencaZ < 0) frente();
      } else {
        if (diferencaZ < 0) {
          if (diferencaZ !== 0) {
            if (diferencaZ > 0) tras();
            if (diferencaZ < 0) frente();
          } else if (diferencaX !== 0) {
            if (diferencaX > 0) direita();
            if (diferencaX < 0) esquerda();
          }
        } else {
          if (diferencaX !== 0) {
            if (diferencaX > 0) direita();
            if (diferencaX < 0) esquerda();
          } else if (diferencaZ !== 0) {
            if (diferencaZ > 0) tras();
            if (diferencaZ < 0) frente();
          }
        }
      }
    } else {
      if (diferencaX && diferencaX !== 0) {
        if (diferencaX > 0) direita();
        if (diferencaX < 0) esquerda();
      }
    }
  });

  useEffect(() => {
    group.current.position.x = props.initialPosition[0];
    group.current.position.y = props.initialPosition[1];
    group.current.position.z = props.initialPosition[2];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialPosition]);

  useEffect(() => {
    Object.keys(actions).forEach((item) => actions[item].stop());
    Object.keys(props.action.props).forEach((item) => {
      actions[props.action.name][item] = props.action.props[item];
    });
    actions[props.action.name].play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.action]);

  return (
    <group
      ref={group}
      {...props}
      position={props.initialPosition}
      dispose={null}
    >
      <group>
        <group>
          <group rotation={[-Math.PI / 2, 0, 0]} scale={50}>
            <primitive object={nodes.Bone} />
          </group>
          <group
            position={[0, 2.37, -0.02]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <skinnedMesh
              geometry={nodes.HandR_1.geometry}
              material={nodes.HandR_1.material}
              skeleton={nodes.HandR_1.skeleton}
            />
            <skinnedMesh
              geometry={nodes.HandR_2.geometry}
              material={nodes.HandR_2.material}
              skeleton={nodes.HandR_2.skeleton}
            />
          </group>
          <group
            position={[0, 2.37, -0.02]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={100}
          >
            <skinnedMesh
              geometry={nodes.HandL_1.geometry}
              material={nodes.HandL_1.material}
              skeleton={nodes.HandL_1.skeleton}
            />
            <skinnedMesh
              geometry={nodes.HandL_2.geometry}
              material={nodes.HandL_2.material}
              skeleton={nodes.HandL_2.skeleton}
            />
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(ModelPath);
