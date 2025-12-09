import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header/Header';
import Logo from '../../../public/logo.png';
import styles from './Pergunta.module.css';

export default function Pergunta() {
  // Dados de exemplo (mock)
  const quiz = {
    id: 1,
    quiz_name: "Geografia do Brasil",
    quiz_description: "Teste seus conhecimentos sobre o Brasil"
  };

  // Perguntas de exemplo com 4 opções
  const questions = [
    {
      id: 1,
      text: "Qual é a capital do Brasil?",
      options: [
        { option_text: "São Paulo", is_correct: false, color: "#cf3f52" },
        { option_text: "Rio de Janeiro", is_correct: false, color: "#6951a1" },
        { option_text: "Brasília", is_correct: true, color: "#3fa09b" },
        { option_text: "Salvador", is_correct: false, color: "#313191" }
      ]
    },
    {
      id: 2,
      text: "Qual o maior estado do Brasil em território?",
      options: [
        { option_text: "Amazonas", is_correct: true, color: "#cf3f52" },
        { option_text: "Mato Grosso", is_correct: false, color: "#6951a1" },
        { option_text: "Pará", is_correct: false, color: "#3fa09b" },
        { option_text: "Minas Gerais", is_correct: false, color: "#313191" }
      ]
    },
    {
      id: 3,
      text: "Quantos estados tem o Brasil?",
      options: [
        { option_text: "26 estados", is_correct: false, color: "#cf3f52" },
        { option_text: "27 estados", is_correct: true, color: "#6951a1" },
        { option_text: "25 estados", is_correct: false, color: "#3fa09b" },
        { option_text: "28 estados", is_correct: false, color: "#313191" }
      ]
    }
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(null);
    }
  }, [timeLeft, isAnswered]);

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    // Avançar após 1.5 segundos
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        proximaPergunta();
      } else {
        // Última pergunta - apenas resetar
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(15);
        alert("Quiz finalizado! Reiniciando...");
      }
    }, 1500);
  };

  const proximaPergunta = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(15);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={styles.pageContainer}>
      <Header />
        {/* Logo Centralizada */}
        <div className={styles.logoContainer}>
          <img src={Logo} alt="Logo" className={styles.logo} />
        </div>
        
        {/* Timer no canto superior direito */}
        <div className={styles.timerContainer}>
          <div className={styles.timerCircle}>
            <span className={styles.timerText}>{timeLeft}<span className={styles.timerLabel}>s</span> </span>
          </div>
        </div>
        
        {/* Número da Pergunta */}
        <div className={styles.questionNumberContainer}>
          <h2 className={styles.questionNumber}>
            Pergunta {currentQuestionIndex + 1}
          </h2>
          <p className={styles.quizName}>{quiz.quiz_name}</p>
        </div>
        
        {/* Card da Pergunta - Mesmo estilo da criação */}
        <div className={styles.questionCard}>
          {/* Texto da Pergunta */}
          <div className={styles.questionTextContainer}>
            <p className={styles.questionText}>{currentQuestion.text}</p>
          </div>
          
          {/* Separador */}
          <div className={styles.separator}></div>
          
          {/* Opções - Mesmo estilo da criação */}
          <div className={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={`
                  ${styles.optionBox}
                  ${selectedOption === index ? styles.optionSelected : ''}
                `}
                style={{ 
                  backgroundColor: option.color,
                  borderLeftColor: option.color
                }}
              >
                <button
                  className={styles.optionButton}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                >
                  <div className={styles.optionContent}>
                    <span className={styles.optionLetter}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={styles.optionText}>
                      {option.option_text}
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
          
          {/* Status */}
          <div className={styles.statusContainer}>
            {isAnswered ? (
              <div className={styles.answeredStatus}>
                <span>Resposta enviada!</span>
                {currentQuestionIndex < questions.length - 1 && (
                  <span className={styles.nextQuestionText}>
                    Próxima pergunta em breve...
                  </span>
                )}
              </div>
            ) : (
              <div className={styles.waitingStatus}>
                <span>Escolha uma opção acima</span>
                <span className={styles.timeWarning}>
                  ⏰ Tempo restante: {timeLeft}s
                </span>
              </div>
            )}
          </div>
          
          {/* Progresso */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` 
                }}
              ></div>
            </div>
            <span className={styles.progressText}>
              {currentQuestionIndex + 1} de {questions.length} perguntas
            </span>
          </div>
        </div>
        
      
    </div>
  );
}