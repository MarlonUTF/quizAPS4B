// No seu componente/layout pai
import FinalSessao from "../../components/layout/Colocacao/Colocacao";
import VerticalBarChart from "../../components/layout/BarChart/VerticalBarChart";
import Header from "../../components/layout/Header/Header";

export default function finalSessao() {
  const jogadoresReais = [
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
    // ... outros jogadores
  ];

  return (
    <div className="seu-layout">
      <Header /> {/* Seu header do layout */}
      <div className="conteudo-principal">
        {/* Outros componentes... */}

        <div className="container">
          <FinalSessao
            jogadores={jogadoresReais}
            titulo="Classificação"
            mostrarDadosExemplo={false}
          />
          <VerticalBarChart jogadores={jogadoresReais} titulo="Performance da Partida" />
        </div>

        {/* Ou para desenvolvimento: */}
        {/* <FinalSessao mostrarDadosExemplo={true} /> */}
      </div>
    </div>
  );
}
