import { useState } from 'react';
import style from './inicioSessao.module.css';

import Header from '../../components/layout/Header/Header.jsx';
import Logo from '../../../public/logo.png';
import Jogador from '../../components/ui/Jogador/Jogador.jsx';
import AlertaInicioJogo from '../../components/ui/AlertaInicioQuiz/AlertaInicioQuiz.jsx';
import AlertaAguardandoJogadores from '../../components/ui/AlertaAguardandoJogadores/AlertaAguardandoJogadores.jsx';

export default function InicioSessao() {
    const [jogoIniciado, setJogoIniciado] = useState(false);

    const handleIniciarJogo = () => {
        setJogoIniciado(true);
    };

    return (
        <div className={style.inicioSessao}>
            <Header />

            <div className={style.titulo}>
                <h1 className={style.textoTitulo}>Participantes</h1>
                <img src={Logo} className={style.logo}/>
            </div>

            <div className={style.jogadores}>
                {Array.from({ length: 16 }).map((_, i) => (
                    <Jogador key={i} nome={`Usuário ${i + 1}`} />
                ))}
            </div>
            
            <AlertaAguardandoJogadores />

            {/* ALERTA ANTES DO JOGO */}
            {!jogoIniciado && (
                <AlertaInicioJogo onIniciar={handleIniciarJogo} />
            )}
        </div>
    );
}
