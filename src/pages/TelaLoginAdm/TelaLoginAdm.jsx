import Logo from '../../../public/logo.png'
import styles from "./TelaLoginAdm.module.css"

export default function TelaLoginAdm(){
    return(
        <div className={styles.page}>
            <img src={Logo} alt="" width={100}/>

            <div className={styles.telaLoginAdm}>
                <h1>Login</h1>

                <div className={styles.form}> 
                    <p>Email</p>
                    <input type="text" className={styles.input} />

                    <p>Senha</p>
                    <input type="number" className={styles.input} />

                    <button className={styles.btn}>Entrar</button>

                    <div className={styles.links}>
                        <a className={styles.link} href="">Esqueceu sua senha?</a>
                        <a className={styles.link} href="/criarconta">Criar conta</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
