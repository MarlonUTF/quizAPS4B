import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FinalSessao from "../../components/layout/Colocacao/Colocacao";
import VerticalBarChart from "../../components/layout/BarChart/VerticalBarChart";
import Header from "../../components/layout/Header/Header";
import styles from "./gerenciamentoSessao.module.css";
import Logo from "../../../public/logo.png";

export default function FinalSessaoPage() {
  const navigate = useNavigate();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 🔵 JOGADORES – será substituído pelo banco depois.
  const jogadoresReais = [
    { nome: "usuario1", emoji: "😊", cor: "#D7BDE2", acertos: 10 },
    { nome: "usuario2", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "usuario3", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "usuario4", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
  ];

  // Apenas para atualizar o layout corretamente
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔵 DADOS DO GRÁFICO – futuramente puxaremos do banco
  const getQuestionData = () => {
    const baseData = [
      { label: "opção 1", value: 30, color: "#cf3f52" },
      { label: "opção 2", value: 10, color: "#6951a1" },
      { label: "opção 3", value: 20, color: "#3fa09b" },
      { label: "opção 4", value: 40, color: "#1f2e7a" },
    ];

    return baseData.map(option => ({
      ...option,
      value: Math.floor(option.value * (0.8 + Math.random() * 0.4)),
    }));
  };

  const handleBackToHome = () => navigate("/inicio");

  return (
    <div className={styles.pageContainer}>
      <Header />

      {/* 🔵 Título */}
      <div className={styles.titulo}>
        <h1 className={styles.textoTitulo}>Gerenciamento da Sessão</h1>
        <img src={Logo} className={styles.logo} alt="Logo" />
      </div>

      <div className={styles.contentMain}>
        <div className={styles.resultsWrapper}>
          <div className={styles.resultsContainer}>

            {/* 🔵 Lista de Participantes */}
            <div className={styles.tableSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Participantes</h2>
              </div>

              <FinalSessao
                jogadores={jogadoresReais}
                titulo="Classificação"
                mostrarDadosExemplo={false}
              />
            </div>

            {/* 🔵 Gráfico */}
            <div className={styles.chartSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Distribuição de Respostas (Pergunta Atual)
                </h2>
              </div>

              <VerticalBarChart
                jogadores={getQuestionData()}
                titulo="Distribuição de Respostas"
              />

              {/* 🔵 Legenda */}
              <div className={styles.chartLegend}>
                {getQuestionData().map((option, index) => (
                  <div key={index} className={styles.legendItem}>
                    <div
                      className={styles.legendColorBox}
                      style={{ backgroundColor: option.color }}
                    />
                    <span className={styles.legendLabel}>
                      {option.label}: {option.value} respostas
                    </span>
                  </div>
                ))}
              </div>

              {/* 🔵 Tabela por opção */}
              <div className={styles.scenarioTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>Cenário</div>
                  <div className={styles.headerCell}>Respostas</div>
                </div>

                {getQuestionData().map((option, index) => (
                  <div key={index} className={styles.tableRow}>
                    <div className={styles.tableCell}>{option.label}</div>
                    <div className={styles.tableCell}>{option.value}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🔵 Botão fixo */}
      <button
        className={styles.backToHomeButton}
        onClick={handleBackToHome}
        aria-label="Voltar ao início"
      >
        <span className={styles.buttonText}>Voltar ao Início</span>
      </button>
    </div>
  );
}
