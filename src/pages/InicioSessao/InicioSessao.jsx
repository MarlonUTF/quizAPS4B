import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
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

    const sessionId = searchParams.get('session');
    const playerId = searchParams.get('player');

    // 🔹 PEGAR PLAYER DO LOCALSTORAGE
    useEffect(() => {
        const savedPlayer = localStorage.getItem('quiz-player');
        if (savedPlayer) {
            const playerData = JSON.parse(savedPlayer);
            setPlayerInfo(playerData);
            setIsAdmin(playerData.is_admin || false);
        }
    }, []);

    // 🔹 CARREGAR DADOS DA SESSÃO
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

    // 🔹 CARREGAR JOGADORES + TEMPO REAL
    useEffect(() => {
        if (!sessionId) return;

        async function carregarJogadores() {
            setIsLoading(true);

            const { data, error } = await supabase
                .from('session_player')
                .select('*')
                .eq('session_id', sessionId)
                .eq('connected', true)
                .order('created_at', { ascending: true });

            if (!error) setJogadores(data);
            setIsLoading(false);
        }

        carregarJogadores();

        const channel = supabase
            .channel(`session-${sessionId}-players`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'session_player',
                    filter: `session_id=eq.${sessionId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setJogadores(prev => [...prev, payload.new]);
                    }
                    else if (payload.eventType === 'UPDATE') {
                        setJogadores(prev =>
                            prev.map(j => j.id === payload.new.id ? payload.new : j)
                        );
                    }
                    else if (payload.eventType === 'DELETE') {
                        setJogadores(prev =>
                            prev.filter(j => j.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [sessionId]);

    // 🔹 INDICAR QUE O PLAYER ESTÁ ONLINE
    useEffect(() => {
        if (!playerId || !sessionId) return;

        async function manterConexao() {
            await supabase
                .from('session_player')
                .update({ connected: true })
                .eq('id', playerId);

            const interval = setInterval(async () => {
                await supabase
                    .from('session_player')
                    .update({ connected: true })
                    .eq('id', playerId);
            }, 30000);

            return () => clearInterval(interval);
        }

        manterConexao();

        return async () => {
            await supabase
                .from('session_player')
                .update({ connected: false })
                .eq('id', playerId);
        };
    }, [playerId, sessionId]);

    // 🔹 ADMIN: INICIAR JOGO
    const handleIniciarJogo = async () => {
        if (!isAdmin) return alert('Apenas o administrador pode iniciar o jogo!');

        const { error } = await supabase
            .from('session')
            .update({
                status: 'in_progress',
                current_order: 1
            })
            .eq('id', sessionId);

        if (error) {
            alert('Erro ao iniciar jogo');
            return;
        }

        setJogoIniciado(true);
        window.location.href = `/quiz?sessao=${sessionId}&pergunta=1`;
    };

    // 🔹 REDIRECIONAR JOGADORES QUANDO O ADMIN INICIAR
    useEffect(() => {
        if (!sessionId) return;

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
                    if (payload.new.status === 'in_progress') {
                        window.location.href =
                            `/quiz?sessao=${sessionId}&pergunta=${payload.new.current_order || 1}`;
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [sessionId]);

    // 🔹 VERIFICAR SE O PLAYER TEM PERMISSÃO
    useEffect(() => {
        if (!sessionId || !playerId) {
            window.location.href = '/login-jogador';
            return;
        }

        async function verificarAcesso() {
            const { data } = await supabase
                .from('session_player')
                .select('*')
                .eq('id', playerId)
                .eq('session_id', sessionId)
                .single();

            if (!data) {
                window.location.href = '/login-jogador';
                return;
            }

            const { data: sessaoData } = await supabase
                .from('session')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (!sessaoData || sessaoData.status !== 'pending') {
                alert('A sessão já começou!');
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
                        Código da sala: <strong>{sessao?.code}</strong>
                    </p>
                    <p className={style.contadorJogadores}>
                        {jogadores.length} jogador(es) conectado(s)
                    </p>
                </div>
                <img src={Logo} className={style.logo} />
            </div>

            <div className={style.jogadores}>
                {jogadores.length > 0 ? (
                    jogadores.map(jogador => (
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

            {!isAdmin && (
                <div className={style.aguardandoAdmin}>
                    <p>Aguardando o administrador iniciar o jogo...</p>
                    <p>Jogadores na sala: {jogadores.length}</p>
                </div>
            )}
        </div>
    );
}
