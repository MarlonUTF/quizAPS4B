// CreateQuiz.jsx
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./CreateQuiz.module.css";

export default function CreateQuiz() {
  const [quizName, setQuizName] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizId, setQuizId] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false, color: "#cf3f52" },
    { option_text: "", is_correct: false, color: "#6951a1" },
  ]);
  
  // Estado para controlar qual pergunta está sendo editada
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editingQuestionText, setEditingQuestionText] = useState("");
  const [editingOptions, setEditingOptions] = useState([]);
  
  const [questions, setQuestions] = useState([]);
  
  // Cores das opções
  const optionColors = ["#cf3f52", "#6951a1", "#3fa09b", "#1f2e7a", "#FF9800", "#9C27B0"];

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
      alert("Erro ao criar quiz: " + error.message);
      return;
    }

    console.log("Quiz criado ID:", data.id);
    setQuizId(data.id);
    alert("Quiz criado com sucesso! ID: " + data.id);
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
    if (isEditing) {
      if (editingOptions.length < 6) {
        const newColor = optionColors[editingOptions.length % optionColors.length];
        setEditingOptions([...editingOptions, { option_text: "", is_correct: false, color: newColor }]);
      }
    } else {
      if (options.length < 6) {
        const newColor = optionColors[options.length % optionColors.length];
        setOptions([...options, { option_text: "", is_correct: false, color: newColor }]);
      }
    }
  };

  const removerOpcao = (index, isEditing = false) => {
    if (isEditing) {
      if (editingOptions.length > 2) {
        const novas = editingOptions.filter((_, i) => i !== index);
        setEditingOptions(novas);
      }
    } else {
      if (options.length > 2) {
        const novas = options.filter((_, i) => i !== index);
        setOptions(novas);
      }
    }
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
      alert("Erro ao criar pergunta: " + questionError.message);
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
      alert("Erro ao vincular pergunta: " + pivotError.message);
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
      alert("Erro ao salvar opções: " + optionError.message);
      return;
    }

    console.log("Opções salvas com sucesso!");

    // Adicionar à lista de perguntas
    const novaPergunta = {
      id: questionData.id,
      text: questionText,
      options: [...options],
    };
    
    setQuestions([...questions, novaPergunta]);
    
    // Resetar formulário
    setQuestionText("");
    setOptions([
      { option_text: "", is_correct: false, color: "#cf3f52" },
      { option_text: "", is_correct: false, color: "#6951a1" },
    ]);
    
    alert("Pergunta salva com sucesso!");
  };

  const abrirEdicaoPergunta = (index) => {
    const question = questions[index];
    setEditingQuestionIndex(index);
    setEditingQuestionText(question.text);
    setEditingOptions([...question.options]);
  };

  const salvarEdicaoPergunta = async () => {
    if (editingQuestionIndex === null) return;

    const question = questions[editingQuestionIndex];
    
    try {
      // Atualizar texto da pergunta no banco
      const { error: questionError } = await supabase
        .from("question")
        .update({ question_text: editingQuestionText })
        .eq("id", question.id);

      if (questionError) throw questionError;

      // Primeiro, remover todas as opções antigas
      const { error: deleteError } = await supabase
        .from("option")
        .delete()
        .eq("question_id", question.id);

      if (deleteError) throw deleteError;

      // Inserir novas opções
      const payloadOptions = editingOptions.map((opt) => ({
        question_id: question.id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
      }));

      const { error: insertError } = await supabase
        .from("option")
        .insert(payloadOptions);

      if (insertError) throw insertError;

      // Atualizar estado local
      const novasPerguntas = [...questions];
      novasPerguntas[editingQuestionIndex] = {
        ...question,
        text: editingQuestionText,
        options: [...editingOptions],
      };
      setQuestions(novasPerguntas);
      
      // Fechar edição
      setEditingQuestionIndex(null);
      setEditingQuestionText("");
      setEditingOptions([]);
      
      alert("Pergunta atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar pergunta:", error);
      alert("Erro ao atualizar pergunta: " + error.message);
    }
  };

  const cancelarEdicao = () => {
    setEditingQuestionIndex(null);
    setEditingQuestionText("");
    setEditingOptions([]);
  };

  const excluirPergunta = async (index) => {
    if (!window.confirm("Tem certeza que deseja excluir esta pergunta?")) return;

    const question = questions[index];
    
    try {
      // Excluir do banco
      const { error: pivotError } = await supabase
        .from("quiz_question")
        .delete()
        .eq("question_id", question.id);

      if (pivotError) throw pivotError;

      const { error: optionsError } = await supabase
        .from("option")
        .delete()
        .eq("question_id", question.id);

      if (optionsError) throw optionsError;

      const { error: questionError } = await supabase
        .from("question")
        .delete()
        .eq("id", question.id);

      if (questionError) throw questionError;

      // Atualizar estado local
      const novasPerguntas = questions.filter((_, i) => i !== index);
      setQuestions(novasPerguntas);
      
      // Se estiver editando esta pergunta, cancelar edição
      if (editingQuestionIndex === index) {
        cancelarEdicao();
      }
      
      alert("Pergunta excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir pergunta:", error);
      alert("Erro ao excluir pergunta: " + error.message);
    }
  };

  const adicionarNovaPergunta = () => {
    // Fechar qualquer edição em andamento
    if (editingQuestionIndex !== null) {
      cancelarEdicao();
    }
    
    // Focar no formulário de nova pergunta
    document.getElementById("nova-pergunta-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        {/* Título */}
        <h1 className={styles.title}>New sala</h1>

        {/* Input da Sala */}
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

        {/* Descrição */}
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

        {/* Botão Criar Quiz */}
        <div className={styles.quizActions}>
          <button className={styles.primaryButton} onClick={criarQuiz}>
            Criar Quiz
          </button>
          {quizId && (
            <span className={styles.quizId}>Quiz ID: {quizId}</span>
          )}
        </div>

        {/* Separador */}
        <div className={styles.separator}></div>

        {/* Formulário para Nova Pergunta - AGORA SEMPRE VISÍVEL */}
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
            <h4>Opções:</h4>
            {options.map((opt, index) => (
              <div key={index} className={styles.optionRow}>
                <input
                  className={styles.optionInput}
                  type="text"
                  placeholder={`Opção ${index + 1}`}
                  value={opt.option_text}
                  onChange={(e) => {
                    const novas = [...options];
                    novas[index].option_text = e.target.value;
                    setOptions(novas);
                  }}
                  style={{ borderLeftColor: opt.color }}
                />

                <button
                  onClick={() => marcarComoCorreta(index)}
                  className={styles.correctButton}
                  style={{
                    background: opt.is_correct ? opt.color : "#888",
                  }}
                >
                  {opt.is_correct ? "✔ Correta" : "Marcar correta"}
                </button>
                
                {options.length > 2 && (
                  <button 
                    onClick={() => removerOpcao(index)}
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
              disabled={options.length >= 6}
            >
              Adicionar opção
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
              <p>⚠️ Você precisa criar o quiz primeiro para salvar perguntas.</p>
            </div>
          )}
        </div>

        {/* Ações das Perguntas - Só aparece se houver quiz criado */}
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

            {/* Lista de Perguntas Salvas - Componentes Expandíveis */}
            {questions.map((question, index) => (
              <div 
                key={question.id} 
                className={`${styles.questionCard} ${editingQuestionIndex === index ? styles.editing : ''}`}
              >
                {/* Cabeçalho da Pergunta */}
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
                
                {/* Se estiver em modo de edição */}
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
                      <h4>Opções:</h4>
                      {editingOptions.map((opt, optIndex) => (
                        <div key={optIndex} className={styles.optionRow}>
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
                        disabled={editingOptions.length >= 6}
                      >
                        Adicionar opção
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
                  /* Visualização normal (não editando) */
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

                    {/* Badge de Múltipla Escolha */}
                    <div className={styles.modeContainer}>
                      <span className={styles.modeBadge}>
                        Múltipla escolha
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Espaço para adicionar mais perguntas */}
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
  );
}