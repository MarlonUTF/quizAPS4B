import Logo from '../../../public/logo.png'
import styles from "./CriarConta.module.css"

export default function CriarConta() {
    return (
        <div className={styles.page}>
            <img src={Logo} alt="" width={100} />

            <div className={styles.criarConta}>
                <h1>Criar Conta</h1>

                <div className={styles.form}>
                    <p>Nome</p>
                    <input type="text" />
                    <p>Sobrenome</p>
                    <input type="text" />
                    <p>Email</p>
                    <input type="text" />
                    <p>Senha</p>
                    <input type="number" />

                    <button className={styles.btn}>Criar</button>
                </div>
            </div>
        </div>
    )
}
