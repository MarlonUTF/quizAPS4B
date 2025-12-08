import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; // Ajuste o caminho conforme necessário
import style from './inicioSessao.module.css';

import Header from '../../components/layout/Header/Header.jsx';
import Logo from '../../../public/logo.png';
import Jogador from '../../components/ui/Jogador/Jogador.jsx';
import AlertaInicioJogo from '../../components/ui/AlertaInicioQuiz/AlertaInicioQuiz.jsx';
import AlertaAguardandoJogadores from '../../components/ui/AlertaAguardandoJogadores/AlertaAguardandoJogadores.jsx';

export default function InicioSessao() {
    const [searchParams] = useSearchParams();
    const [jogoIniciado, setJogoIniciado] = useState(false);
    const [jogadores, setJogadores] = useState([]);
    const [sessao, setSessao] = useState(null);
    const [playerInfo, setPlayerInfo] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Obter parâmetros da URL
    const sessionId = searchParams.get('session');
    const playerId = searchParams.get('player');

    // 🔹 CARREGAR INFORMAÇÕES DO JOGADOR
    useEffect(() => {
        const savedPlayer = localStorage.getItem('quiz-player');
        if (savedPlayer) {
            const playerData = JSON.parse(savedPlayer);
            setPlayerInfo(playerData);
            setIsAdmin(playerData.is_admin || false);
        }
    }, []);

    // 🔹 BUSCAR DADOS DA SESSÃO
    useEffect(() => {
        if (!sessionId) return;

        async function carregarSessao() {
            const { data, error } = await supabase
                .from('session')
                .select('*, quiz:quiz_id(*)')
                .eq('id', sessionId)
                .single();

            if (error) {
                console.error('Erro ao carregar sessão:', error);
                return;
            }

            setSessao(data);
        }

        carregarSessao();
    }, [sessionId]);

    // 🔹 BUSCAR JOGADORES DA SESSÃO EM TEMPO REAL
    useEffect(() => {
        if (!sessionId) return;

        async function carregarJogadores() {
            setIsLoading(true);
            
            // Busca inicial
            const { data, error } = await supabase
                .from('session_player')
                .select('*')
                .eq('session_id', sessionId)
                .eq('connected', true)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Erro ao carregar jogadores:', error);
                return;
            }

            setJogadores(data);
            setIsLoading(false);
        }

        // Carregar inicialmente
        carregarJogadores();

        // 🔹 SUBSCRIÇÃO EM TEMPO REAL PARA NOVOS JOGADORES
        const channel = supabase
            .channel(`session-${sessionId}-players`)
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'session_player',
                    filter: `session_id=eq.${sessionId}`
                },
                (payload) => {
                    console.log('Mudança detectada:', payload);
                    
                    // Atualizar lista de jogadores
                    if (payload.eventType === 'INSERT') {
                        setJogadores(prev => [...prev, payload.new]);
                    } 
                    else if (payload.eventType === 'UPDATE') {
                        setJogadores(prev => 
                            prev.map(jogador => 
                                jogador.id === payload.new.id ? payload.new : jogador
                            )
                        );
                    }
                    else if (payload.eventType === 'DELETE') {
                        setJogadores(prev => 
                            prev.filter(jogador => jogador.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        // Limpar subscription ao desmontar
        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    // 🔹 VERIFICAR SE JOGADOR ESTÁ CONECTADO
    useEffect(() => {
        if (!playerId || !sessionId) return;

        // Atualizar status do jogador como conectado
        async function manterConexao() {
            await supabase
                .from('session_player')
                .update({ connected: true })
                .eq('id', playerId);

            // Atualizar periodicamente para mostrar que está online
            const interval = setInterval(async () => {
                await supabase
                    .from('session_player')
                    .update({ connected: true })
                    .eq('id', playerId);
            }, 30000); // A cada 30 segundos

            return () => clearInterval(interval);
        }

        manterConexao();

        // Marcar como desconectado ao sair da página
        return async () => {
            await supabase
                .from('session_player')
                .update({ connected: false })
                .eq('id', playerId);
        };
    }, [playerId, sessionId]);

    // 🔹 INICIAR JOGO (apenas admin)
    const handleIniciarJogo = async () => {
        if (!isAdmin) {
            alert('Apenas o administrador pode iniciar o jogo!');
            return;
        }

        // Atualizar status da sessão para "em andamento"
        const { error } = await supabase
            .from('session')
            .update({ 
                status: 'in_progress',
                current_order: 1 // Primeira pergunta
            })
            .eq('id', sessionId);

        if (error) {
            console.error('Erro ao iniciar jogo:', error);
            alert('Erro ao iniciar jogo');
            return;
        }

        setJogoIniciado(true);
        
        // Redirecionar para a primeira pergunta
        window.location.href = `/quiz?sessao=${sessionId}&pergunta=1`;
    };

    // 🔹 VERIFICAR SE ADMIN INICIOU O JOGO (para redirecionar todos)
    useEffect(() => {
        if (!sessionId || !playerId) return;

        // Verificar status da sessão em tempo real
        const channel = supabase
            .channel(`session-${sessionId}-status`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'session',
                    filter: `id=eq.${sessionId}`
                },
                (payload) => {
                    console.log('Status da sessão atualizado:', payload.new.status);
                    
                    if (payload.new.status === 'in_progress') {
                        // Redirecionar todos os jogadores para o quiz
                        window.location.href = `/quiz?sessao=${sessionId}&pergunta=${payload.new.current_order || 1}`;
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, playerId]);

    // 🔹 VERIFICAR SE JOGADOR PODE ENTRAR
    useEffect(() => {
        if (!sessionId || !playerId) {
            // Redirecionar para login se não tiver parâmetros
            window.location.href = '/login-jogador';
            return;
        }

        async function verificarAcesso() {
            const { data, error } = await supabase
                .from('session_player')
                .select('*')
                .eq('id', playerId)
                .eq('session_id', sessionId)
                .single();

            if (error || !data) {
                console.error('Jogador não encontrado na sessão');
                window.location.href = '/login-jogador';
                return;
            }

            // Verificar se sessão existe
            const { data: sessaoData } = await supabase
                .from('session')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (!sessaoData) {
                alert('Sessão não encontrada!');
                window.location.href = '/login-jogador';
                return;
            }

            // Verificar se sessão ainda não começou
            if (sessaoData.status !== 'pending') {
                alert('A sessão já começou ou foi finalizada!');
                window.location.href = '/login-jogador';
                return;
            }
        }

        verificarAcesso();
    }, [sessionId, playerId]);

    if (isLoading) {
        return (
            <div className={style.inicioSessao}>
                <Header />
                <div className={style.loadingContainer}>
                    <div className={style.spinner}></div>
                    <p>Carregando jogadores...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={style.inicioSessao}>
            <Header 
                playerName={playerInfo?.nickname}
                playerEmoji={playerInfo?.emoji}
                playerColor={playerInfo?.color}
            />

            <div className={style.titulo}>
                <div>
                    <h1 className={style.textoTitulo}>
                        {sessao?.quiz?.quiz_name || 'Sala de Espera'}
                    </h1>
                    <p className={style.codigoSala}>
                        Código da sala: <strong>{sessao?.code || '...'}</strong>
                    </p>
                    <p className={style.contadorJogadores}>
                        {jogadores.length} jogador(es) conectado(s)
                    </p>
                </div>
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
                        />
                    ))
                ) : (
                    <p className={style.semJogadores}>
                        Aguardando jogadores entrarem...
                    </p>
                )}
            </div>
            
            {jogadores.length > 0 && (
                <AlertaAguardandoJogadores 
                    totalJogadores={jogadores.length}
                    minJogadores={1}
                />
            )}

            {/* ALERTA ANTES DO JOGO - Só aparece para admin */}
            {!jogoIniciado && isAdmin && (
                <AlertaInicioJogo 
                    onIniciar={handleIniciarJogo}
                    totalJogadores={jogadores.length}
                />
            )}

            {/* Indicador para jogadores não-admin */}
            {!isAdmin && (
                <div className={style.aguardandoAdmin}>
                    <p>Aguardando o administrador iniciar o jogo...</p>
                    <p>Jogadores na sala: {jogadores.length}</p>
                </div>
            )}
        </div>
    );
}