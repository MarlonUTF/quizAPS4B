import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import Logo from '../../../public/logo.png';
import ImgPlus from "../../../public/adicionar.png";
import styles from "./Home.module.css";
import Header from '../../components/layout/Header/Header';

export default function Home() {

    const [quizzes, setQuizzes] = useState([]);

    function handleCreateQuiz() {
        window.location.href = "/criarquiz";
    }

    // 👉 Salvar o quizId no localStorage e ir para /verquiz
    function abrirQuiz(id) {
        localStorage.setItem("quizId", id);
        window.location.href = "/verquiz";
    }

    async function loadQuizzes() {
        const { data, error } = await supabase
            .from("quiz")
            .select("*");

        if (error) {
            console.error("Erro ao carregar quizzes:", error);
        } else {
            setQuizzes(data);
        }
    }

    useEffect(() => {
        loadQuizzes();
    }, []);

    return (
        <div>
            <Header/>

            <div className={styles.container}>
                <img src={Logo} alt="" height={100} width={100} />
                <h1>Olá usuário!</h1>

                <div className={styles.buttonsRow}>

                    {/* Botão Criar Quiz */}
                    <div className={styles.option}>
                        <button 
                            className={styles.btnAdd} 
                            onClick={handleCreateQuiz}
                        >
                            <img src={ImgPlus} alt="" width={40} height={40}/>
                        </button>
                        <p>Criar Quiz</p>
                    </div>

                    {quizzes.map((quiz) => (
                        <div className={styles.option} key={quiz.id}>
                            <button 
                                className={styles.btnGreen}
                                onClick={() => abrirQuiz(quiz.id)}
                            >
                                {quiz.name?.slice(0, 12) }
                            </button>
                            <p>{quiz.quiz_name}</p>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
