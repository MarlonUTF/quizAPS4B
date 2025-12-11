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
      const newColor = optionColors[target.length % optionColors.length];
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
        color: optionColors[idx % optionColors.length]
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

  const cancelarEdicao = () => {
    setEditingQuestionIndex(null);
  };

  const excluirPergunta = async (index) => {
    const q = questions[index];

    await supabase.from("quiz_question").delete().eq("question_id", q.id);
    await supabase.from("option").delete().eq("question_id", q.id);
    await supabase.from("question").delete().eq("id", q.id);

    setQuestions(questions.filter((_, i) => i !== index));
  };

  const adicionarNovaPergunta = () => {
    if (editingQuestionIndex !== null) {
      cancelarEdicao();
    }
    
    document.getElementById("nova-pergunta-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <Header showOnlyWhenData={true} />

      <div className={styles.pageContainer}>
        <div className={styles.content}>
          <img src={Logo} alt="" height={100} width={100} />

          <h1 className={styles.newSala}>
            {editQuizId ? "Editar Quiz" : "New sala"}
          </h1>

          <div className={styles.formGroup}>
            <label className={styles.label}>Sala:</label>
            <input
              className={styles.input}
              type="text"
              placeholder="digite o nome da sala"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Descrição:</label>
            <textarea
              className={styles.input}
              placeholder="digite a descrição da sala"
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              rows="3"
            />
          </div>

          <div className={styles.quizActions}>
            {!editQuizId && (
              <button className={styles.primaryButton} onClick={criarQuiz}>
                Criar Quiz
              </button>
            )}
            {quizId && (
              <span className={styles.quizId}>Quiz ID: {quizId}</span>
            )}
          </div>

          <div className={styles.separator}></div>

          <div id="nova-pergunta-form" className={styles.questionForm}>
            <h3>Adicionar Nova Pergunta</h3>

            <div className={styles.formGroup}>
              <textarea
                className={styles.input}
                placeholder="Texto da pergunta"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows="3"
              />
            </div>

            <div className={styles.optionsContainer}>
              <h4>Opções (máximo 4):</h4>
              
              <div className={styles.optionsCounter}>
                <span className={styles.counterText}>
                  Opções: {options.length}/4
                </span>
              </div>
              
              {options.map((opt, i) => (
                <div key={i} className={styles.optionRow}>
                  <div className={styles.optionColorIndicator} style={{ backgroundColor: opt.color }}></div>
                  <input
                    className={styles.optionInput}
                    type="text"
                    placeholder={`Opção ${i + 1}`}
                    value={opt.option_text}
                    onChange={(e) => {
                      const novas = [...options];
                      novas[i].option_text = e.target.value;
                      setOptions(novas);
                    }}
                    style={{ borderLeftColor: opt.color }}
                  />
                  <button
                    onClick={() => marcarComoCorreta(i)}
                    className={styles.correctButton}
                    style={{
                      background: opt.is_correct ? opt.color : "#888",
                    }}
                  >
                    {opt.is_correct ? "✔ Correta" : "Marcar correta"}
                  </button>
                  
                  {options.length > 2 && (
                    <button 
                      onClick={() => removerOpcao(i)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              <button 
                className={styles.actionBtn} 
                onClick={() => adicionarOpcao()}
                disabled={options.length >= 4}
              >
                + Adicionar opção ({4 - options.length} restantes)
              </button>
            </div>
            
            <div className={styles.formActions}>
              <button 
                className={styles.primaryButton} 
                onClick={salvarPerguntaNoBanco}
                disabled={!questionText.trim() || options.some(opt => !opt.option_text.trim())}
              >
                Salvar Pergunta
              </button>
            </div>
            
            {!quizId && (
              <div className={styles.quizWarning}>
                <p>Você precisa criar o quiz primeiro para salvar perguntas.</p>
              </div>
            )}
          </div>
          
          {quizId && (
            <>
              <div className={styles.actionsRow}>
                <button 
                  className={styles.iconButton} 
                  onClick={adicionarNovaPergunta}
                  title="Adicionar nova pergunta"
                >
                  <span className={styles.plusIcon}>+</span>
                </button>
                
                <button className={styles.actionBtn}>
                  Todas
                </button>
                <select className={styles.dropdown}>
                  <option value="banco">Banco</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              
              {questions.map((question, index) => (
                <div 
                  key={question.id} 
                  className={`${styles.questionCard} ${editingQuestionIndex === index ? styles.editing : ''}`}
                >
                  <div className={styles.questionHeaderRow}>
                    <h3 className={styles.questionHeader}>
                      Pergunta {index + 1}
                    </h3>
                    <div className={styles.questionActions}>
                      <button 
                        className={styles.expandButton}
                        onClick={() => 
                          editingQuestionIndex === index 
                            ? cancelarEdicao() 
                            : abrirEdicaoPergunta(index)
                        }
                      >
                        {editingQuestionIndex === index ? "−" : "+"}
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => excluirPergunta(index)}
                        title="Excluir pergunta"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {editingQuestionIndex === index ? (
                    <div className={styles.editForm}>
                      <div className={styles.formGroup}>
                        <textarea
                          className={styles.input}
                          placeholder="Texto da pergunta"
                          value={editingQuestionText}
                          onChange={(e) => setEditingQuestionText(e.target.value)}
                          rows="3"
                        />
                      </div>
                      
                      <div className={styles.optionsContainer}>
                        <h4>Opções (máximo 4):</h4>
                        
                        <div className={styles.optionsCounter}>
                          <span className={styles.counterText}>
                            Opções: {editingOptions.length}/4
                          </span>
                        </div>
                        
                        {editingOptions.map((opt, optIndex) => (
                          <div key={optIndex} className={styles.optionRow}>
                            <div className={styles.optionColorIndicator} style={{ backgroundColor: opt.color }}></div>
                            <input
                              className={styles.optionInput}
                              type="text"
                              placeholder={`Opção ${optIndex + 1}`}
                              value={opt.option_text}
                              onChange={(e) => {
                                const novas = [...editingOptions];
                                novas[optIndex].option_text = e.target.value;
                                setEditingOptions(novas);
                              }}
                              style={{ borderLeftColor: opt.color }}
                            />
                            <button
                              onClick={() => marcarComoCorreta(optIndex, true)}
                              className={styles.correctButton}
                              style={{
                                background: opt.is_correct ? opt.color : "#888",
                              }}
                            >
                              {opt.is_correct ? "✔ Correta" : "Marcar correta"}
                            </button>
                            
                            {editingOptions.length > 2 && (
                              <button 
                                onClick={() => removerOpcao(optIndex, true)}
                                className={styles.removeButton}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => adicionarOpcao(true)}
                          disabled={editingOptions.length >= 4}
                        >
                          + Adicionar opção ({4 - editingOptions.length} restantes)
                        </button>
                      </div>
                      
                      <div className={styles.editActions}>
                        <button 
                          className={styles.cancelButton}
                          onClick={cancelarEdicao}
                        >
                          Cancelar
                        </button>
                        <button 
                          className={styles.saveButton}
                          onClick={salvarEdicaoPergunta}
                          disabled={!editingQuestionText.trim() || editingOptions.some(opt => !opt.option_text.trim())}
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={styles.questionText}>{question.text}</p>
                      
                      <div className={styles.optionsGrid}>
                        {question.options.map((option, optIndex) => (
                          <div 
                            key={optIndex} 
                            className={styles.optionBox}
                            style={{ backgroundColor: option.color }}
                          >
                            <div className={styles.optionContent}>
                              {option.option_text}
                              {option.is_correct && (
                                <span className={styles.correctBadge}>✓</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className={styles.modeContainer}>
                        <span className={styles.modeBadge}>
                          Múltipla escolha
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {questions.length > 0 && (
                <div className={styles.addQuestionSection}>
                  <button 
                    className={styles.addQuestionButton}
                    onClick={adicionarNovaPergunta}
                  >
                    <span className={styles.bigPlusIcon}>+</span>
                  </button>
                  <p className={styles.addQuestionText}>
                    Adicionar nova pergunta
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}