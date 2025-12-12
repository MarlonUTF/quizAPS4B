import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Confetti from "react-confetti";
import FinalSessao from "../../components/layout/Colocacao/Colocacao";
import VerticalBarChart from "../../components/layout/BarChart/VerticalBarChart";
import Header from "../../components/layout/Header/Header";
import styles from "../FinalSessao/finalSessao.module.css";
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
  const [questionsData, setQuestionsData] = useState([]);

  // ---------------------------
  // 🔥 ATUALIZA AUTO - REALTIME
  // ---------------------------
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`final_sessao_${sessionId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "player_answer",
        filter: `session_id=eq.${sessionId}`,
      }, () => {
        loadSessionData();
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "session_player",
        filter: `session_id=eq.${sessionId}`,
      }, () => {
        loadSessionData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      navigate("/telaloginjogador");
      return;
    }

    loadSessionData();

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [sessionId, navigate]);


  // ---------------------------
  // 🔥 CARREGA TUDO DO BANCO
  // ---------------------------
  const loadSessionData = async () => {
    setIsLoading(true);
    setError(null);

    try {
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

      const { data: quizQuestions, error: questionsError } = await supabase
        .from("quiz_question")
        .select(`
          id,
          question:question_id (
            id,
            options:option(*)
          )
        `)
        .eq("quiz_id", sessionData.quiz_id);

      if (questionsError) throw new Error("Erro ao carregar perguntas");

      const correctAnswersMap = {};
      quizQuestions.forEach((qq) => {
        const correctOption = qq.question?.options?.find(
          (opt) => opt.is_correct === true
        );
        if (correctOption) {
          correctAnswersMap[qq.id] = correctOption.id;
        }
      });

      setTotalQuestions(quizQuestions.length);
      setQuestionsData(quizQuestions);

      const { data: playersData, error: playersError } = await supabase
        .from("session_player")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (playersError) throw new Error("Erro ao carregar jogadores");

      if (sessionPlayerId) {
        const currentPlayerData = playersData.find(
          (p) => p.id === sessionPlayerId
        );
        setCurrentPlayer(currentPlayerData);
      }

      const playersWithScores = await Promise.all(
        playersData.map(async (player) => {
          const { data: playerAnswers, error: answersError } = await supabase
            .from("player_answer")
            .select("quiz_question_id, option_id")
            .eq("session_player_id", player.id)
            .eq("session_id", sessionId);

          if (answersError) {
            console.error(
              "Erro ao carregar respostas do jogador:",
              player.nickname,
              answersError
            );
            return {
              nome: player.nickname,
              emoji: player.emoji,
              cor: player.color,
              acertos: 0,
              total: quizQuestions.length,
              sessionPlayerId: player.id,
              isCurrentPlayer: player.id === sessionPlayerId,
            };
          }

          let correctCount = 0;

          if (playerAnswers && playerAnswers.length > 0) {
            playerAnswers.forEach((answer) => {
              const correctOptionId = correctAnswersMap[answer.quiz_question_id];
              if (correctOptionId && answer.option_id === correctOptionId) {
                correctCount++;
              }
            });
          }

          return {
            nome: player.nickname,
            emoji: player.emoji,
            cor: player.color,
            acertos: correctCount,
            total: quizQuestions.length,
            sessionPlayerId: player.id,
            isCurrentPlayer: player.id === sessionPlayerId,
          };
        })
      );

      // ============ TRECHO MODIFICADO - INÍCIO ============
      const sortedPlayers = playersWithScores.sort((a, b) => {
        // Ordena por acertos
        if (b.acertos !== a.acertos) {
          return b.acertos - a.acertos;
        }

        // Desempate por ordem de criação (quem entrou antes vence)
        const aPlayer = playersData.find((p) => p.id === a.sessionPlayerId);
        const bPlayer = playersData.find((p) => p.id === b.sessionPlayerId);
        return new Date(aPlayer.created_at) - new Date(bPlayer.created_at);
      });

      // ---------- TRATAR EMPATES ----------
      let lastScore = null;
      let lastRank = 0;
      let count = 0;

      const rankedPlayers = sortedPlayers.map((player) => {
        count++;

        if (player.acertos !== lastScore) {
          // Novo valor → atualizar rank
          lastRank = count;
          lastScore = player.acertos;
        }

        return {
          ...player,
          posicao: lastRank, // Jogadores empatados ficam com o mesmo rank
        };
      });

      setPlayers(rankedPlayers);
      // ============ TRECHO MODIFICADO - FIM ============

    } catch (err) {
      console.error("Erro ao carregar dados da sessão:", err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => navigate("/inicio");

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
            <button onClick={() => navigate("/inicio")} className={styles.backButton}>
              Voltar ao início
            </button>
            <button onClick={loadSessionData} className={styles.retryButton}>
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayPlayers =
    players.length > 0
      ? players
      : [{ nome: "Nenhum jogador", emoji: "😔", cor: "#CCC", acertos: 0, posicao: 1 }];

  return (
    <div className={styles.pageContainer}>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={150}
          gravity={0.05}
          wind={0.005}
          recycle={false}
        />
      )}

      <Header />

      <button className={styles.backToHomeButton} onClick={handleBackToHome}>
        <span className={styles.buttonText}>Voltar ao Início</span>
      </button>

      <div className={styles.titulo}>
        <h1 className={styles.textoTitulo}>Ranking Final</h1>
        <img src={Logo} className={styles.logo} alt="Logo" />
      </div>

      <div className={styles.contentMain}>
        <div className={styles.resultsWrapper}>
          <div className={styles.resultsContainer}>
            <div className={styles.tableSection}>
              <FinalSessao jogadores={displayPlayers} titulo="Classificação" />
            </div>

            <div className={styles.chartSection}>
              <VerticalBarChart jogadores={displayPlayers} titulo="Performance da Partida" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}