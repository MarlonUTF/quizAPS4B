import BemVindo from "../../../public/bemvindo.png"
import styles from "./TelaInicial.module.css"
import { useNavigate } from 'react-router-dom';

export default function TelaInicial() {
    const navigate = useNavigate();

    const handleCriar = () => {
        navigate('/telaloginadm');
    };

    const handleJogar = () => {
        navigate('/telaloginjogador');
    };
    return (
        <div className={styles.background}>
            <img src={BemVindo} alt="" width={400} />

            <div className={styles.buttons}>
                <button onClick={handleCriar} className={styles.btn}>Criar</button>
                <button onClick={handleJogar} className={styles.btn}>Jogar</button>
            </div>
        </div>
    )
}
