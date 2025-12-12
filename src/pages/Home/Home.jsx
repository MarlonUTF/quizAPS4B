import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import Logo from '../../../public/logo.png';
import ImgPlus from "../../../public/adicionar.png";
import styles from "./Home.module.css";
import Header from '../../components/layout/Header/Header';
import ImgEditar from '../../../public/editar.png';

export default function Home() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [layoutType, setLayoutType] = useState("grid");
    const [userName, setUserName] = useState("");

    function handleCreateQuiz() {
        localStorage.removeItem("editQuizId");
        window.location.href = "/criarquiz";
    }

    function abrirQuiz(id) {
        localStorage.setItem("quizId", id);
        window.location.href = "/verquiz";
    }

    function editarQuiz(id) {
        localStorage.setItem("editQuizId", id);
        window.location.href = "/criarquiz";
    }

    async function loadQuizzes() {
        setLoading(true);

        // 🔥 PEGA O USUÁRIO LOGADO
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData?.user) {
            console.error("Usuário não encontrado:", userError);
            setLoading(false);
            return;
        }

        const userId = userData.user.id;

        // 🔥 BUSCA O NOME DO USUÁRIO NA TABELA PROFILES (COLUNA user_name)
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("user_name")
            .eq("id", userId)
            .single();

        if (!profileError && profile) {
            setUserName(profile.user_name);
        } else {
            console.warn("user_name não encontrado no profile.");
        }

        // 🔥 BUSCA APENAS QUIZZES DO USUÁRIO
        const { data, error } = await supabase
            .from("quiz")
            .select("*")
            .eq("created_by", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao carregar quizzes:", error);
        } else {
            setQuizzes(data || []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadQuizzes();

        const checkLayout = () => {
            if (window.innerWidth < 768) {
                setLayoutType("grid");
            }
        };

        checkLayout();
        window.addEventListener("resize", checkLayout);
        return () => window.removeEventListener("resize", checkLayout);
    }, []);

    return (
        <div className={styles.page}>
            <Header />

            <div className={styles.container}>
                <img src={Logo} alt="Logo" height={150} width={150} />

                {/* 🔥 AGORA MOSTRA O NOME DO USUÁRIO */}
                <h1>Olá, {userName || "usuário"}!</h1>

                {loading ? (
                    <div className={styles.loading}>
                        <p>Carregando quizzes...</p>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Nenhum quiz encontrado.</p>
                        <p>Clique no botão + para criar seu primeiro quiz!</p>
                    </div>
                ) : (
                    <div className={styles.buttonsRow}>
                        {/* Botão Criar Quiz */}
                        <div className={styles.option}>
                            <button
                                className={styles.btnAdd}
                                onClick={handleCreateQuiz}
                            >
                                <img src={ImgPlus} alt="Adicionar" width={40} />
                            </button>
                            <p>Criar Quiz</p>
                        </div>

                        {/* Lista de quizzes */}
                        {quizzes.map((quiz) => (
                            <div className={styles.option} key={quiz.id}>
                                <button
                                    className={styles.btnGreen}
                                    onClick={() => abrirQuiz(quiz.id)}
                                    title={quiz.quiz_name}
                                >
                                    <span className={styles.quizName}>
                                        {quiz.quiz_name.length > 20
                                            ? quiz.quiz_name.substring(0, 20) + "..."
                                            : quiz.quiz_name}
                                    </span>
                                </button>

                                <div className={styles.nomeEditar}>
                                    <p>
                                        {quiz.quiz_name.length > 24
                                            ? quiz.quiz_name.substring(0, 24) + "..."
                                            : quiz.quiz_name}
                                    </p>

                                    <button
                                        className={styles.editButton}
                                        onClick={() => editarQuiz(quiz.id)}
                                    >
                                        <img src={ImgEditar} alt="Editar" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
