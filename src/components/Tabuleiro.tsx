import React, { useRef } from "react";

export function Base(props: any) {
  const mesh = useRef();
  //useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));
  return (
    <mesh {...props} ref={mesh}>
      <boxGeometry args={[3, 0.2, 3]} />
      <meshStandardMaterial color={props.color || "black"} />
    </mesh>
  );
}

function addBase(quantidade: any, direcao: any, cor: any, posicao: any) {
  const basesgeradas = [];
  const basesposicoes = [];
  for (let i = 0; i < quantidade; i++) {
    if (direcao === "frente")
      posicao = [posicao[0], -0.2, posicao[2] + (0.1 + 3)];
    if (direcao === "tras")
      posicao = [posicao[0], -0.2, posicao[2] - (0.1 + 3)];
    if (direcao === "direita")
      posicao = [posicao[0] - (0.1 + 3), -0.2, posicao[2]];
    if (direcao === "esquerda")
      posicao = [posicao[0] + (0.1 + 3), -0.2, posicao[2]];
    basesgeradas.push(
      <Base key={posicao} color={cor || "black"} position={posicao} />
    );
    basesposicoes.push(posicao);
  }
  return { basesgeradas, basesposicoes, posicao };
}

export function Tabuleiro() {
  return <>{GeraTabuleiro().BaseComponents}</>;
}

export function GeraTabuleiro() {
  const BaseComponents = [];

  let position = [-5, -0.2, -25];
  const list1 = addBase(8, "frente", "black", position);

  position = list1.posicao;
  const list2 = addBase(1, "frente", "red", position);

  position = list2.posicao;
  const list3 = addBase(4, "frente", "black", position);

  position = list3.posicao;
  const list4 = addBase(1, "frente", "red", position);

  position = list4.posicao;
  const list5 = addBase(5, "esquerda", "black", position);

  position = list5.posicao;
  const list6 = addBase(5, "tras", "black", position);

  position = list6.posicao;
  const list7 = addBase(1, "tras", "red", position);

  position = list7.posicao;
  const list8 = addBase(6, "tras", "black", position);

  position = list8.posicao;
  const list9 = addBase(1, "tras", "yellow", position);

  BaseComponents.push(list1.basesgeradas);
  BaseComponents.push(list2.basesgeradas);
  BaseComponents.push(list3.basesgeradas);
  BaseComponents.push(list4.basesgeradas);
  BaseComponents.push(list5.basesgeradas);
  BaseComponents.push(list6.basesgeradas);
  BaseComponents.push(list7.basesgeradas);
  BaseComponents.push(list8.basesgeradas);
  BaseComponents.push(list9.basesgeradas);

  const Posicoes = [].concat(
    // @ts-ignore
    list1.basesposicoes,
    list2.basesposicoes,
    list3.basesposicoes,
    list4.basesposicoes,
    list5.basesposicoes,
    list6.basesposicoes,
    list7.basesposicoes,
    list9.basesposicoes
  );
  return { BaseComponents, Posicoes };
}
