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

  // modal / config states para iniciar quiz
  const [showStartModal, setShowStartModal] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState("20");
  const [starting, setStarting] = useState(false);
  
  const sessionId = searchParams.get("session");
  const playerId = searchParams.get("player");
  
  const playersChannelRef = useRef(null);
  const sessionChannelRef = useRef(null);
  const keepAliveIntervalRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // 🔹 CARREGAR DADOS DO JOGADOR DO LOCALSTORAGE (REMOVER ISSO - usar banco de dados)
  useEffect(() => {
    const savedPlayer = localStorage.getItem("quiz-player");
    if (savedPlayer) {
      try {
        const playerData = JSON.parse(savedPlayer);
        setPlayerInfo(playerData);
        // NÃO DEFINIR isAdmin AQUI - vamos verificar no banco
      } catch (error) {
        console.error("Erro ao carregar jogador do localStorage:", error);
      }
    }
  }, []);

  // 🔹 CARREGAR DADOS DA SESSÃO
  useEffect(() => {
    if (!sessionId) return;

    async function carregarSessao() {
      const { data, error } = await supabase
        .from("session")
        .select("*, quiz:quiz_id(*)")
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Erro ao carregar sessão:", error);
        return;
      }

      setSessao(data);
    }

    carregarSessao();
  }, [sessionId]);

  // 🔹 CARREGAR JOGADORES + VERIFICAR SE PLAYER É ADMIN
  useEffect(() => {
    if (!sessionId || !playerId) return;

    let mounted = true;

    async function carregarEVerificar() {
      if (!mounted) return;
      
      setIsLoading(true);
      
      try {
        // 1. Primeiro verificar se o jogador existe e é admin
        const { data: jogadorAtual, error: jogadorError } = await supabase
          .from("session_player")
          .select("*")
          .eq("id", playerId)
          .eq("session_id", sessionId)
          .single();

        if (jogadorError || !jogadorAtual) {
          console.error("Jogador não encontrado na sessão:", jogadorError);
          if (mounted) {
            alert("Jogador não encontrado nesta sessão!");
            navigate("/telaloginjogador");
          }
          return;
        }

        // Definir se é admin
        if (mounted) {
          setIsAdmin(jogadorAtual.is_admin || false);
          setPlayerInfo(jogadorAtual);
          
          // Salvar no localStorage para referência
          localStorage.setItem("quiz-player", JSON.stringify({
            id: jogadorAtual.id,
            nickname: jogadorAtual.nickname,
            emoji: jogadorAtual.emoji,
            color: jogadorAtual.color,
            is_admin: jogadorAtual.is_admin,
            session_id: sessionId
          }));
        }

        // 2. Carregar todos os jogadores
        const { data: todosJogadores, error: jogadoresError } = await supabase
          .from("session_player")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        if (jogadoresError) {
          console.error("Erro ao carregar jogadores:", jogadoresError);
          return;
        }

        if (mounted) {
          setJogadores(todosJogadores || []);
          setSessionAccessVerified(true);
        }

      } catch (error) {
        console.error("Erro inesperado:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    carregarEVerificar();

    // 🔹 SUBSCRIÇÃO EM TEMPO REAL PARA JOGADORES
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
          if (!mounted) return;

          console.log("Mudança detectada:", payload.eventType);
          
          // Recarregar lista de jogadores
          const { data: updatedPlayers } = await supabase
            .from("session_player")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

          if (mounted && updatedPlayers) {
            setJogadores(updatedPlayers);
            
            // Verificar se o jogador atual ainda é admin (caso tenha mudado)
            const jogadorAtual = updatedPlayers.find(j => j.id === playerId);
            if (jogadorAtual && mounted) {
              setIsAdmin(jogadorAtual.is_admin || false);
            }
            
            // Mostrar notificação para novo jogador
            if (payload.eventType === "INSERT" && payload.new) {
              setShowNotification(`${payload.new.nickname} entrou na sala!`);
              
              if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
              }
              
              notificationTimeoutRef.current = setTimeout(() => {
                setShowNotification(null);
              }, 3000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      if (playersChannelRef.current) {
        supabase.removeChannel(playersChannelRef.current);
        playersChannelRef.current = null;
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [sessionId, playerId, navigate]);

  // 🔹 VERIFICAR STATUS DA SESSÃO ANTES DE PERMITIR ENTRADA
  useEffect(() => {
    if (!sessionId || !sessionAccessVerified) return;

    async function verificarStatusSessao() {
      const { data: sessaoData, error } = await supabase
        .from("session")
        .select("status")
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Erro ao verificar status da sessão:", error);
        return;
      }

      if (sessaoData.status !== "pending") {
        const statusMsg = sessaoData.status === "in_progress" 
          ? "em andamento" 
          : "finalizada";
        
        alert(`Esta sessão já está ${statusMsg}!`);
        navigate("/telaloginjogador");
      }
    }

    verificarStatusSessao();
  }, [sessionId, sessionAccessVerified, navigate]);

  // 🔹 MANTER JOGADOR CONECTADO
  useEffect(() => {
    if (!playerId || !sessionId) return;

    let mounted = true;

    async function manterConexao() {
      if (!mounted) return;
      
      try {
        await supabase
          .from("session_player")
          .update({ connected: true })
          .eq("id", playerId);

        keepAliveIntervalRef.current = setInterval(async () => {
          if (!mounted) return;
          
          try {
            await supabase
              .from("session_player")
              .update({ connected: true })
              .eq("id", playerId);
          } catch (error) {
            console.error("Erro ao manter conexão:", error);
          }
        }, 25000);
      } catch (error) {
        console.error("Erro ao conectar jogador:", error);
      }
    }

    manterConexao();

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

    const handleBeforeUnload = () => {
      marcarComoDesconectado();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      mounted = false;
      
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      marcarComoDesconectado();
    };
  }, [playerId, sessionId]);

  // 🔹 MONITORAR STATUS DA SESSÃO PARA REDIRECIONAMENTO
  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;

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
          if (!mounted) return;
          
          console.log("Status da sessão atualizado:", payload.new.status);
          
          if (payload.new.status === "in_progress") {
            setJogoIniciado(true);
            navigate(`/quiz?sessao=${sessionId}&pergunta=${payload.new.current_order || 1}`);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      if (sessionChannelRef.current) {
        supabase.removeChannel(sessionChannelRef.current);
        sessionChannelRef.current = null;
      }
    };
  }, [sessionId, navigate]);

  // 🔹 ABRE O MODAL PARA CONFIGURAR TEMPO E INICIAR (chamado pelo botão do AlertaInicioJogo)
  const handleIniciarJogo = () => {
    if (!isAdmin) {
      alert("Apenas o administrador pode iniciar o jogo!");
      return;
    }

    if (jogadores.length < 1) {
      alert("É necessário pelo menos 1 jogador para iniciar!");
      return;
    }

    // abre o modal para escolha do tempo
    setStartTimeInput(String(sessao?.question_time_limit || 20));
    setShowStartModal(true);
  };

  // 🔹 START SESSION: valida e atualiza sessão (chamado ao confirmar no modal)
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

      // Atualiza a sessão para in_progress com o tempo escolhido
      const { error } = await supabase
        .from("session")
        .update({
          status: "in_progress",
          current_order: 1,
          question_time_limit: tempo,
          question_started_at: new Date().toISOString()
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Erro ao iniciar jogo:", error);
        alert("Erro ao iniciar jogo. Tente novamente.");
        setStarting(false);
        return;
      }

      // fecha modal e marca iniciado (subscription fará o redirecionamento)
      setShowStartModal(false);
      setStarting(false);
      setJogoIniciado(true);

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
    
    navigator.clipboard.writeText(sessao.code)
      .then(() => {
        alert("Código copiado: " + sessao.code);
      })
      .catch(err => {
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

  // 🔹 DEBUG: Mostrar informações no console
  useEffect(() => {
    console.log("DEBUG - isAdmin:", isAdmin, "playerId:", playerId, "jogadores:", jogadores.length);
  }, [isAdmin, playerId, jogadores]);

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

      {/* BOTÃO DO ADMINISTRADOR */}
      {isAdmin && !jogoIniciado && (
        <div className={style.adminSection}>
          <div className={style.adminBadge}>
            <span>👑</span>
            <span>Você é o Administrador</span>
          </div>
          
          {/* AlertaInicioJogo chama handleIniciarJogo que abre o modal */}
          <AlertaInicioJogo
            onIniciar={handleIniciarJogo}
            totalJogadores={jogadores.length}
            minPlayersRequired={1}
          />
          
          <p className={style.adminInstructions}>
            Clique em "Iniciar Quiz" quando todos os jogadores estiverem prontos.
            <br />
            O jogo começará para todos os jogadores simultaneamente.
          </p>
        </div>
      )}

      {/* MENSAGEM PARA JOGADORES NORMAIS */}
      {!isAdmin && !jogoIniciado && (
        <div className={style.waitingMessage}>
          <p className={style.aguardandoAdminText}>
            Aguardando o administrador iniciar o jogo...
          </p>
          <p>{jogadores.length} jogador(es) na sala</p>
          <button onClick={sairDaSala} className={style.exitButton}>
            Sair da Sala
          </button>
        </div>
      )}

      {/* -------------------- MODAL DE INÍCIO -------------------- */}
      {showStartModal && (
        <div className={style.modalOverlay} role="dialog" aria-modal="true">
          <div className={style.modal}>
            <h3>Configurar início do Quiz</h3>
            <p>Defina o tempo (em segundos) para cada pergunta:</p>

            <div className={style.modalInputRow}>
              <input
                type="number"
                min="5"
                step="1"
                value={startTimeInput}
                onChange={(e) => setStartTimeInput(e.target.value)}
                className={style.modalInput}
              />
              <span>segundos</span>
            </div>

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
                {starting ? "Iniciando..." : `Iniciar Quiz (${startTimeInput}s)`}
              </button>
            </div>

            <p className={style.modalNote}>
              Ao iniciar, todos os jogadores serão redirecionados para a primeira pergunta.
            </p>
          </div>
        </div>
      )}
      {/* ------------------ fim modal ------------------- */}

    </div>
  );
}