import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../index.css";

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizId, setQuizId] = useState(null); // ID do Quiz principal

  // Mantive o state para a pergunta e opções atuais, mas removemos 'questions'
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentOptions, setCurrentOptions] = useState([""]);

  // --- Nomes das Tabelas (Estrutura para você customizar) ---
  const TABLE_QUESTION = "question";
  const TABLE_PIVOT = "quiz_question";
  const TABLE_OPTION = "option";
  // --------------------------------------------------------

  async function criarQuiz() {
    const { data, error } = await supabase
      .from("quiz")
      .insert([{ quiz_name: quizName, quiz_description: quizDescription }])
      .select();

    if (error) {
      console.error("Erro ao criar Quiz:", error.message);
      return;
    }

    console.log("Quiz criado com sucesso:", data);
    setQuizId(data[0].id);
    setQuizName("");
    setQuizDescription("");
  }

  // NOVA FUNÇÃO: Salva a pergunta e suas opções diretamente no banco de dados
  async function salvarPerguntaNoBanco() {
    if (!quizId) {
      alert("Crie primeiro o quiz!");
      return;
    }

    if (!currentQuestionText.trim()) {
      alert("O texto da pergunta não pode estar vazio.");
      return;
    }

    // 1. Validar e filtrar opções
    const filteredOptions = currentOptions.filter(o => o.trim() !== "");
    if (filteredOptions.length === 0) {
      alert("Adicione pelo menos uma opção!");
      return;
    }

    // --- 1. INSERIR NA TABELA 'question' ---
    const { data: questionData, error: questionError } = await supabase
      .from(TABLE_QUESTION)
      .insert([{ question_text: currentQuestionText }])
      .select();

    if (questionError) {
      console.error("Erro ao criar pergunta:", questionError.message);
      return;
    }

    const newQuestionId = questionData[0].id;
    console.log(`Questão criada com sucesso. ID: ${newQuestionId}`);


    // --- 2. INSERIR NA TABELA PIVÔ 'quiz_question' (Associação Quiz-Pergunta) ---
    const { error: pivotError } = await supabase
      .from(TABLE_PIVOT)
      .insert([{ quiz_id: quizId, question_id: newQuestionId }]);

    if (pivotError) {
      console.error("Erro ao associar pergunta ao quiz:", pivotError.message);
      // Você pode querer reverter a inserção da pergunta aqui, se necessário.
    }


    // --- 3. INSERIR NA TABELA 'options' ---
    const optionsToInsert = filteredOptions.map(opt => ({
      question_id: newQuestionId,
      option_text: opt
    }));

    const { data: optionData, error: optionError } = await supabase
      .from(TABLE_OPTION)
      .insert(optionsToInsert)
      .select();

    if (optionError) {
      console.error("Erro ao criar opções:", optionError.message);
    } else {
      console.log("Opções criadas com sucesso:", optionData);
      alert("Pergunta e opções salvas com sucesso!");
    }

    setCurrentQuestionText("");
    setCurrentOptions([""]);
  }

  function updateCurrentOption(index, value) {
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setCurrentOptions(newOptions);
  }

  function addCurrentOption() {
    setCurrentOptions([...currentOptions, ""]);
  }
  
  // A função salvarPerguntas foi removida e substituída por salvarPerguntaNoBanco
  // Não há mais um array de perguntas para iterar.

  return (
    <div className="container">
      <h1>New Quiz</h1>

      <div>
        <h2>Nome</h2>
        <input
          type="text"
          value={quizName}
          onChange={e => setQuizName(e.target.value)}
          style={{ border: "2px solid black", padding: "6px", borderRadius: "4px", marginRight: "8px" }}
        />
        <h2>Descrição</h2>
        <input
          type="text"
          value={quizDescription}
          onChange={e => setQuizDescription(e.target.value)}
          style={{ border: "2px solid black", padding: "6px", borderRadius: "4px", marginRight: "8px" }}
        />
        <button onClick={criarQuiz} disabled={!!quizId}>
          {quizId ? "Quiz Criado" : "Criar Quiz"}
        </button>
        {quizId && <p>✅ Quiz ID: **{quizId.substring(0, 8)}...**</p>}
      </div>

      {quizId && (
        <div className="botons" style={{ marginTop: "20px" }}>
          <h2>Nova Pergunta:</h2>
          <input
            type="text"
            value={currentQuestionText}
            onChange={e => setCurrentQuestionText(e.target.value)}
            style={{ border: "2px solid black", padding: "6px", borderRadius: "4px", marginBottom: "10px", width: "100%" }}
          />

          <h3>Opções:</h3>
          {currentOptions.map((opt, index) => (
            <input
              key={index}
              type="text"
              value={opt}
              onChange={e => updateCurrentOption(index, e.target.value)}
              placeholder={`Opção ${index + 1}`}
              style={{ display: "block", marginBottom: "6px", border: "2px solid black", padding: "6px", borderRadius: "4px", width: "100%" }}
            />
          ))}
          <button onClick={addCurrentOption}>Adicionar Opção</button>

          <div style={{ marginTop: "10px" }}>
            {/* Este botão agora salva diretamente */}
            <button 
              onClick={salvarPerguntaNoBanco} 
              disabled={!currentQuestionText.trim()}
            >
              Salvar Pergunta no Banco
            </button>
          </div>
        </div>
      )}
    </div>
  );
}