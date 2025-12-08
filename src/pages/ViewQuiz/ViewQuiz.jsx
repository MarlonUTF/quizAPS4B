import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import Logo from "../../../public/logo.png"; 
import Header from '../../components/layout/Header/Header';
import styles from "./ViewQuiz.module.css";

export default function VisualizarQuiz() {
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const quizId = localStorage.getItem("quizId");

    useEffect(() => {
        if (!quizId) {
            console.error("Nenhum quizId encontrado no localStorage");
            setLoading(false);
            return;
        }

        async function fetchQuizData() {

            const { data: quizData, error: quizError } = await supabase
                .from("quiz")
                .select("*")
                .eq("id", quizId)
                .single();

            if (quizError) {
                console.error("Erro ao buscar quiz:", quizError);
            } else {
                setQuiz(quizData);
            }

            // --- 2) Buscar IDs das perguntas da pivô ---
            const { data: pivotData, error: pivotError } = await supabase
                .from("quiz_question")
                .select("question_id")
                .eq("quiz_id", quizId);

            if (pivotError) {
                console.error("Erro ao buscar quiz_question:", pivotError);
                setLoading(false);
                return;
            }

            const questionIds = pivotData.map(item => item.question_id);

            if (questionIds.length === 0) {
                setQuestions([]);
                setLoading(false);
                return;
            }

            // --- 3) Buscar perguntas reais na tabela 'question' ---
            const { data: questionData, error: questionError } = await supabase
                .from("question")
                .select("*")
                .in("id", questionIds);

            if (questionError) {
                console.error("Erro ao buscar perguntas:", questionError);
            } else {
                setQuestions(questionData);
            }

            setLoading(false);
        }

        fetchQuizData();
    }, [quizId]);

    if (loading) return <p className={styles.loadingText}>Carregando quiz...</p>;
    if (!quiz) return <p className={styles.errorText}>Quiz não encontrado!</p>;

    return (
        <div className={styles.pageContainer}>
            <Header />

            <div className={styles.content}>
                <img src={Logo} alt="Logo" height={80} className={styles.logo} />

                <h1 className={styles.quizTitle}>{quiz.name}</h1>

                <div className={styles.infoBox}>
                    <p><strong>ID:</strong> {quiz.id}</p>
                    <p><strong>Descrição:</strong> {quiz.description || "Sem descrição"}</p>
                </div>

                <h2 className={styles.questionsTitle}>Perguntas do Quiz</h2>

                {questions.length === 0 ? (
                    <p className={styles.noQuestions}>Nenhuma pergunta adicionada ainda.</p>
                ) : (
                    <ul className={styles.questionList}>
                        {questions.map((q) => (
                            <li key={q.id} className={styles.questionItem}>
                                {q.text}
                            </li>
                        ))}
                    </ul>
                )}

                <button className={styles.primaryButton}>
                    Iniciar Quiz
                </button>
            </div>
        </div>
    );
}
