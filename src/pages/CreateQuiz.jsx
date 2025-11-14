import { useState } from "react";
import { supabase } from "../supabaseClient";
import "../index.css";

export default function CreateQuiz() {
  // Estados do Quiz
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizId, setQuizId] = useState(null);

  // Estados das perguntas
  const [questions, setQuestions] = useState([]);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentOptions, setCurrentOptions] = useState([""]);

  // Criar quiz no banco e salvar ID
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

  // Adiciona uma pergunta temporária à lista de perguntas
  function adicionarPergunta() {
    if (!currentQuestionText.trim()) return;

    const filteredOptions = currentOptions.filter(o => o.trim() !== "");
    if (filteredOptions.length === 0) {
      alert("Adicione pelo menos uma opção!");
      return;
    }

    setQuestions([
      ...questions,
      { question_text: currentQuestionText, options: filteredOptions }
    ]);

    setCurrentQuestionText("");
    setCurrentOptions([""]);
  }

  // Atualiza uma opção temporária
  function updateCurrentOption(index, value) {
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setCurrentOptions(newOptions);
  }

  // Adiciona uma opção temporária
  function addCurrentOption() {
    setCurrentOptions([...currentOptions, ""]);
  }

  // Salva todas as perguntas e opções no banco
  async function salvarPerguntas() {
    if (!quizId) {
      alert("Crie primeiro o quiz!");
      return;
    }

    for (const q of questions) {
      // Inserir pergunta
      const { data: questionData, error: questionError } = await supabase
        .from("quiz_question")
        .insert([{ quiz_id: quizId, question_text: q.question_text }])
        .select();

      if (questionError) {
        console.error("Erro ao criar pergunta:", questionError.message);
        continue;
      }

      const qId = questionData[0].id;

      // Inserir opções
      const optionsToInsert = q.options.map(opt => ({
        question_id: qId,
        option_text: opt
      }));

      const { data: optionData, error: optionError } = await supabase
        .from("options")
        .insert(optionsToInsert)
        .select();

      if (optionError) {
        console.error("Erro ao criar opções:", optionError.message);
      } else {
        console.log("Opções criadas com sucesso:", optionData);
      }
    }

    // Reset após salvar
    setQuestions([]);
    setCurrentQuestionText("");
    setCurrentOptions([""]);
    alert("Todas as perguntas foram salvas!");
  }

  return (
    <div className="container">
      <h1>New Quiz</h1>

      {/* Criar Quiz */}
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
        <button onClick={criarQuiz}>Criar Quiz</button>
      </div>

      {/* Criar Pergunta */}
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
            <button onClick={adicionarPergunta}>Adicionar Pergunta à Lista</button>
          </div>

          {questions.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Perguntas na Lista:</h3>
              <ul>
                {questions.map((q, i) => (
                  <li key={i}>
                    <strong>{q.question_text}</strong>
                    <ul>
                      {q.options.map((o, j) => <li key={j}>{o}</li>)}
                    </ul>
                  </li>
                ))}
              </ul>
              <button onClick={salvarPerguntas}>Salvar Todas Perguntas no Banco</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
