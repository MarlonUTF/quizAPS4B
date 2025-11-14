import { useState, useEffect } from 'react';
import style from './alertaInicioQuiz.module.css';

export default function AlertaInicioJogo({ onIniciar }) {
    const [contador, setContador] = useState(5);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        if (contador > 0) {
            const timer = setTimeout(() => {
                setContador(c => c - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setFade(true);

            const timer = setTimeout(() => {
                onIniciar();
            }, 800); // Reduzido para 800ms para ser mais rápido

            return () => clearTimeout(timer);
        }
    }, [contador, onIniciar]);

    return (
        <div className={`${style.alertaInicio} ${fade ? style.fadeOutZoomSoft : ""}`}>
            <div className={style.conteudoAlerta}>
                <h1 className={style.tituloJogo}>O Jogo Começou!</h1>
                <p className={style.subtitulo}>Prepare-se para a aventura</p>

                <div className={style.contador}>{contador}</div>
            </div>
        </div>
    );
}