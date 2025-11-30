import BemVindo from "../../../public/bemvindo.png"
import styles from "./TelaInicial.module.css"

export default function TelaInicial() {
    return (
        <div className={styles.background}>
            <img src={BemVindo} alt="" width={400} />

            <div className={styles.buttons}>
                <button className={styles.btn}>Criar</button>
                <button className={styles.btn}>Jogar</button>
            </div>
        </div>
    )
}
