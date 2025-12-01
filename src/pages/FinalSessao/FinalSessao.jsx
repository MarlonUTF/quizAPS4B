import FinalSessao from "../../components/layout/Colocacao/Colocacao";
import VerticalBarChart from "../../components/layout/BarChart/VerticalBarChart";
import Header from "../../components/layout/Header/Header";
import styles from "./finalSessao.module.css";
import Logo from "../../../public/logo.png";
export default function FinalSessaoPage() {
  const jogadoresReais = [
    { nome: "Marjory", emoji: "😊", cor: "#D7BDE2", acertos: 100 },
    { nome: "Marlon", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "Samara", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "Talisson", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
    { nome: "Marjory", emoji: "😊", cor: "#D7BDE2", acertos: 10 },
    { nome: "Marlon", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "Samara", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "Talisson", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
    { nome: "Marjory", emoji: "😊", cor: "#D7BDE2", acertos: 10 },
    { nome: "Marlon", emoji: "😎", cor: "#F1948A", acertos: 20 },
    { nome: "Samara", emoji: "🤠", cor: "#85C1E9", acertos: 30 },
    { nome: "Talisson", emoji: "🤖", cor: "#F7DC6F", acertos: 40 },
    { nome: "usuario5", emoji: "👻", cor: "#82E0AA", acertos: 50 },
  ];

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.titulo}>
        <h1 className={styles.textoTitulo}>Hanking Final</h1>
        <img src={Logo} className={styles.logo} />
      </div>

      <div className={styles.contentMain}>
        <div className={styles.resultsWrapper}>
          <div className={styles.resultsContainer}>
            {/* Seção da Tabela de Classificação */}
            <div className={styles.tableSection}>
              <FinalSessao
                jogadores={jogadoresReais}
                titulo="Classificação"
                mostrarDadosExemplo={false}
              />
            </div>

            {/* Seção do Gráfico */}
            <div className={styles.chartSection}>
              <VerticalBarChart
                jogadores={jogadoresReais}
                titulo="Performance da Partida"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
