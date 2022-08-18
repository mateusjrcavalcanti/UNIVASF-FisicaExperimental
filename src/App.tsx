import { useState, Suspense, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./index.css";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { GeraTabuleiro, Tabuleiro } from "./components/Tabuleiro";
import RoboUm from "./models/RoboUm";
import RoboDois from "./models/RoboDois";
import QuestCard from "./components/QuestCard";
import roboimg from "./assets/clipart2250767.png";
import data from "./data";

type Game = {
  state?: string;
  jogadorAtivo: string | null;
  pergunta: number | null;
  casaUm: number;
  casaDois: number;
};

type Jogador = {
  initialPosition: [number, number, number];
  goToPosition: [number, number, number];
  currentPosition: [number, number, number];
  action: { name: string; props: any };
};

const initialGame: Game = {
  state: "parado",
  jogadorAtivo: null,
  pergunta: null,
  casaUm: -1,
  casaDois: -1,
};

function App() {
  const { Posicoes } = GeraTabuleiro();

  const perguntas = data;
  const posicoesVermelhas = [8, 13, 24];

  const [game, setGame] = useState(initialGame);
  const [jogadorUm, setJogadorUm] = useState({
    initialPosition: [-6, -0.1, -25],
    goToPosition: [-6, -0.1, -25],
    action: {
      name: "Sitting",
      props: { repetitions: 1, clampWhenFinished: true },
    },
  } as Jogador);
  const [jogadorDois, setJogadorDois] = useState({
    initialPosition: [-4, -0.1, -25],
    goToPosition: [-4, -0.1, -25],
    action: {
      name: "Sitting",
      props: { repetitions: 1, clampWhenFinished: true },
    },
  } as Jogador);

  const iniciaJogo = () => {
    setJogadorUm({
      ...jogadorUm,
      action: {
        name: "Idle",
        props: { repetitions: 10000000, clampWhenFinished: false },
      },
    });
    setGame({ ...game, state: "iniciado" });
  };
  const respostaErrada = () => setGame({ ...game, state: "errou" });
  const respostaCerta = () => setGame({ ...game, state: "acertou" });

  useEffect(() => {
    if (game.state === "iniciado") {
      setGame({
        ...game,
        state: "perguntando",
        jogadorAtivo: "jogadorUm",
        pergunta: getRandomArbitrary(0, perguntas.length),
      });     
      toast("Jogo iniciado!", {
        icon: "🤖",
      });
      return;
    }
    if (game.state === "perguntando" && game.pergunta !== null) {
      let totalperguntas = perguntas.length;
      if (!totalperguntas) {
        toast("As perguntas acabaram!", {
          icon: "😱",
        });
        if (game.casaUm !== game.casaDois) {
          let jogadorVencedor = "";
          game.casaUm > game.casaDois
            ? (jogadorVencedor = "jogadorUm")
            : (jogadorVencedor = "jogadorDois");
          setGame({
            ...game,
            state: "acabou",
            jogadorAtivo: jogadorVencedor,
          });
          toast(
            `O jogador ${
              jogadorVencedor === "jogadorUm" ? "Um" : "Dois"
            } venceu!`,
            {
              icon: "🏆",
            }
          );
        } else {
          setGame({
            ...game,
            state: "empate",
          });
          toast("Empate!", {
            icon: "🤝",
          });
        }
        return;
      } else {
        perguntas.splice(perguntas.indexOf(perguntas[game.pergunta]), 1);       
        return;
      }
    }
    if (game.state === "errou" || game.state === "acertou") {
      if (game.state === "errou") {
        setGame({
          ...game,
          state: "sentar",
        });
        toast("Resposta errada!", {
          icon: "❌",
        });
      }
      if (game.state === "acertou") {
        setGame({
          ...game,
          state: "movimentar",
        });
        /*toast("Resposta certa!", {
          icon: "✅",
        });*/
      }
      return;
    }
    if (game.state === "acabou") {      
      return;
    }
    if (game.state === "movimentar") {
      const andar = getRandomArbitrary(1, 6);     
      let casaUm = game.casaUm;
      let casaDois = game.casaDois;      
      toast(`Ande ${andar} ${andar > 1 ? "casas" : "casa"}`, {
        icon: "🎲",
      });

      if (game.jogadorAtivo === "jogadorUm") {
        casaUm += andar;
        let goToPosition = Posicoes[casaUm];
        if(casaUm > Posicoes.length) goToPosition = Posicoes[Posicoes.length - 1]
        setJogadorUm({
          ...jogadorUm,
          action: {
            name: "Walking",
            props: { repetitions: 10000000, clampWhenFinished: false },
          },
          goToPosition,
        });
      }
      if (game.jogadorAtivo === "jogadorDois") {
        casaDois += andar;
        let goToPosition = Posicoes[casaDois];
        if(casaDois > Posicoes.length) goToPosition = Posicoes[Posicoes.length - 1]
        setJogadorDois({
          ...jogadorDois,
          action: {
            name: "Walking",
            props: { repetitions: 10000000, clampWhenFinished: false },
          },
          goToPosition,
        });
      }

      setGame({
        ...game,
        state: "em movimento",
        casaUm,
        casaDois,
      });
      return;
    }
    if (game.state === "em movimento") {
      if (game.jogadorAtivo === "jogadorUm") {
        setJogadorUm({
          ...jogadorUm,
          currentPosition: [
            robotUm.current.position.x,
            robotUm.current.position.y,
            robotUm.current.position.z,
          ],
        });
        if (
          jogadorUm.currentPosition &&
          jogadorUm.goToPosition &&
          Math.round(jogadorUm.currentPosition[0]) ===
            Math.round(jogadorUm.goToPosition[0]) &&
          Math.round(jogadorUm.currentPosition[2]) ===
            Math.round(jogadorUm.goToPosition[2])
        ) {
          //Caiu na casa vermelha
          if (posicoesVermelhas.includes(game.casaUm)) {
            setGame({
              ...game,
              state: "caiu",
            });
            return;
            //Matou o outro player
          } else if (game.casaDois === game.casaUm) {
            setGame({
              ...game,
              state: "matou",
            });
            return;
            //Chegou na casa
          } else if (
            jogadorUm.currentPosition &&
          jogadorUm.goToPosition &&
            Math.round(jogadorUm.currentPosition[0]) ===
              Math.round(Posicoes[Posicoes.length - 1][0]) &&
            Math.round(jogadorUm.currentPosition[2]) ===
              Math.round(Posicoes[Posicoes.length - 1][2])
          ) {
            setGame({
              ...game,
              state: "acabou",
            });
            setJogadorUm({
              ...jogadorUm,
              action: {
                name: "Dance",
                props: { repetitions: 10000000, clampWhenFinished: false },
              },
            });
            return;
          } else {
            setGame({
              ...game,
              state: "sentar",
            });            
            return;
          }
        }
      }
      if (game.jogadorAtivo === "jogadorDois") {
        setJogadorDois({
          ...jogadorDois,
          currentPosition: [
            robotDois.current.position.x,
            robotDois.current.position.y,
            robotDois.current.position.z,
          ],
        });
        if (
          jogadorDois.currentPosition &&
          Math.round(jogadorDois.currentPosition[0]) ===
            Math.round(jogadorDois.goToPosition[0]) &&
          Math.round(jogadorDois.currentPosition[2]) ===
            Math.round(jogadorDois.goToPosition[2])
        ) {
          if (posicoesVermelhas.includes(game.casaDois)) {
            setGame({
              ...game,
              state: "caiu",
            });
            return;
            //Matou o outro player
          } else if (game.casaDois === game.casaUm) {
            setGame({
              ...game,
              state: "matou",
            });
            return;
            //Chegou na casa
          } else if (
            jogadorDois.currentPosition &&
            Math.round(jogadorDois.currentPosition[0]) ===
              Math.round(Posicoes[Posicoes.length - 1][0]) &&
            Math.round(jogadorDois.currentPosition[2]) ===
              Math.round(Posicoes[Posicoes.length - 1][2])
          ) {
            setGame({
              ...game,
              state: "acabou",
            });
            setJogadorDois({
              ...jogadorDois,
              action: {
                name: "Dance",
                props: { repetitions: 10000000, clampWhenFinished: false },
              },
            });
            return;
          } else {
            setGame({
              ...game,
              state: "sentar",
            });            
            return;
          }
        }
      }
    }
    if (game.state === "sentar") {
      //Deixar o boneco sentado esperando o outro
      if (game.jogadorAtivo === "jogadorDois") {       
        setJogadorDois({
          ...jogadorDois,
          action: {
            name: "Sitting",
            props: { repetitions: 1, clampWhenFinished: true },
          },
        });
        setJogadorUm({
          ...jogadorUm,
          action: {
            name: "Idle",
            props: { repetitions: 10000000, clampWhenFinished: false },
          },
        });
      }
      if (game.jogadorAtivo === "jogadorUm") {   
        setJogadorUm({
          ...jogadorUm,
          action: {
            name: "Sitting",
            props: { repetitions: 1, clampWhenFinished: true },
          },
        });
        setJogadorDois({
          ...jogadorDois,
          action: {
            name: "Idle",
            props: { repetitions: 10000000, clampWhenFinished: false },
          },
        });
      }
      setGame({
        ...game,
        state: "perguntando",
        jogadorAtivo:
          game.jogadorAtivo === "jogadorUm" ? "jogadorDois" : "jogadorUm",
        pergunta: getRandomArbitrary(0, perguntas.length),
      });
      return;
    }
    if (game.state === "caiu") {
      toast("Ops, alguém caiu!", {
        icon: "👻",
      });
      if (game.jogadorAtivo === "jogadorUm") {
        setJogadorUm({
          ...jogadorUm,
          action: {
            name: "Death",
            props: { repetitions: 1, clampWhenFinished: true },
          },
        });        
        sleep(2000).then(() => {
          setJogadorUm({
            ...jogadorUm,
            goToPosition: [-6, -0.1, -25],
            initialPosition: [-6, -0.1, -25],
          });
          setGame({
            ...game,
            state: "sentar",
            casaUm: -1,
          });
        });
      }
      if (game.jogadorAtivo === "jogadorDois") {
        setJogadorDois({
          ...jogadorDois,
          action: {
            name: "Death",
            props: { repetitions: 1, clampWhenFinished: true },
          },
        });        
        sleep(2000).then(() => {
          setJogadorDois({
            ...jogadorDois,
            goToPosition: [-4, -0.1, -25],
            initialPosition: [-4, -0.1, -25],
          });
          setGame({
            ...game,
            state: "sentar",
            casaDois: -1,
          });
        });
      }
      return;
    }
    if (game.state === "matou") {
      toast("Dormiu no ponto!", {
        icon: "💥",
      });
      if (game.jogadorAtivo === "jogadorUm") {
        setJogadorUm({
          ...jogadorUm,
          action: {
            name: "Punch",
            props: { repetitions: 1, clampWhenFinished: true },
          },
        });
        sleep(500).then(() => {
          setJogadorDois({
            ...jogadorDois,
            action: {
              name: "Death",
              props: { repetitions: 1, clampWhenFinished: true },
            },
          });
        });
        sleep(2500).then(() => {
          setJogadorDois({
            ...jogadorDois,
            initialPosition: [-4, -0.1, -25],
            goToPosition: [-4, -0.1, -25],
          });         
          setGame({
            ...game,
            state: "sentar",
            casaDois: -1,
          });
        });
      }
      if (game.jogadorAtivo === "jogadorDois") {
        setJogadorDois({
          ...jogadorDois,
          action: {
            name: "Punch",
            props: { repetitions: 1, clampWhenFinished: true },
          },
        });
        sleep(500).then(() => {
          setJogadorUm({
            ...jogadorUm,
            action: {
              name: "Death",
              props: { repetitions: 1, clampWhenFinished: true },
            },
          });
        });
        sleep(2500).then(() => {
          setJogadorUm({
            ...jogadorUm,
            initialPosition: [-4, -0.1, -25],
            goToPosition: [-4, -0.1, -25],
          });          
          setGame({
            ...game,
            state: "sentar",
            casaUm: -1,
          });
        });
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, jogadorUm.currentPosition, jogadorDois.currentPosition]);

  const robotUm = useRef<any>();
  const robotDois = useRef<any>();

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      <Canvas style={{ width: "100vw", height: "100vh" }}>
        <OrthographicCamera makeDefault position={[10, 100, -5]} zoom={20} />
        <Suspense fallback={null}>
          <directionalLight intensity={1} />
          <ambientLight intensity={1} />
          <RoboUm key="jogadorUm" {...jogadorUm} useRef={robotUm} />
          <RoboDois key="jogadorDois" {...jogadorDois} useRef={robotDois} />
          <Tabuleiro />
        </Suspense>
        <OrbitControls
          addEventListener={undefined}
          hasEventListener={undefined}
          removeEventListener={undefined}
          dispatchEvent={undefined}
        />
      </Canvas>
      {game.state === "parado" && (
        <QuestCard
          title="Fim de jogo!"
          subtitle="Deseja iniciar?"
          itens={[
            {
              label: "Sim",
              color: "white",
              onClick: iniciaJogo,
            },
          ]}
          position="center"
          icon={<img src={roboimg} alt="" />}
        />
      )}
      {game.state === "empate" && (
        <QuestCard
          title="Empate!"
          position="center"
          icon={<img src={roboimg} alt="" />}
        />
      )}
      {game.state === "acabou" && (
        <QuestCard
          title={`O Jogador ${
            game.jogadorAtivo === "jogadorUm" ? "Um" : "Dois"
          } venceu!`}
          subtitle="Placar:"
          itens={[
            {
              label: "Jogador 01: " + (game.casaUm + 1),
              color: "white",
              onClick: () => {},
            },
            {
              label: "Jogador 02: " + (game.casaDois + 1),
              color: "white",
              onClick: () => {},
            },
          ]}
          position="center"
          icon={<img src={roboimg} alt="" />}
        />
      )}
      {game.state === "perguntando" &&
        game.pergunta !== null &&
        perguntas[game.pergunta] &&
        game.jogadorAtivo !== null && (
          <QuestCard
            position={game.jogadorAtivo === "jogadorUm" ? "left" : "right"}
            title={
              game.jogadorAtivo === "jogadorUm" ? "Jogador Um" : "Jogador Dois"
            }
            subtitle={perguntas[game.pergunta].pergunta}
            itens={respostasAleatorias(
              perguntas[game.pergunta].erradas?.map((item: any) => {
                return {
                  color: "white",
                  label: item,
                  onClick: respostaErrada,
                };
              }),
              {
                color: "white",
                label: perguntas[game.pergunta].correta,
                onClick: respostaCerta,
              }
            )}
            icon={<img src={roboimg} alt="" />}
          />
        )}
    </div>
  );
}

function getRandomArbitrary(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min) + min);
}

function respostasAleatorias(items: any[], other: any) {
  items.push(other);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export default App;

//npx gltfjsx
