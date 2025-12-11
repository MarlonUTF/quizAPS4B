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
    const [layoutType, setLayoutType] = useState('grid'); // 'grid' ou 'horizontal'

   
    function handleCreateQuiz() {
    // Limpa qualquer ID de edição anterior
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
        const { data, error } = await supabase
            .from("quiz")
            .select("*")
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao carregar quizzes:", error);
        } else {
            setQuizzes(data || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadQuizzes();
        
        // Verifica se precisa mudar para layout horizontal baseado na quantidade
        const checkLayout = () => {
            if (window.innerWidth < 768) {
                setLayoutType('grid'); // Em mobile, sempre grid
            } else {
                // Em desktop, usa horizontal se tiver muitos quizzes
                setLayoutType('grid'); // ou você pode usar uma lógica baseada no número
            }
        };
        
        checkLayout();
        window.addEventListener('resize', checkLayout);
        
        return () => window.removeEventListener('resize', checkLayout);
    }, []);

    return (
        <div className={styles.page}>
            <Header/>
            
            <div className={styles.container}>
                <img src={Logo} alt="Logo" height={150} width={150} />
                <h1>Olá usuário!</h1>
                
                {/* Opção para mudar layout (opcional) */}
                {/* <div className={styles.layoutToggle}>
                    <button onClick={() => setLayoutType('grid')}>Grid</button>
                    <button onClick={() => setLayoutType('horizontal')}>Lista</button>
                </div> */}

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
                    <>
                        {layoutType === 'horizontal' ? (
                            <div className={styles.horizontalScroll}>
                                {/* Botão Criar Quiz */}
                                <div className={styles.option}>
                                    <button 
                                        className={styles.btnAdd} 
                                        onClick={handleCreateQuiz}
                                        aria-label="Criar novo quiz"
                                    >
                                        <img src={ImgPlus} alt="Adicionar" width={40} height={40}/>
                                    </button>
                                    <p>Criar Quiz</p>
                                </div>

                                {quizzes.map((quiz) => (
                                    <div className={styles.option} key={quiz.id}>
                                        <button 
                                            className={styles.btnGreen}
                                            onClick={() => abrirQuiz(quiz.id)}
                                            title={quiz.quiz_name}
                                        >
                                            <span className={styles.quizName}>
                                                {quiz.quiz_name}
                                            </span>
                                        </button>
                                        <p>{quiz.quiz_name}</p>
                                        <button 
                                            className={styles.editButton}
                                            onClick={() => editarQuiz(quiz.id)}
                                        >
                                            <img src={ImgEditar} alt="" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.buttonsRow}>
                                {/* Botão Criar Quiz */}
                                <div className={styles.option}>
                                    <button 
                                        className={styles.btnAdd} 
                                        onClick={handleCreateQuiz}
                                        aria-label="Criar novo quiz"
                                    >
                                        <img src={ImgPlus} alt="Adicionar" width={40} height={40}/>
                                    </button>
                                    <p>Criar Quiz</p>
                                </div>

                                {quizzes.map((quiz) => (
                                    <div className={styles.option} key={quiz.id}>
                                        <button 
                                            className={styles.btnGreen}
                                            onClick={() => abrirQuiz(quiz.id)}
                                            title={quiz.quiz_name}
                                        >
                                            <span className={styles.quizName}>
                                                {quiz.quiz_name.length > 20 
                                                    ? quiz.quiz_name.substring(0, 20) + '...' 
                                                    : quiz.quiz_name}
                                            </span>
                                        </button>
                                        <div className={styles.nomeEditar}>
                                            <p>
                                            {quiz.quiz_name.length > 24 
                                                ? quiz.quiz_name.substring(0, 24) + '...' 
                                                : quiz.quiz_name}
                                                
                                        </p>
                                        <button 
                                            className={styles.editButton}
                                            onClick={() => editarQuiz(quiz.id)}
                                        >
                                            <img src={ImgEditar} alt="" />
                                        </button>
                                        </div>
                                        
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}