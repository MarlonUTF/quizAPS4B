import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Header from '../../components/layout/Header/Header';
import Logo from '../../../public/logo.png';
import styles from './Pergunta.module.css';

export default function Pergunta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const sessionPlayerId = searchParams.get('player');

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [player, setPlayer] = useState(null);
  const [quiz, setQuiz] = useState(null);

  const optionColors = ["#644dc4", "#9c27b0", "#2196f3", "#4caf50"];

  useEffect(() => {
    if (!sessionId || !sessionPlayerId) {
      navigate('/telaloginjogador');
      return;
    }
    loadQuizData();
  }, [sessionId, sessionPlayerId, navigate]);

  const loadQuizData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Carregar sessão
      const { data: session, error: sessionError } = await supabase
        .from('session')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Carregar jogador
      const { data: playerData, error: playerError } = await supabase
        .from('session_player')
        .select('*')
        .eq('id', sessionPlayerId)
        .eq('session_id', sessionId)
        .single();

      if (playerError) throw playerError;
      setPlayer(playerData);

      // Carregar quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quiz')
        .select('*')
        .eq('id', session.quiz_id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Carregar perguntas com opções
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_question')
        .select(`
          id,
          order_number,
          question:question_id (
            id,
            question_text,
            options:option(*)
          )
        `)
        .eq('quiz_id', session.quiz_id)
        .order('order_number', { ascending: true });

      if (questionsError) throw questionsError;

      if (!questionsData || questionsData.length === 0) {
        throw new Error('Este quiz não tem perguntas');
      }

      // Processar perguntas com cores
      const processedQuestions = questionsData.map(q => ({
        quizQuestionId: q.id,
        questionId: q.question.id,
        text: q.question.question_text,
        order: q.order_number,
        options: q.question.options.map((opt, idx) => ({
          ...opt,
          color: optionColors[idx % optionColors.length]
        }))
      }));

      setQuestions(processedQuestions);

      // Carregar respostas existentes
      const { data: existingAnswers, error: answersError } = await supabase
        .from('player_answer')
        .select('quiz_question_id, option_id')
        .eq('session_player_id', sessionPlayerId)
        .eq('session_id', sessionId);

      if (!answersError && existingAnswers) {
        const answersMap = {};
        existingAnswers.forEach(answer => {
          answersMap[answer.quiz_question_id] = answer.option_id;
        });
        setSelectedAnswers(answersMap);
      }

    } catch (err) {
      console.error('Erro:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const submitAnswers = async () => {
    if (Object.keys(selectedAnswers).length === 0) {
      const confirmSubmit = window.confirm(
        'Você não respondeu nenhuma pergunta. Deseja enviar mesmo assim?'
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    
    try {
      // Limpar respostas anteriores (evitar duplicação)
      const { error: deleteError } = await supabase
        .from('player_answer')
        .delete()
        .eq('session_player_id', sessionPlayerId)
        .eq('session_id', sessionId);

      if (deleteError) console.warn('Aviso ao limpar respostas anteriores:', deleteError);

      // Preparar e inserir novas respostas
      const answersToInsert = Object.entries(selectedAnswers)
        .filter(([_, optionId]) => optionId !== null && optionId !== undefined)
        .map(([quizQuestionId, optionId]) => ({
          session_id: sessionId,
          session_player_id: sessionPlayerId,
          quiz_question_id: quizQuestionId,
          option_id: optionId,
          answered_at: new Date().toISOString()
        }));

      if (answersToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('player_answer')
          .insert(answersToInsert);

        if (insertError) throw insertError;
      }

      // Calcular pontuação e atualizar o jogador
      let score = 0;
      questions.forEach(question => {
        // Encontrar a opção correta para esta pergunta
        const correctOption = question.options.find(opt => opt.is_correct);
        const playerAnswer = selectedAnswers[question.quizQuestionId];
        
        if (correctOption && playerAnswer === correctOption.id) {
          score++;
        }
      });

      // Atualizar pontuação do jogador no banco de dados
      const { error: updateError } = await supabase
        .from('session_player')
        .update({ correct_answers: score })
        .eq('id', sessionPlayerId);

      if (updateError) throw updateError;

      // Redirecionar diretamente para a página finalsessao
      navigate(`/finalsessao?session=${sessionId}&player=${sessionPlayerId}`);

    } catch (err) {
      console.error('Erro ao enviar:', err);
      alert('Erro ao enviar respostas. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).filter(id => selectedAnswers[id] !== null).length;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Carregando quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h3 className={styles.errorTitle}>⚠️ Erro ao carregar quiz</h3>
          <p className={styles.errorText}>{error}</p>
          <div className={styles.errorActions}>
            <button
              onClick={() => navigate('/telaloginjogador')}
              className={styles.backButton}
            >
              Voltar
            </button>
            <button
              onClick={loadQuizData}
              className={styles.retryButton}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header
        playerName={player?.nickname}
        playerEmoji={player?.emoji}
        playerColor={player?.color}
      />

      <div className={styles.logoContainer}>
        <img src={Logo} alt="Logo" className={styles.logo} />
      </div>

      {/* Progresso */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          ></div>
        </div>
        <span className={styles.progressText}>
          Pergunta {currentQuestionIndex + 1} de {questions.length}
          <span className={styles.answeredCount}>
            • {answeredCount} respondida{answeredCount !== 1 ? 's' : ''}
          </span>
        </span>
      </div>

      {/* Pergunta */}
      <div className={styles.questionNumberContainer}>
        <h2 className={styles.questionNumber}>
          Pergunta {currentQuestionIndex + 1}
        </h2>
        <p className={styles.quizName}>{quiz?.quiz_name}</p>
      </div>

      <div className={styles.questionCard}>
        <div className={styles.questionTextContainer}>
          <p className={styles.questionText}>
            {currentQuestion?.text || 'Pergunta não disponível'}
          </p>
        </div>

        <div className={styles.separator}></div>

        {/* Opções */}
        <div className={styles.optionsContainer}>
          {currentQuestion?.options?.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.quizQuestionId] === option.id;
            
            return (
              <div
                key={option.id}
                className={`${styles.optionBox} ${isSelected ? styles.optionSelected : ''}`}
                style={{
                  backgroundColor: option.color,
                  borderLeftColor: option.color
                }}
              >
                <button
                  className={styles.optionButton}
                  onClick={() => handleAnswerSelect(currentQuestion.quizQuestionId, option.id)}
                  disabled={selectedAnswers[currentQuestion.quizQuestionId] !== undefined}
                >
                  <div className={styles.optionContent}>
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={styles.optionText}>
                      {option.option_text}
                    </span>
                    {isSelected && (
                      <span className={styles.selectedIndicator}>✓</span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Status */}
        <div className={styles.statusContainer}>
          {selectedAnswers[currentQuestion?.quizQuestionId] !== undefined ? (
            <div className={styles.answeredStatus}>
              <span>✅ Resposta selecionada</span>
              {!isLastQuestion && (
                <button
                  onClick={goToNextQuestion}
                  className={styles.nextButton}
                >
                  Próxima Pergunta →
                </button>
              )}
            </div>
          ) : (
            <div className={styles.waitingStatus}>
              <span>👉 Selecione uma opção acima</span>
            </div>
          )}
        </div>
      </div>

      {/* Navegação */}
      <div className={styles.navigationContainer}>
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={styles.navButton}
        >
          ← Anterior
        </button>
        
        <div className={styles.pageNumbers}>
          {questions.map((_, index) => {
            const hasAnswer = selectedAnswers[questions[index]?.quizQuestionId] !== undefined;
            return (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`${styles.pageBtn} ${index === currentQuestionIndex ? styles.active : ''} ${hasAnswer ? styles.answered : ''}`}
                title={`Pergunta ${index + 1}${hasAnswer ? ' (respondida)' : ''}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {isLastQuestion ? (
          <button 
            onClick={submitAnswers}
            disabled={isSubmitting}
            className={styles.finishButton}
          >
            {isSubmitting ? 'Enviando...' : '🏁 Finalizar Quiz'}
          </button>
        ) : (
          <button onClick={goToNextQuestion} className={styles.navButton}>
            Próxima →
          </button>
        )}
      </div>
    </div>
  );
}