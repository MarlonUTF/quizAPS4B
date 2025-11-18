// No seu componente/layout pai
import FinalSessao from "../../components/layout/Colocacao/Colocacao";

export default function LayoutPai() {
  const jogadoresReais = [
    { nome: "João Silva", emoji: "🚀", cor: "#FF6B6B", acertos: 7 },
    { nome: "Maria Santos", emoji: "⭐", cor: "#4ECDC4", acertos: 9 },
    // ... outros jogadores
  ];

  return (
    <div className="seu-layout">
      <Header /> {/* Seu header do layout */}
      
      <div className="conteudo-principal">
        {/* Outros componentes... */}
        
        <FinalSessao 
          jogadores={jogadoresReais}
          titulo="Resultado da Partida"
          mostrarDadosExemplo={false}
        />
        
        {/* Ou para desenvolvimento: */}
        {/* <FinalSessao mostrarDadosExemplo={true} /> */}
      </div>
      
      <Footer /> {/* Seu footer do layout */}
    </div>
  );
}