import { useState, useEffect } from 'react';
import style from './alertaInicioQuiz.module.css';

export default function AlertaInicioJogo({ 
  onIniciar, 
  iniciarContagem = false,
  tempoContagem = 5 
}) {
    const [contador, setContador] = useState(tempoContagem);
    const [fade, setFade] = useState(false);
    const [ativo, setAtivo] = useState(false);

    // Ativar a contagem quando a prop iniciarContagem for true
    useEffect(() => {
        if (iniciarContagem && !ativo) {
            console.log("AlertaInicioJogo: Iniciando contagem");
            setAtivo(true);
            setContador(tempoContagem);
            setFade(false);
        } else if (!iniciarContagem && ativo) {
            // Se iniciarContagem mudar para false, resetar
            setAtivo(false);
            setContador(tempoContagem);
            setFade(false);
        }
    }, [iniciarContagem, ativo, tempoContagem]);

    // Controlar a contagem regressiva
    useEffect(() => {
        if (!ativo || contador <= 0) return;

        const timer = setTimeout(() => {
            setContador(c => {
                if (c <= 1) {
                    console.log("AlertaInicioJogo: Contagem terminando");
                    setFade(true);
                    setTimeout(() => {
                        if (onIniciar) {
                            console.log("AlertaInicioJogo: Chamando onIniciar");
                            onIniciar();
                        }
                        setAtivo(false);
                    }, 800);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [contador, ativo, onIniciar]);

    // Se não estiver ativo, não renderiza nada
    if (!ativo) {
        return null;
    }

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