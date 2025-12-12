import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import Logo from "../../../public/logo.png"; 
import Header from '../../components/layout/Header/Header';
import styles from "./ViewQuiz.module.css";

export default function VisualizarQuiz() {
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creatingSession, setCreatingSession] = useState(false);
    const navigate = useNavigate();

    const quizId = localStorage.getItem("quizId");

    useEffect(() => {
        if (!quizId) {
            console.error("Nenhum quizId encontrado no localStorage");
            setLoading(false);
            return;
        }

        async function fetchQuizData() {
            try {
                const { data: quizData, error: quizError } = await supabase
                    .from("quiz")
                    .select("*")
                    .eq("id", quizId)
                    .single();

                if (quizError) throw quizError;
                setQuiz(quizData);

                const { data: pivotData, error: pivotError } = await supabase
                    .from("quiz_question")
                    .select("question_id")
                    .eq("quiz_id", quizId);

                if (pivotError) throw pivotError;

                const questionIds = pivotData.map(item => item.question_id);

                if (questionIds.length === 0) {
                    setQuestions([]);
                    setLoading(false);
                    return;
                }

                const { data: questionData, error: questionError } = await supabase
                    .from("question")
                    .select("*")
                    .in("id", questionIds);

                if (questionError) throw questionError;

                const { data: optionData, error: optionError } = await supabase
                    .from("option")
                    .select("*")
                    .in("question_id", questionIds);

                if (optionError) throw optionError;

                const questionsWithOptions = questionData.map(q => ({
                    ...q,
                    options: optionData.filter(op => op.question_id === q.id)
                }));

                setQuestions(questionsWithOptions);
            } catch (error) {
                console.error("Erro ao carregar dados do quiz:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchQuizData();
    }, [quizId]);

    async function iniciarSessao() {
        if (!quizId) {
            alert("Erro: Quiz ID não encontrado!");
            return;
        }

        if (questions.length === 0) {
            alert("Este quiz não tem perguntas! Adicione perguntas antes de iniciar uma sessão.");
            return;
        }

        setCreatingSession(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                alert("Você precisa estar logado para criar uma sessão!");
                setCreatingSession(false);
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profileError) {
                console.error("Erro ao obter perfil:", profileError);
                alert("Erro ao obter informações do usuário!");
                setCreatingSession(false);
                return;
            }

            const { data: session, error: sessionError } = await supabase
                .from("session")
                .insert([
                    {
                        quiz_id: quizId,
                        created_by: user.id,
                        name: `Sessão: ${quiz?.quiz_name || "Quiz"}`,
                        description: `Sessão iniciada em ${new Date().toLocaleString()}`,
                        status: "pending",
                        current_order: 0,
                        question_time_limit: 20
                    }
                ])
                .select()
                .single();

            if (sessionError) {
                console.error("Erro ao criar sessão:", sessionError);
                alert("Erro ao criar sessão no banco de dados!");
                setCreatingSession(false);
                return;
            }

            console.log("Sessão criada:", session);

            const adminPlayer = {
                session_id: session.id,
                profile_id: user.id,
                nickname: profile.user_name || "Administrador",
                emoji: "👑",
                color: "#FFD700",
                is_admin: true,
                connected: true
            };

            const { data: player, error: playerError } = await supabase
                .from("session_player")
                .insert([adminPlayer])
                .select()
                .single();

            if (playerError) {
                console.error("Erro ao criar jogador administrador:", playerError);
                alert("Erro ao criar jogador administrador!");
                setCreatingSession(false);
                
                await supabase.from("session").delete().eq("id", session.id);
                return;
            }

            console.log("Jogador admin criado:", player);

            const playerData = {
                id: player.id,
                nickname: player.nickname,
                emoji: player.emoji,
                color: player.color,
                is_admin: player.is_admin,
                session_id: session.id
            };
            
            localStorage.setItem("quiz-player", JSON.stringify(playerData));

            navigate(`/sessao?session=${session.id}&player=${player.id}`);

        } catch (error) {
            console.error("Erro inesperado ao criar sessão:", error);
            alert("Ocorreu um erro inesperado. Tente novamente!");
            setCreatingSession(false);
        }
    }

    function editarQuiz() {
        localStorage.setItem("editQuizId", quizId);
        navigate("/criarquiz");
    }

    if (loading) return <p className={styles.loadingText}>Carregando quiz...</p>;
    if (!quiz) return <p className={styles.errorText}>Quiz não encontrado!</p>;

    return (
        <div className="viewQuiz">
           <Header showOnlyWhenData={true} />
            
            <div className={styles.pageContainer}>
                <img src={Logo} alt="Logo" height={100} width={100} />
                <div className={styles.content}>
                    
                    <h1 className={styles.quizTitle}>{quiz.quiz_name}</h1>

                    <div className={styles.infoBox}>
                        <p><strong>ID:</strong> {quiz.id}</p>
                        <p><strong>Descrição:</strong> {quiz.quiz_description || "Sem descrição"}</p>
                        <p><strong>Total de Perguntas:</strong> {questions.length}</p>
                    </div>

                    <div className={styles.actionsTop}>
                        <button className={styles.secondaryButton} onClick={editarQuiz}>
                            ✏ Editar Quiz
                        </button>
                    </div>

                    <h2 className={styles.questionsTitle}>Perguntas do Quiz ({questions.length})</h2>

                    {questions.length === 0 ? (
                        <p className={styles.noQuestions}>Nenhuma pergunta adicionada ainda.</p>
                    ) : (
                        <ul className={styles.questionList}>
                            {questions.map((q, index) => (
                                <li key={q.id} className={styles.questionItem}>
                                    <p className={styles.questionNumber}>Pergunta {index + 1}</p>
                                    <p className={styles.questionText}>{q.question_text}</p>

                                    <div className={styles.optionContainer}>
                                        {q.options.map((op) => (
                                            <p key={op.id} className={`${styles.optionItem} ${op.is_correct ? styles.correctOption : ''}`}>
                                                {op.option_text}
                                                {op.is_correct && " ✅"}
                                            </p>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <button 
                        className={styles.primaryButton} 
                        onClick={iniciarSessao}
                        disabled={creatingSession || questions.length === 0}
                    >
                        {creatingSession ? "Criando Sessão..." : `Iniciar Sessão (${questions.length} pergunta${questions.length !== 1 ? 's' : ''})`}
                    </button>

                    {questions.length === 0 && (
                        <p className={styles.warningText}>
                            Adicione pelo menos uma pergunta antes de iniciar uma sessão
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}