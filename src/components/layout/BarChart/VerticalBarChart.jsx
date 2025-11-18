import { useEffect, useState, useRef } from 'react';
import styles from './verticalBarChart.module.css';

// Função para processar e ordenar os jogadores
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
  titulo = "Desempenho dos Jogadores",
  mostrarDadosExemplo = false 
}) {
  const [animated, setAnimated] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const chartContainerRef = useRef(null);
  const processedJogadores = processarJogadores(jogadores);

  const dadosExemplo = [
    { nome: "usuario1", emoji: "😊", cor: "#FF6B6B", acertos: 30 },
    { nome: "usuario2", emoji: "😎", cor: "#4ECDC4", acertos: 10 },
    { nome: "usuario3", emoji: "🤠", cor: "#45B7D1", acertos: 20 },
    { nome: "usuario4", emoji: "🤖", cor: "#FFBE0B", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#FF9F1C", acertos: 25 },
    { nome: "usuario6", emoji: "🐱", cor: "#E71D36", acertos: 35 },
    { nome: "usuario7", emoji: "🦊", cor: "#2EC4B6", acertos: 15 },
    { nome: "usuario8", emoji: "🐼", cor: "#9370DB", acertos: 45 },
    { nome: "usuario9", emoji: "🦁", cor: "#FFD700", acertos: 5 },
    { nome: "usuario10", emoji: "🐯", cor: "#FF6347", acertos: 50 },
    { nome: "usuario11", emoji: "🐶", cor: "#20B2AA", acertos: 18 },
    { nome: "usuario12", emoji: "🐨", cor: "#DEB887", acertos: 32 }
  ];

  const dadosParaExibir = mostrarDadosExemplo && processedJogadores.length === 0 
    ? processarJogadores(dadosExemplo) 
    : processedJogadores;

  // Encontrar o máximo para normalizar as barras
  const maxAcertos = Math.max(...dadosParaExibir.map(j => j.acertos), 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Verificar se o container tem scroll
  useEffect(() => {
    const checkScroll = () => {
      if (chartContainerRef.current) {
        const hasHorizontalScroll = chartContainerRef.current.scrollWidth > chartContainerRef.current.clientWidth;
        setHasScroll(hasHorizontalScroll);
      }
    };

    checkScroll();
    
    // Re-verificar quando a janela for redimensionada
    window.addEventListener('resize', checkScroll);
    
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [dadosParaExibir.length]);

  const calcularAlturaBarra = (acertos) => {
    return Math.max((acertos / maxAcertos) * 100, 8); // Mínimo de 8% para visualização
  };

  // Gerar linhas de grade
  const gerarGrade = () => {
    const linhas = [];
    const numLinhas = 5;
    
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

  // Determinar se deve usar modo compacto
  const isCompactMode = dadosParaExibir.length > 8;

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isCompactMode ? styles.compact : ''} ${hasScroll ? styles.hasScroll : ''}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>{titulo}</h1>
          {dadosParaExibir.length > 0 && (
            <p className={styles.subtitle}>
              {dadosParaExibir.length} jogador{dadosParaExibir.length !== 1 ? 'es' : ''} 
              {mostrarDadosExemplo && processedJogadores.length === 0 ? ' (demonstração)' : ''}
            </p>
          )}
        </div>

        <div className={styles.chartWrapper}>
          {/* Grade de referência */}
          <div className={styles.chartGrid}>
            {gerarGrade()}
          </div>

          {/* Indicador de scroll (apenas se houver muitos itens) */}
          {hasScroll && dadosParaExibir.length > 6 && (
            <div className={styles.scrollHint}>
              ← Deslize →
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
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              >
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{
                      backgroundColor: jogador.cor,
                      height: `${calcularAlturaBarra(jogador.acertos)}%`,
                      animationDelay: `${index * 0.1 + 0.5}s`
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
            <p className={styles.emptyText}>Nenhum dado disponível para exibir</p>
          </div>
        )}
      </div>
    </div>
  );
}