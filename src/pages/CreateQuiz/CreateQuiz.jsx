// CreateQuiz.jsx
import Logo from '../../../public/logo.png'
import styles from "./CreateQuiz.module.css"
import { useState, useEffect } from 'react'
import { supabase } from "../../supabaseClient"
import Header from '../../components/layout/Header/Header'

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizId, setQuizId] = useState(null);
  const [questionText, setQuestionText] = useState("");

  const optionColors = ["#cf3f52", "#6951a1", "#3fa09b", "#313191"];

  const [options, setOptions] = useState([
    { option_text: "", is_correct: false, color: optionColors[0] },
    { option_text: "", is_correct: false, color: optionColors[1] },
  ]);

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [editingOptions, setEditingOptions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [userId, setUserId] = useState(null);

  // Novo: detectar EDIÇÃO
  const editQuizId = localStorage.getItem("editQuizId");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserId(data.user.id);
      }
    });

    if (editQuizId) {
      carregarQuizParaEdicao(editQuizId);
    }
  }, []);

  async function carregarQuizParaEdicao(id) {
    const { data: quizData } = await supabase
      .from("quiz")
      .select("*")
      .eq("id", id)
      .single();

    if (!quizData) return;

    setQuizId(id);
    setQuizName(quizData.quiz_name);
    setQuizDescription(quizData.quiz_description);

    // Carregar perguntas
    const { data: pivot } = await supabase
      .from("quiz_question")
      .select("question_id")
      .eq("quiz_id", id);

    if (!pivot) return;

    const questionIds = pivot.map(p => p.question_id);

    const { data: questionsData } = await supabase
      .from("question")
      .select("*")
      .in("id", questionIds);

    const { data: optionsData } = await supabase
      .from("option")
      .select("*")
      .in("question_id", questionIds);

    const montado = questionsData.map(q => ({
      id: q.id,
      text: q.question_text,
      options: optionsData
        .filter(op => op.question_id === q.id)
        .map((op, idx) => ({
          option_text: op.option_text,
          is_correct: op.is_correct,
          color: optionColors[idx]
        }))
    }));

    setQuestions(montado);
  }

  // Criar quiz novo
  const criarQuiz = async () => {
    if (editQuizId) {
      alert("Este quiz já existe. Apenas edite perguntas abaixo.");
      return;
    }

    const { data, error } = await supabase
      .from("quiz")
      .insert({
        quiz_name: quizName,
        quiz_description: quizDescription,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      alert("Erro ao criar quiz: " + error.message);
      return;
    }

    setQuizId(data.id);
    alert("Quiz criado com sucesso!");
  };

  // Manter lógica original abaixo…

  const marcarComoCorreta = (index, isEditing = false) => {
    if (isEditing) {
      const novas = editingOptions.map((o, i) => ({
        ...o,
        is_correct: i === index,
      }));
      setEditingOptions(novas);
    } else {
      const novas = options.map((o, i) => ({
        ...o,
        is_correct: i === index,
      }));
      setOptions(novas);
    }
  };

  const adicionarOpcao = (isEditing = false) => {
    const target = isEditing ? editingOptions : options;
    const setter = isEditing ? setEditingOptions : setOptions;

    if (target.length < 4) {
      const newColor = optionColors[target.length];
      setter([...target, { option_text: "", is_correct: false, color: newColor }]);
    }
  };

  const removerOpcao = (index, isEditing = false) => {
    const target = isEditing ? editingOptions : options;
    const setter = isEditing ? setEditingOptions : setOptions;

    if (target.length > 2) {
      const novas = target.filter((_, i) => i !== index);
      const recolor = novas.map((opt, idx) => ({
        ...opt,
        color: optionColors[idx]
      }));
      setter(recolor);
    }
  };

  const salvarPerguntaNoBanco = async () => {
    if (!quizId) {
      alert("Crie o quiz primeiro.");
      return;
    }

    const { data: qData, error: qErr } = await supabase
      .from("question")
      .insert({ question_text: questionText })
      .select()
      .single();

    if (qErr) return alert(qErr.message);

    await supabase.from("quiz_question").insert({
      quiz_id: quizId,
      question_id: qData.id
    });

    const payload = options.map(opt => ({
      question_id: qData.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct
    }));

    await supabase.from("option").insert(payload);

    setQuestions([...questions, {
      id: qData.id,
      text: questionText,
      options
    }]);

    setQuestionText("");
    setOptions([
      { option_text: "", is_correct: false, color: optionColors[0] },
      { option_text: "", is_correct: false, color: optionColors[1] },
    ]);

    alert("Pergunta salva!");
  };

  const abrirEdicaoPergunta = (i) => {
    setEditingQuestionIndex(i);
    setEditingQuestionText(questions[i].text);
    setEditingOptions([...questions[i].options]);
  };

  const salvarEdicaoPergunta = async () => {
    const q = questions[editingQuestionIndex];

    await supabase.from("question")
      .update({ question_text: editingQuestionText })
      .eq("id", q.id);

    await supabase.from("option").delete().eq("question_id", q.id);

    await supabase.from("option").insert(
      editingOptions.map(op => ({
        question_id: q.id,
        option_text: op.option_text,
        is_correct: op.is_correct
      }))
    );

    const novas = [...questions];
    novas[editingQuestionIndex] = {
      ...q,
      text: editingQuestionText,
      options: editingOptions
    };

    setQuestions(novas);
    setEditingQuestionIndex(null);
  };

  const excluirPergunta = async (index) => {
    const q = questions[index];

    await supabase.from("quiz_question").delete().eq("question_id", q.id);
    await supabase.from("option").delete().eq("question_id", q.id);
    await supabase.from("question").delete().eq("id", q.id);

    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Header />

      <div className={styles.pageContainer}>
        <div className={styles.content}>
          <img src={Logo} alt="" height={100} width={100} />

          <h1 className={styles.newSala}>
            {editQuizId ? "Editar Quiz" : "Criar Novo Quiz"}
          </h1>

          <div className={styles.formGroup}>
            <label>Sala:</label>
            <input
              className={styles.input}
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Descrição:</label>
            <textarea
              className={styles.input}
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              rows={3}
            />
          </div>

          {!editQuizId && (
            <button className={styles.primaryButton} onClick={criarQuiz}>
              Criar Quiz
            </button>
          )}

          <div className={styles.separator}></div>

          {/* Form de criar pergunta */}
          <div className={styles.questionForm}>
            <h3>Nova Pergunta</h3>

            <textarea
              className={styles.input}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Texto da pergunta"
            />

            <h4>Opções</h4>

            {options.map((opt, i) => (
              <div key={i} className={styles.optionRow}>
                <input
                  className={styles.optionInput}
                  value={opt.option_text}
                  onChange={(e) => {
                    const novas = [...options];
                    novas[i].option_text = e.target.value;
                    setOptions(novas);
                  }}
                />
                <button
                  className={styles.correctButton}
                  onClick={() => marcarComoCorreta(i)}
                  style={{ background: opt.is_correct ? opt.color : "#777" }}
                >
                  {opt.is_correct ? "✔" : "✓"}
                </button>
                {options.length > 2 && (
                  <button onClick={() => removerOpcao(i)}>x</button>
                )}
              </div>
            ))}

            <button
              className={styles.actionBtn}
              onClick={() => adicionarOpcao()}
              disabled={options.length >= 4}
            >
              + Opção
            </button>

            <button
              className={styles.primaryButton}
              onClick={salvarPerguntaNoBanco}
            >
              Salvar Pergunta
            </button>
          </div>

          {/* Lista de perguntas */}
          <h2>Perguntas</h2>

          {questions.map((q, i) => (
            <div key={i} className={styles.questionCard}>
              <p>{q.text}</p>

              {q.options.map((op, j) => (
                <p key={j} style={{ color: op.color }}>
                  {op.option_text} {op.is_correct ? "✔" : ""}
                </p>
              ))}

              <button onClick={() => abrirEdicaoPergunta(i)}>Editar</button>
              <button onClick={() => excluirPergunta(i)}>Excluir</button>
            </div>
          ))}

          {/* Modal de edição */}
          {editingQuestionIndex !== null && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Editar Pergunta</h3>

                <textarea
                  className={styles.input}
                  value={editingQuestionText}
                  onChange={(e) => setEditingQuestionText(e.target.value)}
                />

                {editingOptions.map((opt, i) => (
                  <div key={i} className={styles.optionRow}>
                    <input
                      className={styles.optionInput}
                      value={opt.option_text}
                      onChange={(e) => {
                        const novas = [...editingOptions];
                        novas[i].option_text = e.target.value;
                        setEditingOptions(novas);
                      }}
                    />
                    <button
                      className={styles.correctButton}
                      onClick={() => marcarComoCorreta(i, true)}
                    >
                      {opt.is_correct ? "✔" : "✓"}
                    </button>
                  </div>
                ))}

                <button onClick={salvarEdicaoPergunta}>Salvar</button>
                <button onClick={() => setEditingQuestionIndex(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
