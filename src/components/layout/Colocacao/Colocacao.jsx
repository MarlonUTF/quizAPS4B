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
  
  // Ordena jogadores por acertos (decrescente) e depois por nome (crescente)
  return jogadores
    .map(jogador => ({
      ...jogador,
      // Garante que acertos é um número
      acertos: Number(jogador.acertos) || 0
    }))
    .sort((a, b) => {
      // Primeiro ordena por acertos (decrescente)
      if (b.acertos !== a.acertos) {
        return b.acertos - a.acertos;
      }
      // Em caso de empate, ordena por nome (alfabeticamente)
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
  // Processa os jogadores para a tabela
  const processedJogadores = processarJogadores(jogadores);

  // Dados de exemplo (opcional, apenas para desenvolvimento/demo)
  const dadosExemplo = [
    { nome: "Gabriel Oliveira", emoji: "🎬", cor: "#D7BDE2", acertos: 6 },
    { nome: "Maria Silva", emoji: "🔥", cor: "#F1948A", acertos: 8 },
    { nome: "João Santos", emoji: "🚀", cor: "#85C1E9", acertos: 6 },
    { nome: "Ana Costa", emoji: "⭐", cor: "#F7DC6F", acertos: 9 },
    { nome: "Pedro Lima", emoji: "🎯", cor: "#82E0AA", acertos: 5 }
  ];

  // Decide quais dados exibir
  const dadosParaExibir = mostrarDadosExemplo && processedJogadores.length === 0 
    ? processarJogadores(dadosExemplo) 
    : processedJogadores;

  // Função para determinar a classe CSS baseada na colocação
  const getRowClassName = (colocacao) => {
    switch (colocacao) {
      case 1:
        return styles.firstPlace;
      case 2:
        return styles.secondPlace;
      case 3:
        return styles.thirdPlace;
      default:
        return "";
    }
  };

  // Função para renderizar a medalha
  const renderMedal = (colocacao) => {
    switch (colocacao) {
      case 1:
        return <span className={styles.medal}>🥇</span>;
      case 2:
        return <span className={styles.medal}>🥈</span>;
      case 3:
        return <span className={styles.medal}>🥉</span>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>{titulo}</h1>
          {dadosParaExibir.length > 0 && (
            <p className={styles.subtitle}>
              {dadosParaExibir.length} jogador{dadosParaExibir.length !== 1 ? 'es' : ''} 
              {mostrarDadosExemplo && processedJogadores.length === 0 ? ' (dados de exemplo)' : ''}
            </p>
          )}
        </div>

        <div className={styles.tableContainer}>
          <Table className={styles.table} aria-label="tabela de classificação">
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell className={`${styles.tableHeader} ${styles.tableHeader}`}>
                  <b>Colocação</b>
                </TableCell>
                <TableCell className={`${styles.tableHeader} ${styles.playerHeader}`} align="center">
                  <b>Jogador</b>
                </TableCell>
                <TableCell className={styles.tableHeader} align="right">
                  <b>Acertos</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dadosParaExibir.map((jogador, index) => (
                <TableRow
                  key={index}
                  className={`${styles.tableRow} ${getRowClassName(jogador.colocacao)}`}
                  sx={{ 
                    "&:last-child td, &:last-child th": { border: 0 }
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row" 
                    className={`${styles.tableCell} ${styles.colocacaoCell}`}
                  >
                    {renderMedal(jogador.colocacao)}
                    {jogador.colocacao}º
                  </TableCell>
                  <TableCell 
                    align="center" 
                    className={styles.tableCell}
                  >
                    <div className={styles.playerCell}>
                      <Jogador 
                        nome={jogador.nome} 
                        emoji={jogador.emoji} 
                        cor={jogador.cor} 
                      />
                    </div>
                  </TableCell>
                  <TableCell 
                    align="right" 
                    className={`${styles.tableCell} ${styles.acertosCell}`}
                  >
                    {jogador.acertos}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mensagem se não houver jogadores (apenas quando não mostrar dados exemplo) */}
        {processedJogadores.length === 0 && !mostrarDadosExemplo && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>😴</div>
            <p className={styles.emptyText}>Nenhum jogador participou desta sessão.</p>
          </div>
        )}
      </div>
    </div>
  );
}