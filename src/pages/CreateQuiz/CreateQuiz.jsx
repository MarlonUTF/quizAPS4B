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
  const [selectedCategory, setSelectedCategory] = useState(""); // categoria nova pergunta

  const [categories, setCategories] = useState([]); // categorias do banco
  const [categoriaFiltro, setCategoriaFiltro] = useState(""); // filtro do banco

  const optionColors = ["#cf3f52", "#6951a1", "#3fa09b", "#313191"];

  const [options, setOptions] = useState([
    { option_text: "", is_correct: false, color: optionColors[0] },
    { option_text: "", is_correct: false, color: optionColors[1] },
  ]);

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [editingCategory, setEditingCategory] = useState(""); // categoria no modo edição
  const [editingOptions, setEditingOptions] = useState([]);

  const [questions, setQuestions] = useState([]);
  const [userId, setUserId] = useState(null);
  const editQuizId = localStorage.getItem("editQuizId");

  // Banco de perguntas
  const [bancoPerguntas, setBancoPerguntas] = useState([]);
  const [mostrarBanco, setMostrarBanco] = useState(false);
  const [carregandoBanco, setCarregandoBanco] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                       🔹 1) CARREGA USUÁRIO E CATEGORIAS                   */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    // pega usuário
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });

    carregarCategorias();

    if (editQuizId) carregarQuizParaEdicao(editQuizId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarCategorias() {
    const { data, error } = await supabase
      .from("category")
      .select("id, category_name")
      .order("category_name");

    if (error) {
      console.error("Erro ao carregar categorias:", error);
      setCategories([]);
    } else {
      setCategories(data || []);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                            🔹 BANCO DE PERGUNTAS                           */
  /* -------------------------------------------------------------------------- */

  async function carregarBancoPerguntas() {
    // toggle: se já mostrando, apenas fecha
    if (mostrarBanco) {
      setMostrarBanco(false);
      return;
    }

    setMostrarBanco(true);
    setCarregandoBanco(true);

    try {
      // buscamos perguntas com category_id
      const { data: questionsData, error: qErr } = await supabase
        .from("question")
        .select("id, question_text, category_id")
        .order("question_text", { ascending: true });

      if (qErr) throw qErr;

      if (!questionsData || questionsData.length === 0) {
        setBancoPerguntas([]);
        setCarregandoBanco(false);
        return;
      }

      const ids = questionsData.map((q) => q.id);

      const { data: optionsData = [], error: oErr } = await supabase
        .from("option")
        .select("*")
        .in("question_id", ids);

      if (oErr) throw oErr;

      const montado = questionsData.map((q) => ({
        id: q.id,
        text: q.question_text,
        category_id: q.category_id,
        options:
          optionsData
            .filter((op) => op.question_id === q.id)
            .map((op, idx) => ({
              option_text: op.option_text,
              is_correct: op.is_correct,
              color: optionColors[idx % optionColors.length],
            })) || [],
      }));

      setBancoPerguntas(montado);
    } catch (err) {
      console.error("Erro ao carregar banco:", err);
      alert("Erro ao carregar banco de perguntas");
      setBancoPerguntas([]);
    } finally {
      setCarregandoBanco(false);
    }
  }

  async function adicionarPerguntaExistente(question) {
    if (!quizId) {
      alert("Crie o quiz primeiro.");
      return;
    }

    // evita duplicar a mesma pergunta no quiz (por id)
    if (questions.some(q => q.id === question.id)) {
      alert("Esta pergunta já foi adicionada ao quiz.");
      return;
    }

    const { error } = await supabase
      .from("quiz_question")
      .insert({
        quiz_id: quizId,
        question_id: question.id
      });

    if (error) {
      alert("Erro: " + error.message);
      return;
    }

    setQuestions(prev => [...prev, question]);
    alert("Pergunta adicionada!");
  }

  /* -------------------------------------------------------------------------- */
  /*                           🔹 CARREGAR QUIZ PARA EDIÇÃO                     */
  /* -------------------------------------------------------------------------- */

  async function carregarQuizParaEdicao(id) {
    try {
      const { data: quizData, error: quizErr } = await supabase
        .from("quiz")
        .select("*")
        .eq("id", id)
        .single();

      if (quizErr) throw quizErr;
      if (!quizData) return;

      setQuizId(id);
      setQuizName(quizData.quiz_name);
      setQuizDescription(quizData.quiz_description);

      const { data: pivot, error: pivotErr } = await supabase
        .from("quiz_question")
        .select("question_id")
        .eq("quiz_id", id);

      if (pivotErr) throw pivotErr;
      if (!pivot || pivot.length === 0) {
        setQuestions([]);
        return;
      }

      const questionIds = pivot.map(p => p.question_id);

      const { data: questionsData, error: qErr } = await supabase
        .from("question")
        .select("*")
        .in("id", questionIds);

      if (qErr) throw qErr;

      const { data: optionsData = [], error: oErr } = await supabase
        .from("option")
        .select("*")
        .in("question_id", questionIds);

      if (oErr) throw oErr;

      const montado = questionsData.map(q => ({
        id: q.id,
        text: q.question_text,
        category_id: q.category_id,
        options: optionsData
          .filter(op => op.question_id === q.id)
          .map((op, idx) => ({
            option_text: op.option_text,
            is_correct: op.is_correct,
            color: optionColors[idx % optionColors.length]
          }))
      }));

      setQuestions(montado);
    } catch (err) {
      console.error("Erro carregar quiz pra edição:", err);
      alert("Erro ao carregar quiz: " + (err.message || err));
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                           🔹 CRIAR QUIZ                                    */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /*                       🔹 SALVAR NOVA PERGUNTA NO BANCO                     */
  /* -------------------------------------------------------------------------- */

  const salvarPerguntaNoBanco = async () => {
    if (!quizId) {
      alert("Crie o quiz primeiro.");
      return;
    }
    if (!selectedCategory) {
      alert("Selecione uma categoria.");
      return;
    }

    const { data: qData, error: qErr } = await supabase
      .from("question")
      .insert({
        question_text: questionText,
        category_id: selectedCategory
      })
      .select()
      .single();

    if (qErr) {
      alert(qErr.message);
      return;
    }

    await supabase.from("quiz_question").insert({
      quiz_id: quizId,
      question_id: qData.id
    });

    await supabase.from("option").insert(
      options.map(opt => ({
        question_id: qData.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct
      }))
    );

    setQuestions(prev => [...prev, {
      id: qData.id,
      text: questionText,
      category_id: selectedCategory,
      options
    }]);

    setQuestionText("");
    setSelectedCategory("");
    setOptions([
      { option_text: "", is_correct: false, color: optionColors[0] },
      { option_text: "", is_correct: false, color: optionColors[1] },
    ]);

    alert("Pergunta salva!");
  };

  /* -------------------------------------------------------------------------- */
  /*                           🔹 EDIÇÃO DE PERGUNTA                            */
  /* -------------------------------------------------------------------------- */

  const abrirEdicaoPergunta = (i) => {
    setEditingQuestionIndex(i);
    setEditingQuestionText(questions[i].text);
    setEditingCategory(questions[i].category_id || "");
    setEditingOptions([...questions[i].options]);
  };

  const salvarEdicaoPergunta = async () => {
    const q = questions[editingQuestionIndex];

    await supabase.from("question")
      .update({
        question_text: editingQuestionText,
        category_id: editingCategory
      })
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
      category_id: editingCategory,
      options: editingOptions
    };

    setQuestions(novas);
    setEditingQuestionIndex(null);
  };

  const cancelarEdicao = () => {
    setEditingQuestionIndex(null);
  };

  /* -------------------------------------------------------------------------- */
  /*                            🔹 EXCLUIR PERGUNTA                             */
  /* -------------------------------------------------------------------------- */

  const excluirPergunta = async (index) => {
    const q = questions[index];

    await supabase.from("quiz_question").delete().eq("question_id", q.id);
    await supabase.from("option").delete().eq("question_id", q.id);
    await supabase.from("question").delete().eq("id", q.id);

    setQuestions(questions.filter((_, i) => i !== index));
  };

  const adicionarNovaPergunta = () => {
    if (editingQuestionIndex !== null) cancelarEdicao();

    document.getElementById("nova-pergunta-form")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                🔹 RENDER                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div>
      <Header showOnlyWhenData={true} />

      <div className={styles.pageContainer}>
        <div className={styles.content}>
          <img src={Logo} alt="" height={100} width={100} />

          <h1 className={styles.newSala}>
            {editQuizId ? "Editar Quiz" : "New sala"}
          </h1>

          {/* Form de criação */}
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

          {/* NOVA PERGUNTA */}
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

            {/* SELECT DE CATEGORIAS */}
            <div className={styles.formGroup}>
              <label>Categoria:</label>
              <select
                className={styles.input}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* opções */}
            <div className={styles.optionsContainer}>
              <h4>Opções (máximo 4):</h4>

              <div className={styles.optionsCounter}>
                <span className={styles.counterText}>
                  Opções: {options.length}/4
                </span>
              </div>

              {options.map((opt, i) => (
                <div key={i} className={styles.optionRow}>
                  <div
                    className={styles.optionColorIndicator}
                    style={{ backgroundColor: opt.color }}
                  ></div>

                  <input
                    className={styles.optionInput}
                    type="text"
                    value={opt.option_text}
                    placeholder={`Opção ${i + 1}`}
                    onChange={(e) => {
                      const novas = [...options];
                      novas[i].option_text = e.target.value;
                      setOptions(novas);
                    }}
                    style={{ borderLeftColor: opt.color }}
                  />

                  <button
                    onClick={() => {
                      const novas = options.map((o, idx) => ({
                        ...o,
                        is_correct: idx === i
                      }));
                      setOptions(novas);
                    }}
                    className={styles.correctButton}
                    style={{
                      background: opt.is_correct ? opt.color : "#888",
                    }}
                  >
                    {opt.is_correct ? "✔ Correta" : "Marcar"}
                  </button>

                  {options.length > 2 && (
                    <button
                      onClick={() => {
                        const novas = options
                          .filter((_, idx) => idx !== i)
                          .map((o, idx) => ({
                            ...o,
                            color: optionColors[idx]
                          }));
                        setOptions(novas);
                      }}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                className={styles.actionBtn}
                onClick={() => {
                  if (options.length < 4)
                    setOptions([
                      ...options,
                      {
                        option_text: "",
                        is_correct: false,
                        color: optionColors[options.length]
                      }
                    ]);
                }}
                disabled={options.length >= 4}
              >
                + Adicionar opção
              </button>
            </div>

            <div className={styles.formActions}>
              <button
                className={styles.primaryButton}
                onClick={salvarPerguntaNoBanco}
                disabled={
                  !questionText.trim() ||
                  !selectedCategory ||
                  options.some(op => !op.option_text.trim())
                }
              >
                Salvar Pergunta
              </button>
            </div>
          </div>

          {/* LISTA DE PERGUNTAS */}
          {quizId && (
            <>
              <div className={styles.actionsRow}>
                <button
                  className={styles.iconButton}
                  onClick={adicionarNovaPergunta}
                >
                  <span className={styles.plusIcon}>+</span>
                </button>

                <button className={styles.actionBtn}>Todas</button>

                <button
                  className={styles.actionBtn}
                  onClick={carregarBancoPerguntas}
                >
                  Banco
                </button>
              </div>

              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`${styles.questionCard} ${editingQuestionIndex === index ? styles.editing : ""}`}
                >
                  <div className={styles.questionHeaderRow}>
                    <h3 className={styles.questionHeader}>Pergunta {index + 1}</h3>
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
                          value={editingQuestionText}
                          onChange={(e) => setEditingQuestionText(e.target.value)}
                          rows="3"
                        />
                      </div>

                      {/* SELECT DE CATEGORIA NO MODO EDIÇÃO */}
                      <div className={styles.formGroup}>
                        <label>Categoria:</label>
                        <select
                          className={styles.input}
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value)}
                        >
                          <option value="">Selecione...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.category_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.optionsContainer}>
                        <h4>Opções:</h4>

                        {editingOptions.map((opt, optIndex) => (
                          <div key={optIndex} className={styles.optionRow}>
                            <div className={styles.optionColorIndicator} style={{ backgroundColor: opt.color }}></div>
                            <input
                              className={styles.optionInput}
                              value={opt.option_text}
                              onChange={(e) => {
                                const novas = [...editingOptions];
                                novas[optIndex].option_text = e.target.value;
                                setEditingOptions(novas);
                              }}
                              style={{ borderLeftColor: opt.color }}
                            />
                            <button
                              onClick={() => {
                                const novas = editingOptions.map((o, idx) => ({ ...o, is_correct: idx === optIndex }));
                                setEditingOptions(novas);
                              }}
                              className={styles.correctButton}
                              style={{ background: opt.is_correct ? opt.color : "#888" }}
                            >
                              {opt.is_correct ? "✔" : "Marcar"}
                            </button>

                            {editingOptions.length > 2 && (
                              <button
                                onClick={() => {
                                  const novas = editingOptions.filter((_, idx) => idx !== optIndex).map((o, idx) => ({ ...o, color: optionColors[idx] }));
                                  setEditingOptions(novas);
                                }}
                                className={styles.removeButton}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          className={styles.actionBtn}
                          onClick={() => setEditingOptions([...editingOptions, { option_text: "", is_correct: false, color: optionColors[editingOptions.length] }])}
                          disabled={editingOptions.length >= 4}
                        >
                          + Adicionar opção
                        </button>
                      </div>

                      <div className={styles.editActions}>
                        <button className={styles.cancelButton} onClick={cancelarEdicao}>Cancelar</button>
                        <button className={styles.saveButton} onClick={salvarEdicaoPergunta}>Salvar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={styles.questionText}>{question.text}</p>

                      {question.category_id && (
                        <span className={styles.categoryTag}>
                          Categoria:{" "}
                          {categories.find(c => String(c.id) === String(question.category_id))?.category_name}
                        </span>
                      )}

                      <div className={styles.optionsGrid}>
                        {question.options.map((op, i) => (
                          <div key={i} className={styles.optionBox} style={{ backgroundColor: op.color }}>
                            <div className={styles.optionContent}>
                              {op.option_text}
                              {op.is_correct && <span className={styles.correctBadge}>✓</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* BOTÃO ADICIONAR */}
              {questions.length > 0 && (
                <div className={styles.addQuestionSection}>
                  <button className={styles.addQuestionButton} onClick={adicionarNovaPergunta}>
                    <span className={styles.bigPlusIcon}>+</span>
                  </button>
                  <p className={styles.addQuestionText}>Adicionar nova pergunta</p>
                </div>
              )}

              {/* BANCO DE PERGUNTAS (filtro + lista com scroll) */}
              {mostrarBanco && (
                <div className={styles.bancoWrapper}>
                  <div className={styles.bancoHeader}>
                    <h2 className={styles.bancoTitulo}>Banco de Perguntas</h2>
                    <button className={styles.closeBancoBtn} onClick={() => setMostrarBanco(false)}>×</button>
                  </div>

                  {/* filtro por categoria */}
                  <div className={styles.filtroCategoria}>
                    <select
                      className={styles.selectCategoria}
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                      ))}
                    </select>
                  </div>

                  {carregandoBanco && <p>Carregando perguntas...</p>}

                  {!carregandoBanco && bancoPerguntas.length === 0 && (
                    <p>Nenhuma pergunta encontrada no banco.</p>
                  )}

                  <div className={styles.bancoLista}>
                    {bancoPerguntas
                      .filter(q => {
                        if (!categoriaFiltro) return true;
                        return String(q.category_id) === String(categoriaFiltro);
                      })
                      .map((q) => (
                        <div key={q.id} className={styles.bancoCard}>
                          <h3 className={styles.bancoQuestion}>{q.text}</h3>

                          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: 8 }}>
                            Categoria: {categories.find(c => String(c.id) === String(q.category_id))?.category_name || '—'}
                          </div>

                          <div className={styles.bancoOptions}>
                            {q.options.map((op, idx) => (
                              <div key={idx} className={styles.bancoOption} style={{ backgroundColor: op.color }}>
                                <span>{op.option_text}</span>
                                {op.is_correct && <span className={styles.correctBadge}>✓</span>}
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button className={styles.addButton} onClick={() => adicionarPerguntaExistente(q)}>➕ Adicionar</button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
