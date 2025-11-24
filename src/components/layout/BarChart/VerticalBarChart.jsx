import { useEffect, useState, useRef } from 'react';
import styles from './verticalBarChart.module.css';

function processarJogadores(jogadores) {
  if (!jogadores || !Array.isArray(jogadores)) return [];
  
  return jogadores
    .map(jogador => ({
      ...jogador,
      acertos: Number(jogador.acertos) || 0
    }))
    .sort((a, b) => b.acertos - a.acertos)
    .map((jogador, index) => ({
      ...jogador,
      colocacao: index + 1
    }));
}

export default function VerticalBarChart({ 
  jogadores = [], 
  titulo = "Performance da Partida",
  mostrarDadosExemplo = false 
}) {
  const [hasScroll, setHasScroll] = useState(false);
  const chartContainerRef = useRef(null);
  const processedJogadores = processarJogadores(jogadores);

  const dadosExemplo = [
    { nome: "usuario1", emoji: "😊", cor: "#FF6B6B", acertos: 80 },
    { nome: "usuario2", emoji: "😎", cor: "#4ECDC4", acertos: 60 },
    { nome: "usuario3", emoji: "🤠", cor: "#45B7D1", acertos: 40 },
    { nome: "usuario4", emoji: "🤖", cor: "#FFBE0B", acertos: 30 },
    { nome: "usuario5", emoji: "👻", cor: "#FF9F1C", acertos: 20 },
    { nome: "usuario6", emoji: "🐱", cor: "#E71D36", acertos: 10 }
  ];

  const dadosParaExibir = mostrarDadosExemplo && processedJogadores.length === 0 
    ? processarJogadores(dadosExemplo) 
    : processedJogadores;

  const maxAcertos = Math.max(...dadosParaExibir.map(j => j.acertos), 1);

  useEffect(() => {
    const checkScroll = () => {
      if (chartContainerRef.current) {
        const hasHorizontalScroll = chartContainerRef.current.scrollWidth > chartContainerRef.current.clientWidth;
        setHasScroll(hasHorizontalScroll);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [dadosParaExibir.length]);

  const calcularAlturaBarra = (acertos) => {
    return Math.max((acertos / maxAcertos) * 100, 5);
  };

  const gerarGrade = () => {
    const linhas = [];
    const numLinhas = 4;
    
    for (let i = 0; i <= numLinhas; i++) {
      const valor = Math.round((maxAcertos / numLinhas) * i);
      linhas.push(
        <div key={i} className={styles.gridLine}>
          <span className={styles.gridLabel}>{valor}</span>
        </div>
      );
    }
    
    return linhas;
  };

  const isCompactMode = dadosParaExibir.length > 6;

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isCompactMode ? styles.compact : ''}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>{titulo}</h1>
          {dadosParaExibir.length > 0 && (
            <p className={styles.subtitle}>
              {dadosParaExibir.length} jogador{dadosParaExibir.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>

        <div className={styles.chartWrapper}>
          <div className={styles.chartGrid}>
            {gerarGrade()}
          </div>

          {hasScroll && dadosParaExibir.length > 5 && (
            <div className={styles.scrollHint}>
              →
            </div>
          )}

          <div 
            ref={chartContainerRef}
            className={styles.chartContainer}
          >
            {dadosParaExibir.map((jogador, index) => (
              <div 
                key={index} 
                className={styles.barColumn}
                style={{ animationDelay: `${index * 0.08 + 0.1}s` }}
              >
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{
                      backgroundColor: jogador.cor,
                      height: `${calcularAlturaBarra(jogador.acertos)}%`,
                      animationDelay: `${index * 0.08 + 0.3}s`
                    }}
                  >
                    <span className={styles.barLabel}>
                      {jogador.acertos}
                    </span>
                  </div>
                </div>
                
                <div className={styles.playerInfo}>
                  <span className={styles.emoji}>{jogador.emoji}</span>
                  <span className={styles.name}>{jogador.nome}</span>
                  <span className={styles.score}>{jogador.acertos}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {processedJogadores.length === 0 && !mostrarDadosExemplo && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <p className={styles.emptyText}>Sem dados</p>
          </div>
        )}
      </div>
    </div>
  );
}