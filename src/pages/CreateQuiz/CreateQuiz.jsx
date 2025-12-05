import Logo from '../../../public/logo.png'
import styles from "./CriarConta.module.css"
import { useState } from 'react'
import { supabase } from "../../supabaseClient"   

export default function CriarConta() {

    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [profileId, setProfileId] = useState(null)  

    const cadastro = async () => {
        const { data, error } = await supabase
            .from("profiles")
            .insert([
                {
                    user_name: nome,
                    email: email,
                    password: password,
                }
            ])
            .select()  

        if (error) {
            console.log("Erro:", error)
        } else {
            console.log("Cadastrado com sucesso:", data)
            setProfileId(data[0].id)
        }
    }

    return (
        <div className={styles.page}>
            <img src={Logo} alt="logo" width={100} />

            <div className={styles.criarConta}>
                <h1>Criar Conta</h1>

                <div className={styles.form}>
                    <p>Nome</p>
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />

                    <p>Email</p>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <p>Senha</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className={styles.btn} onClick={cadastro}>
                        Criar
                    </button>

                    {profileId && (
                        <p style={{ color: "white", marginTop: "10px" }}>
                            Conta criada (ID: {profileId})
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
