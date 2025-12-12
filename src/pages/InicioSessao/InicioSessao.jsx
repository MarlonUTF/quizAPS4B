import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import style from "./inicioSessao.module.css";

import Header from "../../components/layout/Header/Header.jsx";
import Logo from "../../../public/logo.png";
import Jogador from "../../components/ui/Jogador/Jogador.jsx";
import AlertaInicioJogo from "../../components/ui/AlertaInicioQuiz/AlertaInicioQuiz.jsx";
import AlertaAguardandoJogadores from "../../components/ui/AlertaAguardandoJogadores/AlertaAguardandoJogadores.jsx";

export default function InicioSessao() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [jogadores, setJogadores] = useState([]);
  const [sessao, setSessao] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(null);
  const [sessionAccessVerified, setSessionAccessVerified] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // modal / config states para iniciar quiz
  const [showStartModal, setShowStartModal] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState("20");
  const [starting, setStarting] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);

  const sessionId = searchParams.get("session");
  const playerId = searchParams.get("player");

  const playersChannelRef = useRef(null);
  const sessionChannelRef = useRef(null);
  const countdownChannelRef = useRef(null);
  const keepAliveIntervalRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  
  // Refs para controle de estado
  const countdownStartedRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const redirectRef = useRef(false);
  const isAdminRef = useRef(false);
  const playerIdRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Atualizar refs quando estados mudam
  useEffect(() => {
    isAdminRef.current = isAdmin;
    playerIdRef.current = playerId;
    sessionIdRef.current = sessionId;
  }, [isAdmin, playerId, sessionId]);

  // 🔹 CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (!sessionId || !playerId) {
      alert("Sessão ou jogador não identificado!");
      navigate("/telaloginjogador");
      return;
    }

    carregarDadosIniciais();

    return () => {
      // Cleanup
      if (playersChannelRef.current) {
        supabase.removeChannel(playersChannelRef.current);
      }
      if (sessionChannelRef.current) {
        supabase.removeChannel(sessionChannelRef.current);
      }
      if (countdownChannelRef.current) {
        supabase.removeChannel(countdownChannelRef.current);
      }
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [sessionId, playerId]);

  async function carregarDadosIniciais() {
    setIsLoading(true);

    try {
      // 1. Carregar sessão e verificar status
      const { data: sessaoData, error: sessaoError } = await supabase
        .from("session")
        .select(
          `
          *,
          quiz:quiz_id(*)
        `
        )
        .eq("id", sessionId)
        .single();

      if (sessaoError || !sessaoData) {
        alert("Sessão não encontrada!");
        navigate("/telaloginjogador");
        return;
      }

      setSessao(sessaoData);

      // Verificar se sessão já está em andamento
      if (sessaoData.status === "in_progress") {
        // Se já está em andamento, redirecionar corretamente
        handleRedirecionamento(sessaoData.current_order || 1, sessaoData.status);
        return;
      }

      // 2. Carregar total de perguntas do quiz
      const { count: totalPerguntas } = await supabase
        .from("quiz_question")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", sessaoData.quiz_id);

      setTotalQuestions(totalPerguntas || 0);

      // 3. Verificar jogador e carregar jogadores
      await verificarJogadorECarregarLista();

      // 4. Configurar subscriptions
      configurarSubscriptions();

      // 5. Manter conexão do jogador
      manterConexaoJogador();

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados da sessão!");
    } finally {
      setIsLoading(false);
    }
  }

  async function verificarJogadorECarregarLista() {
    // 1. Verificar jogador atual
    const { data: jogadorAtual, error: jogadorError } = await supabase
      .from("session_player")
      .select("*")
      .eq("id", playerId)
      .eq("session_id", sessionId)
      .single();

    if (jogadorError || !jogadorAtual) {
      alert("Jogador não encontrado nesta sessão!");
      navigate("/telaloginjogador");
      return;
    }

    setIsAdmin(jogadorAtual.is_admin || false);
    setPlayerInfo(jogadorAtual);

    // Salvar no localStorage para referência
    localStorage.setItem(
      "quiz-player",
      JSON.stringify({
        id: jogadorAtual.id,
        nickname: jogadorAtual.nickname,
        emoji: jogadorAtual.emoji,
        color: jogadorAtual.color,
        is_admin: jogadorAtual.is_admin,
        session_id: sessionId,
      })
    );

    // 2. Carregar todos os jogadores
    const { data: todosJogadores, error: jogadoresError } = await supabase
      .from("session_player")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!jogadoresError && todosJogadores) {
      setJogadores(todosJogadores);
    }

    setSessionAccessVerified(true);
  }

  function configurarSubscriptions() {
    // Subscription para jogadores
    if (playersChannelRef.current) {
      supabase.removeChannel(playersChannelRef.current);
    }

    playersChannelRef.current = supabase
      .channel(`session-${sessionId}-players`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_player",
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          // Atualizar lista de jogadores
          const { data: updatedPlayers } = await supabase
            .from("session_player")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

          if (updatedPlayers) {
            setJogadores(updatedPlayers);

            // Verificar se o jogador atual ainda é admin
            const jogadorAtual = updatedPlayers.find((j) => j.id === playerId);
            if (jogadorAtual) {
              setIsAdmin(jogadorAtual.is_admin || false);
            }

            // Mostrar notificação para novo jogador
            if (payload.eventType === "INSERT" && payload.new) {
              mostrarNotificacao(`${payload.new.nickname} entrou na sala!`);
            }
          }
        }
      )
      .subscribe();

    // Subscription para status da sessão
    if (sessionChannelRef.current) {
      supabase.removeChannel(sessionChannelRef.current);
    }

    sessionChannelRef.current = supabase
      .channel(`session-${sessionId}-status`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "session",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log("Status da sessão atualizado:", payload.new.status, "isAdminRef:", isAdminRef.current);
          
          if (payload.new.status === "in_progress") {
            // Evitar redirecionamentos múltiplos
            if (!redirectRef.current) {
              redirectRef.current = true;
              
              // Pequeno delay para garantir que todos vejam a contagem terminar
              setTimeout(() => {
                handleRedirecionamento(payload.new.current_order || 1, payload.new.status);
              }, 500);
            }
          }
        }
      )
      .subscribe();

    // Canal para sincronização de contagem regressiva
    if (countdownChannelRef.current) {
      supabase.removeChannel(countdownChannelRef.current);
    }

    countdownChannelRef.current = supabase
      .channel(`session-${sessionId}-countdown`)
      .on(
        'broadcast',
        { event: 'start_countdown' },
        (payload) => {
          console.log("Recebido sinal para iniciar contagem");
          // Evitar iniciar contagem múltiplas vezes
          if (!countdownStartedRef.current) {
            countdownStartedRef.current = true;
            setShowCountdown(true);
          }
        }
      )
      .subscribe();
  }

  function handleRedirecionamento(questionOrder, sessionStatus) {
    setJogoIniciado(true);
    
    // Usar refs para valores atualizados
    const currentIsAdmin = isAdminRef.current;
    const currentSessionId = sessionIdRef.current;
    const currentPlayerId = playerIdRef.current;
    
    console.log("Redirecionando - Admin:", currentIsAdmin, "Status:", sessionStatus);
    
    // Pequeno delay para garantir transição suave
    setTimeout(() => {
      if (currentIsAdmin) {
        // Admin vai para gerenciamento da sessão
        navigate(`/gerenciamentoSessao?session=${currentSessionId}&question=${questionOrder}`);
      } else {
        // Jogador normal vai para pergunta
        navigate(`/pergunta?session=${currentSessionId}&player=${currentPlayerId}&question=${questionOrder}`);
      }
    }, 100);
  }

  async function manterConexaoJogador() {
    // Atualizar jogador como conectado
    await supabase
      .from("session_player")
      .update({ connected: true })
      .eq("id", playerId);

    // Manter conexão ativa
    keepAliveIntervalRef.current = setInterval(async () => {
      try {
        await supabase
          .from("session_player")
          .update({ connected: true })
          .eq("id", playerId);
      } catch (error) {
        console.error("Erro ao manter conexão:", error);
      }
    }, 25000);

    // Configurar desconexão ao sair
    const marcarComoDesconectado = async () => {
      try {
        await supabase
          .from("session_player")
          .update({ connected: false })
          .eq("id", playerId);
      } catch (error) {
        console.error("Erro ao desconectar jogador:", error);
      }
    };

    window.addEventListener("beforeunload", marcarComoDesconectado);

    return () => {
      window.removeEventListener("beforeunload", marcarComoDesconectado);
      marcarComoDesconectado();
    };
  }

  function mostrarNotificacao(mensagem) {
    setShowNotification(mensagem);

    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  }

  // 🔹 ABRE O MODAL PARA CONFIGURAR TEMPO E INICIAR
  const handleIniciarJogo = () => {
    if (!isAdmin) {
      alert("Apenas o administrador pode iniciar o jogo!");
      return;
    }

    if (jogadores.length < 1) {
      alert("É necessário pelo menos 1 jogador para iniciar!");
      return;
    }

    if (totalQuestions === 0) {
      alert("Este quiz não tem perguntas! Adicione perguntas antes de iniciar.");
      return;
    }

    // abre o modal para escolha do tempo
    setStartTimeInput(String(sessao?.question_time_limit || 20));
    setShowStartModal(true);
  };

  // 🔹 START SESSION: valida e atualiza sessão
  const startSession = async () => {
    if (!isAdmin) {
      alert("Apenas o administrador pode iniciar o jogo!");
      return;
    }

    const tempo = Number(startTimeInput);

    if (!tempo || isNaN(tempo) || tempo < 5) {
      alert("Informe um tempo válido em segundos (mínimo 5).");
      return;
    }

    setStarting(true);

    try {
      // Verificar se há perguntas no quiz
      if (!sessao?.quiz_id) {
        alert("Erro: Quiz não encontrado!");
        setStarting(false);
        return;
      }

      const { data: quizQuestions, error: questionsError } = await supabase
        .from("quiz_question")
        .select("id")
        .eq("quiz_id", sessao.quiz_id);

      if (questionsError) {
        console.error("Erro ao verificar perguntas:", questionsError);
        alert("Erro ao verificar perguntas do quiz!");
        setStarting(false);
        return;
      }

      if (!quizQuestions || quizQuestions.length === 0) {
        alert("Este quiz não tem perguntas! Não é possível iniciar.");
        setStarting(false);
        return;
      }

      // Fechar modal primeiro
      setShowStartModal(false);

      // Resetar refs
      countdownStartedRef.current = false;
      sessionStartedRef.current = false;
      redirectRef.current = false;

      // Mostrar contagem para o admin também
      setShowCountdown(true);

      // Enviar sinal para todos os jogadores começarem a contagem
      try {
        if (countdownChannelRef.current) {
          await countdownChannelRef.current.send({
            type: 'broadcast',
            event: 'start_countdown',
            payload: {}
          });
          console.log("Sinal de contagem enviado para todos os jogadores");
        }
      } catch (error) {
        console.error("Erro ao enviar sinal de contagem:", error);
      }

    } catch (error) {
      console.error("Erro inesperado ao iniciar jogo:", error);
      alert("Erro ao iniciar jogo.");
      setStarting(false);
    }
  };

  // 🔹 QUANDO A CONTAGEM TERMINAR
  const handleContagemTerminada = async () => {
    console.log("Contagem terminada. Usuário é admin?", isAdmin);
    
    // Marcar contagem como completada
    setCountdownCompleted(true);
    
    // Se for admin, atualizar a sessão no banco
    if (isAdmin && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      await atualizarSessaoNoBanco();
    }
    
    // Esconder a contagem após um breve delay
    setTimeout(() => {
      setShowCountdown(false);
    }, 1000);
  };

  // 🔹 ATUALIZAR SESSÃO NO BANCO
  const atualizarSessaoNoBanco = async () => {
    setStarting(true);

    try {
      // Atualiza a sessão para in_progress
      const { error } = await supabase
        .from("session")
        .update({
          status: "in_progress",
          current_order: 1,
          question_time_limit: Number(startTimeInput),
          question_started_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Erro ao iniciar jogo:", error);
        alert("Erro ao iniciar jogo. Tente novamente.");
        setStarting(false);
        return;
      }

      console.log("Sessão atualizada para in_progress");
      setStarting(false);

    } catch (error) {
      console.error("Erro inesperado ao iniciar jogo:", error);
      alert("Erro ao iniciar jogo.");
      setStarting(false);
    }
  };

  // 🔹 CANCELAR MODAL
  const cancelStartModal = () => {
    setShowStartModal(false);
    setStartTimeInput(String(sessao?.question_time_limit || 20));
  };

  // 🔹 COPIA CÓDIGO DA SALA
  const copiarCodigoSala = () => {
    if (!sessao?.code) return;

    navigator.clipboard
      .writeText(sessao.code)
      .then(() => {
        alert("Código copiado: " + sessao.code);
      })
      .catch((err) => {
        console.error("Erro ao copiar código:", err);
        alert("Código da sala: " + sessao.code);
      });
  };

  // 🔹 SAIR DA SALA
  const sairDaSala = async () => {
    const confirmar = window.confirm("Tem certeza que deseja sair da sala?");

    if (confirmar) {
      try {
        if (playerId) {
          await supabase
            .from("session_player")
            .update({ connected: false })
            .eq("id", playerId);
        }

        localStorage.removeItem("quiz-player");
        navigate("/telaloginjogador");
      } catch (error) {
        console.error("Erro ao sair da sala:", error);
        navigate("/telaloginjogador");
      }
    }
  };

  // 🔹 NOTIFICAÇÃO TEMPORÁRIA
  useEffect(() => {
    if (!showNotification) return;

    const timer = setTimeout(() => {
      setShowNotification(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showNotification]);

  if (isLoading) {
    return (
      <div className={style.inicioSessao}>
        <Header />
        <div className={style.loadingContainer}>
          <div className={style.spinner}></div>
          <p>Carregando sala...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.inicioSessao}>
      {/* Notificação de novo jogador */}
      {showNotification && (
        <div className={style.notification}>
          <span>🎉</span>
          <span>{showNotification}</span>
        </div>
      )}

      {/* ALERTA DE CONTAGEM REGRESSIVA - VISÍVEL PARA TODOS */}
      {showCountdown && (
        <AlertaInicioJogo
          onIniciar={handleContagemTerminada}
          iniciarContagem={true}
          tempoContagem={5}
        />
      )}

      <Header
        textoTitulo={sessao?.quiz?.quiz_name || "Sala de Espera"}
        playerName={playerInfo?.nickname}
        playerEmoji={playerInfo?.emoji}
        playerColor={playerInfo?.color}
      />

      <div className={style.titulo}>
        <img src={Logo} className={style.logo} alt="Logo" />
      </div>

      {/* Código da Sala */}
      <div className={style.codigoSalaBox} onClick={copiarCodigoSala}>
        <p>Código da Sala</p>
        <strong>{sessao?.code || "..."}</strong>
        <p>Clique para copiar e compartilhar</p>
      </div>

      {/* Lista de Jogadores */}
      <div className={style.jogadores}>
        <h3>Jogadores na Sala ({jogadores.length})</h3>

        {jogadores.length > 0 ? (
          <div className={style.jogadoresList}>
            {jogadores.map((jogador) => (
              <Jogador
                key={jogador.id}
                nome={jogador.nickname}
                emoji={jogador.emoji}
                cor={jogador.color}
                isConnected={jogador.connected}
                isAdmin={jogador.is_admin}
                isCurrentPlayer={jogador.id === playerId}
              />
            ))}
          </div>
        ) : (
          <p className={style.semJogadores}>Aguardando jogadores...</p>
        )}
      </div>

      {/* Alertas */}
      {jogadores.length > 0 && (
        <AlertaAguardandoJogadores
          totalJogadores={jogadores.length}
          minJogadores={1}
        />
      )}

      {/* BOTÃO DO ADMINISTRADOR - SÓ APARECE SE NÃO ESTIVER EM CONTAGEM */}
      {isAdmin && !jogoIniciado && !showCountdown && (
        <div className={style.adminSection}>
          <div className={style.adminBadge}>
            <span>👑</span>
            <span>Você é o Administrador</span>
          </div>

          <button 
            className={style.botaoIniciarQuiz}
            onClick={handleIniciarJogo}
          >
            Iniciar Quiz
          </button>

          <p className={style.adminInstructions}>
            Este quiz tem {totalQuestions} pergunta(s)
            <br />
            Clique em "Iniciar Quiz" quando todos os jogadores estiverem
            prontos.
          </p>
        </div>
      )}

      {/* MENSAGEM PARA JOGADORES NORMAIS - SÓ APARECE SE NÃO ESTIVER EM CONTAGEM */}
      {!isAdmin && !jogoIniciado && !showCountdown && (
        <div className={style.waitingMessage}>
          <p className={style.aguardandoAdminText}>
            Aguardando o administrador iniciar o jogo...
          </p>
          <p>
            {jogadores.length} jogador(es) na sala • {totalQuestions}{" "}
            pergunta(s)
          </p>
          <button onClick={sairDaSala} className={style.exitButton}>
            Sair da Sala
          </button>
        </div>
      )}

      {/* MODAL DE INÍCIO */}
      {showStartModal && (
        <div className={style.modalOverlay} role="dialog" aria-modal="true">
          <div className={style.modal}>
            <h3>Configurar início do Quiz</h3>

            <div className={style.modalButtons}>
              <button
                className={style.modalCancel}
                onClick={cancelStartModal}
                disabled={starting}
              >
                Cancelar
              </button>

              <button
                className={style.modalConfirm}
                onClick={startSession}
                disabled={starting}
              >
                {starting
                  ? "Iniciando..."
                  : `Iniciar Quiz`}
              </button>
            </div>

            <p className={style.modalNote}>
              {totalQuestions} pergunta(s) • {jogadores.length} jogador(es)
              <br />
              Ao iniciar, todos os jogadores verão uma contagem regressiva de 5 segundos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}