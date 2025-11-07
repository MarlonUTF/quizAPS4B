import { useState } from "react";
import { supabase } from "../supabaseClient"; 
import "../index.css";

export default function CreateQuiz() {

  const [quizName, setQuizName] = useState("");
  const [quiz_description, setQuizDescription] = useState("");
  const [option, setOption] = useState("")

  async function criar() {
    const { data, error } = await supabase
      .from("Quiz")
      .insert([{ quiz_name: quizName, quiz_description: quiz_description }]) 
      .select();

    if (error) {
      console.error("Erro ao inserir Quiz:", error.message);
    } else {
      console.log("Quiz criado com sucesso:", data);
      setQuizName("");
      setQuizDescription("");
    }
  }

  async function criarOpcao(){
    const { data, error } = await supabase
      .from("Option")
      .insert([{ option: option }]) 
      .select();

    if (error) {
      console.error("Erro ao inserir Opção:", error.message);
    } else {
      console.log("Opção criada com sucesso:", data);
      setOption("");
    }
  }


  return (
    <div className="container">
      <h1>New Quiz</h1>

      <div>
        <h2>Nome</h2>
        <input
          type="text"
          name="quizName"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          style={{ 
            border: "2px solid black", 
            padding: "6px", 
            borderRadius: "4px", 
            marginRight: "8px"
          }}
        />

        <h2>Descrição</h2>
        <input
          type="text"
          name="quiz_description"
          value={quiz_description}
          onChange={(e) => setQuizDescription(e.target.value)}
          style={{ 
            border: "2px solid black", 
            padding: "6px", 
            borderRadius: "4px", 
            marginRight: "8px"
          }}
        />

        <button onClick={criar}>
          Salvar
        </button>
      </div>

      <div className="botons">
        <h2>Perguntas:</h2>
        <button onClick={criarOpcao()}>+</button>
        <button>Categoria</button>
        <button>Banco</button>
      </div>

      <div className="options">
        <input 
          type="text" 
          placeholder="option 1" 
          style={{ border: "2px solid black", padding: "6px", borderRadius: "4px" }} 
        />
      </div>
    </div>
  );
}
