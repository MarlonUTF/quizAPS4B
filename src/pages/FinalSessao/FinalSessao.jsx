import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Confetti from "react-confetti";
import FinalSessao from "../../components/layout/Colocacao/Colocacao";
import VerticalBarChart from "../../components/layout/BarChart/VerticalBarChart";
import Header from "../../components/layout/Header/Header";
import styles from "./finalSessao.module.css";
import Logo from "../../../public/logo.png";

export default function FinalSessaoPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get("session");
  const sessionPlayerId = searchParams.get("player");
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      navigate("/telaloginjogador");
      return;
    }
    
    loadSessionData();
    
    // Atualizar tamanho da janela para confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Manter confetti por 10 segundos
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [sessionId, navigate]);

  const loadSessionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Carregar sessão com quiz
      const { data: sessionData, error: sessionError } = await supabase
        .from("session")
        .select(`
          *,
          quiz:quiz_id (*)
        `)
        .eq("id", sessionId)
        .single();

      if (sessionError) throw new Error("Sessão não encontrada");
      setSession(sessionData);
      setQuiz(sessionData.quiz);

      // 2. Carregar total de perguntas no quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_question")
        .select("id")
        .eq("quiz_id", sessionData.quiz_id);

      if (!questionsError && questionsData) {
        setTotalQuestions(questionsData.length);
      }

      // 3. Carregar jogadores da sessão
      const { data: playersData, error: playersError } = await supabase
        .from("session_player")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (playersError) throw new Error("Erro ao carregar jogadores");
      
      // 4. Se houver sessionPlayerId, carregar jogador atual
      if (sessionPlayerId) {
        const currentPlayerData = playersData.find(p => p.id === sessionPlayerId);
        setCurrentPlayer(currentPlayerData);
      }

      // 5. Calcular pontuação de cada jogador
      const playersWithScores = await Promise.all(
        playersData.map(async (player) => {
          // Buscar respostas do jogador
          const { data: answers, error: answersError } = await supabase
            .from("player_answer")
            .select(`
              option_id,
              option:option_id (
                is_correct
              )
            `)
            .eq("session_player_id", player.id)
            .eq("session_id", sessionId);

          if (answersError) {
            console.error("Erro ao carregar respostas do jogador:", player.nickname, answersError);
            return { 
              nome: player.nickname,
              emoji: player.emoji,
              cor: player.color,
              acertos: 0,
              sessionPlayerId: player.id,
              isCurrentPlayer: player.id === sessionPlayerId
            };
          }

          // Contar respostas corretas
          const correctAnswers = answers?.filter(answer => 
            answer.option?.is_correct === true
          ) || [];

          return {
            nome: player.nickname,
            emoji: player.emoji,
            cor: player.color,
            acertos: correctAnswers.length,
            sessionPlayerId: player.id,
            isCurrentPlayer: player.id === sessionPlayerId
          };
        })
      );

      // Ordenar por acertos (maior para menor)
      const sortedPlayers = playersWithScores.sort((a, b) => b.acertos - a.acertos);
      
      // Adicionar posição (ranking)
      const rankedPlayers = sortedPlayers.map((player, index) => ({
        ...player,
        posicao: index + 1
      }));

      setPlayers(rankedPlayers);

    } catch (err) {
      console.error("Erro ao carregar dados da sessão:", err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/inicio");
  };

  const handleRestartQuiz = () => {
    if (sessionId && sessionPlayerId) {
      navigate(`/pergunta?session=${sessionId}&player=${sessionPlayerId}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.errorContainer}>
          <h3>⚠️ Erro ao carregar resultados</h3>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.errorActions}>
            <button
              onClick={() => navigate("/inicio")}
              className={styles.backButton}
            >
              Voltar ao início
            </button>
            <button
              onClick={loadSessionData}
              className={styles.retryButton}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback para dados se não houver jogadores
  const displayPlayers = players.length > 0 ? players : [
    { nome: "Nenhum jogador", emoji: "😔", cor: "#CCCCCC", acertos: 0, posicao: 1 }
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={150}
          gravity={0.05}
          wind={0.005}
          recycle={false}
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
      
      {/* Botão Voltar ao Início */}
      <button 
        className={styles.backToHomeButton}
        onClick={handleBackToHome}
        aria-label="Voltar ao início"
      >
        <span className={styles.buttonText}>Voltar ao Início</span>
      </button>

      {/* Botão Reiniciar Quiz (apenas se for o jogador atual) */}
      {sessionPlayerId && (
        <button 
          className={styles.restartButton}
          onClick={handleRestartQuiz}
          aria-label="Tentar novamente"
        >
          <span className={styles.buttonText}>Tentar Novamente</span>
        </button>
      )}
      
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
                jogadores={displayPlayers}
                titulo="Classificação"
                mostrarDadosExemplo={false}
              />
            </div>

            {/* Seção do Gráfico */}
            <div className={styles.chartSection}>
              <VerticalBarChart
                jogadores={displayPlayers}
                titulo="Performance da Partida"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}