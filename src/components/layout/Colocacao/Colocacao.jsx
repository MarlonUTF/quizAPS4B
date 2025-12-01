import Jogador from "../../ui/Jogador/Jogador.jsx";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import styles from "./colocacao.module.css";

// Função para processar e ordenar os jogadores
function processarJogadores(jogadores) {
  if (!jogadores || !Array.isArray(jogadores)) return [];
  
  return jogadores
    .map(jogador => ({
      ...jogador,
      acertos: Number(jogador.acertos) || 0
    }))
    .sort((a, b) => {
      if (b.acertos !== a.acertos) {
        return b.acertos - a.acertos;
      }
      return a.nome.localeCompare(b.nome);
    })
    .map((jogador, index) => ({
      colocacao: index + 1,
      nome: jogador.nome,
      emoji: jogador.emoji,
      cor: jogador.cor,
      acertos: jogador.acertos
    }));
}

export default function FinalSessao({ 
  jogadores = [], 
  titulo = "Classificação Final",
  mostrarDadosExemplo = false 
}) {
  const processedJogadores = processarJogadores(jogadores);

  const dadosExemplo = [
    { nome: "usuario1", emoji: "😊", cor: "#D7BDE2", acertos: 10 },
    { nome: "usuario2", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "usuario3", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "usuario4", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
    { nome: "usuario6", emoji: "🐱", cor: "#FFA07A", acertos: 15 },
    { nome: "usuario7", emoji: "🦊", cor: "#20B2AA", acertos: 25 },
    { nome: "usuario8", emoji: "🐼", cor: "#9370DB", acertos: 35 },
    { nome: "usuario9", emoji: "🦁", cor: "#FFD700", acertos: 45 },
    { nome: "usuario10", emoji: "🐯", cor: "#FF6347", acertos: 55 }
  ];

  const dadosParaExibir = mostrarDadosExemplo && processedJogadores.length === 0 
    ? processarJogadores(dadosExemplo) 
    : processedJogadores;

  const getRowClassName = (colocacao) => {
    switch (colocacao) {
      case 1: return styles.firstPlace;
      case 2: return styles.secondPlace;
      case 3: return styles.thirdPlace;
      default: return "";
    }
  };

  const renderMedal = (colocacao) => {
    switch (colocacao) {
      case 1: return <span className={styles.medal}>🥇</span>;
      case 2: return <span className={styles.medal}>🥈</span>;
      case 3: return <span className={styles.medal}>🥉</span>;
      default: return null;
    }
  };

  // Determina se deve usar modo compacto baseado no número de jogadores
  const isCompactMode = dadosParaExibir.length > 8;

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${isCompactMode ? styles.compact : ''}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>{titulo}</h1>
          {dadosParaExibir.length > 0 && (
            <p className={styles.subtitle}>
              {dadosParaExibir.length} jogador{dadosParaExibir.length !== 1 ? 'es' : ''} 
              {mostrarDadosExemplo && processedJogadores.length === 0 ? ' (demonstração)' : ''}
            </p>
          )}
        </div>

        <div className={styles.tableContainer}>
          <Table className={styles.table} aria-label="tabela de classificação">
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell className={styles.tableHeader}>
                  Colocação
                </TableCell>
                <TableCell className={styles.tableHeader}>
                  Jogador
                </TableCell>
                <TableCell className={styles.tableHeader}>
                  Acertos
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dadosParaExibir.map((jogador, index) => (
                <TableRow
                  key={index}
                  className={`${styles.tableRow} ${getRowClassName(jogador.colocacao)}`}
                  style={{ animationDelay: `${index * 0.05 + 0.1}s` }}
                >
                  <TableCell className={`${styles.tableCell} ${styles.colocacaoCell}`}>
                    <div className={styles.cellContent}>
                      {renderMedal(jogador.colocacao)}
                      {jogador.colocacao}º
                    </div>
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <div className={styles.cellContent}>
                      <div className={styles.playerCell}>
                        <Jogador 
                          nome={jogador.nome} 
                          emoji={jogador.emoji} 
                          cor={jogador.cor} 
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className={`${styles.tableCell} ${styles.acertosCell}`}>
                    <div className={styles.cellContent}>
                      {jogador.acertos}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {processedJogadores.length === 0 && !mostrarDadosExemplo && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <p className={styles.emptyText}>Nenhum jogador participou desta sessão</p>
          </div>
        )}
      </div>
    </div>
  );
}