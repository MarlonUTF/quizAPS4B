import { useState, useEffect } from 'react';
import style from "./header.module.css";

export default function Header({ 
    textoTitulo = "", 
    playerName = "", 
    playerEmoji = "", 
    playerColor = "",
    showOnlyWhenData = false // Nova prop: só mostra se tiver dados
}) {
    const [hasContent, setHasContent] = useState(false);

    // Verifica se há conteúdo para exibir
    useEffect(() => {
        const hasTitle = textoTitulo && textoTitulo.trim() !== "";
        const hasPlayer = playerName && playerEmoji && playerColor;
        const shouldShow = hasTitle || hasPlayer;
        
        setHasContent(shouldShow);
    }, [textoTitulo, playerName, playerEmoji, playerColor]);

    // Se não deve mostrar nada e não tem conteúdo, retorna null
    if (showOnlyWhenData && !hasContent) {
        return null;
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