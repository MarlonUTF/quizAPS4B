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
  
  const sessionId = searchParams.get("session");
  const playerId = searchParams.get("player");
  
  const playersChannelRef = useRef(null);
  const sessionChannelRef = useRef(null);
  const keepAliveIntervalRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // 🔹 CARREGAR DADOS DO JOGADOR DO LOCALSTORAGE
  useEffect(() => {
    const savedPlayer = localStorage.getItem("quiz-player");
    if (savedPlayer) {
      try {
        const playerData = JSON.parse(savedPlayer);
        setPlayerInfo(playerData);
        setIsAdmin(playerData.is_admin || false);
      } catch (error) {
        console.error("Erro ao carregar jogador do localStorage:", error);
      }
    }
  }, []);

  // 🔹 CARREGAR DADOS DA SESSÃO (UMA VEZ)
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

  // 🔹 CARREGAR JOGADORES INICIAL + CONFIGURAR SUBSCRIPTION EM TEMPO REAL
  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;

    async function carregarJogadoresInicial() {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("session_player")
          .select("*")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Erro ao carregar jogadores:", error);
          return;
        }

        if (mounted) {
          setJogadores(data || []);
        }
      } catch (error) {
        console.error("Erro inesperado:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    carregarJogadoresInicial();

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

          console.log("Mudança detectada:", payload.eventType, payload.new?.nickname);
          
          // Recarregar toda a lista para garantir consistência
          const { data: updatedPlayers } = await supabase
            .from("session_player")
            .select("*")
            .eq("session_id", sessionId)
            .order("created_at", { ascending: true });

          if (mounted && updatedPlayers) {
            setJogadores(updatedPlayers);
            
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
  }, [sessionId]);

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

        // Configurar interval para manter conexão
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
        }, 25000); // A cada 25 segundos
      } catch (error) {
        console.error("Erro ao conectar jogador:", error);
      }
    }

    manterConexao();

    // Função para marcar como desconectado
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

    // Marcar como desconectado ao sair da página
    const handleBeforeUnload = () => {
      marcarComoDesconectado();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      mounted = false;
      
      // Limpar interval
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      
      // Remover event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Marcar como desconectado
      marcarComoDesconectado();
    };
  }, [playerId, sessionId]);

  // 🔹 MONITORAR STATUS DA SESSÃO (PARA REDIRECIONAMENTO)
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

  // 🔹 VERIFICAR SE O JOGADOR TEM PERMISSÃO PARA ENTRAR
  useEffect(() => {
    if (!sessionId || !playerId) {
      navigate("/telaloginjogador");
      return;
    }

    let mounted = true;

    async function verificarAcesso() {
      try {
        // Verificar se jogador existe na sessão
        const { data: jogador, error: jogadorError } = await supabase
          .from("session_player")
          .select("*")
          .eq("id", playerId)
          .eq("session_id", sessionId)
          .single();

        if (jogadorError || !jogador) {
          if (mounted) {
            alert("Jogador não encontrado na sessão!");
            navigate("/login-jogador");
          }
          return;
        }

        // Verificar se sessão existe
        const { data: sessaoData, error: sessaoError } = await supabase
          .from("session")
          .select("*")
          .eq("id", sessionId)
          .single();

        if (sessaoError || !sessaoData) {
          if (mounted) {
            alert("Sessão não encontrada!");
            navigate("/login-jogador");
          }
          return;
        }

        // Verificar status da sessão
        if (sessaoData.status !== "pending") {
          const statusMsg = sessaoData.status === "in_progress" 
            ? "em andamento" 
            : "finalizada";
          
          if (mounted) {
            alert(`Esta sessão já está ${statusMsg}!`);
            navigate("/login-jogador");
          }
          return;
        }

      } catch (error) {
        console.error("Erro ao verificar acesso:", error);
        if (mounted) {
          navigate("/login-jogador");
        }
      }
    }

    verificarAcesso();

    return () => {
      mounted = false;
    };
  }, [sessionId, playerId, navigate]);

  // 🔹 ADMIN: INICIAR JOGO
  const handleIniciarJogo = async () => {
    if (!isAdmin) {
      alert("Apenas o administrador pode iniciar o jogo!");
      return;
    }

    if (jogadores.length < 1) {
      alert("É necessário pelo menos 1 jogador para iniciar!");
      return;
    }

    const confirmar = window.confirm(
      `Iniciar o jogo com ${jogadores.length} jogador(es)?`
    );
    
    if (!confirmar) return;

    try {
      const { error } = await supabase
        .from("session")
        .update({
          status: "in_progress",
          current_order: 1,
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Erro ao iniciar jogo:", error);
        alert("Erro ao iniciar jogo. Tente novamente.");
        return;
      }

      setJogoIniciado(true);
      navigate(`/quiz?sessao=${sessionId}&pergunta=1`);
    } catch (error) {
      console.error("Erro inesperado ao iniciar jogo:", error);
      alert("Erro ao iniciar jogo.");
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

      <Header
        textoTitulo={sessao?.quiz?.quiz_name || "Sala de Espera"}
        playerName={playerInfo?.nickname}
        playerEmoji={playerInfo?.emoji}
        playerColor={playerInfo?.color}
      />

      <div className={style.titulo}>
        <img src={Logo} className={style.logo} alt="Logo" />
      </div>

      <div className={style.jogadores}>
        {jogadores.length > 0 ? (
          jogadores.map((jogador) => (
            <Jogador
              key={jogador.id}
              nome={jogador.nickname}
              emoji={jogador.emoji}
              cor={jogador.color}
              isConnected={jogador.connected}
              isAdmin={jogador.is_admin}
              isCurrentPlayer={jogador.id === playerId}
            />
          ))
        ) : (
          <p className={style.semJogadores}>Aguardando jogadores...</p>
        )}
      </div>

      {jogadores.length > 0 && (
        <AlertaAguardandoJogadores
          totalJogadores={jogadores.length}
          minJogadores={1}
        />
      )}

      {isAdmin && !jogoIniciado && (
        <AlertaInicioJogo
          onIniciar={handleIniciarJogo}
          totalJogadores={jogadores.length}
        />
      )}

      {!isAdmin && !jogoIniciado && (
        <div className={style.codigoSalaBox}>
          <p>Código da Sala</p>
          <strong>{sessao?.code}</strong>
          <p>{jogadores.length} jogador(es) conectado(s)</p>
          <p className={style.aguardandoAdminText}>
            Aguardando o administrador iniciar o jogo...
          </p>
        </div>
      )}
    </div>
  );
}