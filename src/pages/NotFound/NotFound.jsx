import styles from "./NotFound.module.css"
import Logo from '../../../public/logo.png';
export default function NotFound() {
    return (
        <div className={styles.page}>
            
            <div className={styles.card}>
                <h1 className={styles.title}>404</h1>
                <p className={styles.subtitle}>Página Não Encontrada</p>
                <p className={styles.text}>
                    Desculpe, a página que você procura não existe.
                </p>

                <a href="/" className={styles.button}>Voltar ao início</a>
            </div>

        </div>
    );
}
