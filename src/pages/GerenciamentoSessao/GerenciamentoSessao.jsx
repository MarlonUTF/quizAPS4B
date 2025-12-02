import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FinalSessao from "../../components/layout/Colocacao/Colocacao";
import VerticalBarChart from "../../components/layout/BarChart/VerticalBarChart";
import Header from "../../components/layout/Header/Header";
import styles from "./gerenciamentoSessao.module.css";
import Logo from "../../../public/logo.png";

export default function FinalSessaoPage() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos em segundos
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(12);
  const [isSessionActive, setIsSessionActive] = useState(true);
  
  const navigate = useNavigate();

  const jogadoresReais = [
    { nome: "usuario1", emoji: "😊", cor: "#D7BDE2", acertos: 10 },
    { nome: "usuario2", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "usuario3", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "usuario4", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
  ];

  useEffect(() => {
    // Atualizar tamanho da janela
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Cronômetro regressivo
    if (isSessionActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        window.removeEventListener("resize", handleResize);
        clearInterval(timer);
      };
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isSessionActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToHome = () => {
    navigate("/inicio");
  };

  const handleEndSession = () => {
    if (window.confirm("Tem certeza que deseja encerrar a sessão?")) {
      setIsSessionActive(false);
      // Aqui você pode adicionar lógica para enviar para o backend
      setTimeout(() => {
        navigate("/inicio");
      }, 2000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
      // Resetar timer para nova pergunta (opcional)
      setTimeLeft(60);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      setTimeLeft(60);
    }
  };

  // Dados para o gráfico baseados na pergunta atual
  const getQuestionData = () => {
    const baseData = [
      { label: "opção 1", value: 30, color: "#cf3f52" },
      { label: "opção 2", value: 10, color: "#6951a1" },
      { label: "opção 3", value: 20, color: "#3fa09b" },
      { label: "opção 4", value: 40, color: "#1f2e7a" },
    ];
    
    // Simular variação por pergunta
    return baseData.map(option => ({
      ...option,
      value: Math.floor(option.value * (0.8 + Math.random() * 0.4))
    }));
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      {/* Barra Superior com Timer e Controles */}
      <div className={styles.topControlBar}>
        <div className={styles.timerContainer}>
          <div className={styles.timerLabel}>Tempo Restante</div>
          <div className={styles.timerDisplay}>
            {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className={styles.questionNav}>
          <button 
            className={`${styles.navButton} ${currentQuestion === 1 ? styles.disabled : ''}`}
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 1}
          >
            ←
          </button>
          <div className={styles.questionIndicator}>
            Pergunta {currentQuestion}/{totalQuestions}
          </div>
          <button 
            className={`${styles.navButton} ${currentQuestion === totalQuestions ? styles.disabled : ''}`}
            onClick={handleNextQuestion}
            disabled={currentQuestion === totalQuestions}
          >
            →
          </button>
        </div>
        
        <button 
          className={styles.endSessionButton}
          onClick={handleEndSession}
        >
          Encerrar Sessão
        </button>
      </div>

      <div className={styles.titulo}>
        <h1 className={styles.textoTitulo}>Gerenciamento da Sessão</h1>
        <img src={Logo} className={styles.logo} alt="Logo" />
      </div>

      <div className={styles.contentMain}>
        <div className={styles.resultsWrapper}>
          <div className={styles.resultsContainer}>
            {/* Seção da Tabela de Classificação */}
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

            {/* Seção do Gráfico */}
            <div className={styles.chartSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Acertos Pergunta {currentQuestion}/{totalQuestions}
                </h2>
              </div>
              <VerticalBarChart
                jogadores={getQuestionData()}
                titulo={`Distribuição de Respostas - Pergunta ${currentQuestion}`}
              />
              
              {/* Legenda das Opções */}
              <div className={styles.chartLegend}>
                {getQuestionData().map((option, index) => (
                  <div key={index} className={styles.legendItem}>
                    <div 
                      className={styles.legendColorBox}
                      style={{ backgroundColor: option.color }}
                    />
                    <span className={styles.legendLabel}>
                      {option.label}: {option.value} acertos
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Tabela de Cenário (simulando cenários da pergunta) */}
              <div className={styles.scenarioTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>Cenário</div>
                  <div className={styles.headerCell}>Acertos</div>
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
      
      {/* Botão Voltar ao Início - Posição Fixa */}
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