import { useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./CreateQuiz.module.css";

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizId, setQuizId] = useState(null);

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);

  const criarQuiz = async () => {
    console.log("Criando quiz...");

    const { data, error } = await supabase
      .from("quiz")
      .insert({
        quiz_name: quizName,
        quiz_description: quizDescription,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar quiz:", error);
      return;
    }

    console.log("Quiz criado ID:", data.id);
    setQuizId(data.id);
  };

  const marcarComoCorreta = (index) => {
    const novas = options.map((o, i) => ({
      ...o,
      is_correct: i === index,
    }));
    setOptions(novas);
  };

  const adicionarOpcao = () => {
    setOptions([...options, { option_text: "", is_correct: false }]);
  };

  const salvarPerguntaNoBanco = async () => {
    if (!quizId) {
      alert("Crie o quiz antes de salvar perguntas.");
      return;
    }

    console.log("Criando pergunta para quiz ID:", quizId);

    const { data: questionData, error: questionError } = await supabase
      .from("question")
      .insert({
        question_text: questionText,
      })
      .select()
      .single();

    if (questionError) {
      console.error("Erro ao criar pergunta:", questionError);
      return;
    }

    console.log("Pergunta criada ID:", questionData.id);

    const { error: pivotError } = await supabase
      .from("quiz_question")
      .insert({
        quiz_id: quizId,
        question_id: questionData.id,
      });

    if (pivotError) {
      console.error("Erro no pivot:", pivotError);
      return;
    }

    console.log("Pivot criado", quizId, questionData.id);

    const payloadOptions = options.map((opt) => ({
      question_id: questionData.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct,
    }));

    const { error: optionError } = await supabase
      .from("option")
      .insert(payloadOptions);

    if (optionError) {
      console.error("Erro ao salvar opções:", optionError);
      return;
    }

    console.log("Opções salvas com sucesso!");

    setQuestionText("");
    setOptions([
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ]);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <h1 className={styles.title}>Criar Quiz</h1>

        <div className={styles.formGroup}>
          <label className={styles.label}>Nome do quiz:</label>
          <input
            className={styles.input}
            type="text"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Descrição:</label>
          <textarea
            className={styles.input}
            value={quizDescription}
            onChange={(e) => setQuizDescription(e.target.value)}
          />
        </div>

        <button className={styles.actionBtn} onClick={criarQuiz}>
          Criar Quiz
        </button>

        <hr />

        <h3>Adicionar Pergunta</h3>

        <input
          className={styles.input}
          type="text"
          placeholder="Texto da pergunta"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        <br />
        <br />

        {options.map((opt, index) => (
          <div
            key={index}
            style={{ display: "flex", gap: 10, marginBottom: 8 }}
          >
            <input
              className={styles.input}
              type="text"
              placeholder={`Opção ${index + 1}`}
              value={opt.option_text}
              onChange={(e) => {
                const novas = [...options];
                novas[index].option_text = e.target.value;
                setOptions(novas);
              }}
            />

            <button
              onClick={() => marcarComoCorreta(index)}
              className={styles.actionBtn}
              style={{
                background: opt.is_correct ? "green" : "#888",
                color: "white",
              }}
            >
              {opt.is_correct ? "✔ Correta" : "Marcar correta"}
            </button>
          </div>
        ))}

        <button className={styles.actionBtn} onClick={adicionarOpcao}>
          Adicionar opção
        </button>

        <br />
        <br />
        <br />

        <button className={styles.actionBtn} onClick={salvarPerguntaNoBanco}>
          Salvar Pergunta
        </button>
      </div>
    </div>
  );
}
