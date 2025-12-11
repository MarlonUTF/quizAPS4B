import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Apenas adicionei isso
import style from "./header.module.css";

export default function Header({ 
    textoTitulo = "", 
    playerName = "", 
    playerEmoji = "", 
    playerColor = "",
    showOnlyWhenData = false
}) {
    const [hasContent, setHasContent] = useState(false);
    const navigate = useNavigate(); // Apenas adicionei isso

    useEffect(() => {
        const hasTitle = textoTitulo && textoTitulo.trim() !== "";
        const hasPlayer = playerName && playerEmoji && playerColor;
        const shouldShow = hasTitle || hasPlayer;
        
        setHasContent(shouldShow);
    }, [textoTitulo, playerName, playerEmoji, playerColor]);

    // Função simples para ir para home
    const goHome = () => {
        navigate('/');
    };

    if (showOnlyWhenData && !hasContent) {
        return (
            // Quando não tem conteúdo, mostra apenas o botão Home
            <header className={style.header}>
                <button 
                    className={style.homeBtn}
                    onClick={goHome}
                >
                    Home
                </button>
            </header>
        );
    }

    const hasPlayer = playerName && playerEmoji && playerColor;
    const hasTitle = textoTitulo && textoTitulo.trim() !== "";

    return (
        <header className={`${style.header} ${!hasContent ? style.empty : ''}`}>
            <div className={`${style.left} ${hasPlayer && hasTitle ? style.hasColorBar : ''}`}>
                {hasPlayer && hasTitle && (
                    <div 
                        className={style.colorBar} 
                        style={{ backgroundColor: playerColor }}
                        title={`Cor de ${playerName}`}
                    />
                )}
                
                {hasTitle && (
                    <h1 className={style.titulo}>{textoTitulo}</h1>
                )}
            </div>

            {hasPlayer && (
                <div 
                    className={style.playerBox}
                    style={{ 
                        borderLeft: `3px solid ${playerColor}`,
                        borderColor: playerColor
                    }}
                    title={`Jogador: ${playerName}`}
                >
                    <span className={style.emoji}>{playerEmoji}</span>
                    <span className={style.nome}>{playerName}</span>
                </div>
            )}
        </header>
    );
}