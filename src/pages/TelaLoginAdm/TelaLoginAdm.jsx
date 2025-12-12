import Logo from '../../../public/logo.png'
import styles from "./TelaLoginAdm.module.css"
import { useState } from 'react'
import { supabase } from "../../supabaseClient"

export default function TelaLoginAdm() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const login = async () => {
        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.log("Erro ao fazer login:", error.message)
            alert("Email ou senha incorretos.")
            setLoading(false)
            return
        }

        const user = data.user

        if (user) {
            localStorage.setItem("user_id", user.id)
        }

        console.log("Usuário logado:", user)

        window.location.href = "/inicio";
    }

    return (
        <div className={styles.page}>
            <img src={Logo} alt="logo" width={100} />

            <div className={styles.telaLoginAdm}>
                <h1>Login</h1>

                <div className={styles.form}>
                    <p>Email</p>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                    />

                    <p>Senha</p>
                    <input
                        type="password"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        className={styles.btn}
                        onClick={login}
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <div className={styles.links}>
                        <a className={styles.link} href="">Esqueceu sua senha?</a>
                        <a className={styles.link} href="/criarconta">Criar conta</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
