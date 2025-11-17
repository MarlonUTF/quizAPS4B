import { useState } from 'react';
import style from './inicioSessao.module.css';

import Header from '../../components/layout/Header/Header.jsx';
import Logo from '../../../public/logo.png';
import Jogador from '../../components/ui/Jogador/Jogador.jsx';
import AlertaInicioJogo from '../../components/ui/AlertaInicioQuiz/AlertaInicioQuiz.jsx';
import AlertaAguardandoJogadores from '../../components/ui/AlertaAguardandoJogadores/AlertaAguardandoJogadores.jsx';

// 🔹 Objeto com dados dos jogadores
const dadosJogadores = [
    { id: 1, nome: "Ana Silva", emoji: "🌟", cor: "#FF6B6B" },
    { id: 2, nome: "Carlos Santos", emoji: "⚽", cor: "#4ECDC4" },
    { id: 3, nome: "Marina Costa", emoji: "🎨", cor: "#45B7D1" },
    { id: 4, nome: "Pedro Oliveira", emoji: "🎮", cor: "#96CEB4" },
    { id: 5, nome: "Julia Fernandes", emoji: "🎵", cor: "#FFEAA7" },
    { id: 6, nome: "Lucas Pereira", emoji: "🚀", cor: "#DDA0DD" },
    { id: 7, nome: "Beatriz Almeida", emoji: "📚", cor: "#98D8C8" },
    { id: 8, nome: "Rafael Souza", emoji: "🏀", cor: "#F7DC6F" },
    { id: 9, nome: "Isabela Lima", emoji: "🎭", cor: "#BB8FCE" },
    { id: 10, nome: "Bruno Rodrigues", emoji: "🎸", cor: "#85C1E9" },
    { id: 11, nome: "Camila Martins", emoji: "📷", cor: "#F8C471" },
    { id: 12, nome: "Diego Ferreira", emoji: "🎯", cor: "#82E0AA" },
    { id: 13, nome: "Larissa Silva", emoji: "✨", cor: "#F1948A" },
    { id: 14, nome: "Thiago Costa", emoji: "🏆", cor: "#7FB3D5" },
    { id: 15, nome: "Amanda Santos", emoji: "🌸", cor: "#F9E79F" },
    { id: 16, nome: "Gabriel Oliveira", emoji: "🎬", cor: "#D7BDE2" }
];

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
                {dadosJogadores.map((jogador) => (
                    <Jogador 
                        key={jogador.id}
                        nome={jogador.nome}
                        emoji={jogador.emoji}
                        cor={jogador.cor}
                    />
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