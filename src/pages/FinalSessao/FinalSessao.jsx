import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import FinalSessao from "../../components/layout/Colocacao/Colocacao";
import VerticalBarChart from "../../components/layout/BarChart/VerticalBarChart";
import Header from "../../components/layout/Header/Header";
import styles from "./finalSessao.module.css";
import Logo from "../../../public/logo.png";

export default function FinalSessaoPage() {
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const navigate = useNavigate();

  const jogadoresReais = [
    { nome: "Marjory", emoji: "😊", cor: "#D7BDE2", acertos: 100 },
    { nome: "Marlon", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "Samara", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "Talisson", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
    { nome: "Marjory", emoji: "😊", cor: "#D7BDE2", acertos: 10 },
    { nome: "Marlon", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "Samara", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "Talisson", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
    { nome: "Marjory", emoji: "😊", cor: "#D7BDE2", acertos: 10 },
    { nome: "Marlon", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "Samara", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "Talisson", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
  ];

  useEffect(() => {
    // Atualizar tamanho da janela para confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Manter confetti por 30 segundos (tempo muito maior)
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 100000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handleBackToHome = () => {
    navigate("/inicio");
  };

  return (
    <div className={styles.pageContainer}>
      {/* Confetti em grande volume e duração */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={150} // volume reduzido e elegante
          gravity={0.05} // queda suave
          wind={0.005} // movimento leve
          recycle={false} // confete cai e acaba
          initialVelocityX={2}
          initialVelocityY={5}
          colors={[
            "#593C8F",
            "#BEBEED",
            "#F7DC6F",
            "#85C1E9",
            "#D7BDE2",
            "#FF6B6B",
            "#4ECDC4",
            "#FFD166",
          ]}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 1000 }}
        />
      )}

      <Header />
      
      {/* Botão Voltar ao Início - Posição Fixa */}
      <button 
        className={styles.backToHomeButton}
        onClick={handleBackToHome}
        aria-label="Voltar ao início"
      >
        <span className={styles.buttonText}>Voltar ao Início</span>
      </button>
      
      <div className={styles.titulo}>
        <h1 className={styles.textoTitulo}>Ranking Final</h1>
        <img src={Logo} className={styles.logo} alt="Logo" />
      </div>

      <div className={styles.contentMain}>
        <div className={styles.resultsWrapper}>
          <div className={styles.resultsContainer}>
            {/* Seção da Tabela de Classificação */}
            <div className={styles.tableSection}>
              <FinalSessao
                jogadores={jogadoresReais}
                titulo="Classificação"
                mostrarDadosExemplo={false}
              />
            </div>

            {/* Seção do Gráfico */}
            <div className={styles.chartSection}>
              <VerticalBarChart
                jogadores={jogadoresReais}
                titulo="Performance da Partida"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}