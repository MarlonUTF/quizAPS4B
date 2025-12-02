import Logo from '../../../public/logo.png'
import styles from "./CriarConta.module.css"
import { useState } from 'react'

export default function CriarConta() {

    const [nome, setNome] = useState("")
    const [sobrenome, setSobrenome] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const cadastro = async() =>{
        const { data, error } = await supabase.auth.signUp({
        nome, 
        sobrenome,    
        email,
        password
        });
    }

    return (
        <div className={styles.page}>
            <img src={Logo} alt="" width={100} />

            <div className={styles.criarConta}>
                <h1>Criar Conta</h1>

                <div className={styles.form}>
                    <p>Nome</p>
                    <input
                     type="text"
                     value={nome} 
                     onChange={(e) => setNome(e.target.value)} />

                    <p>Sobrenome</p>
                    <input 
                     type="text"
                     value={sobrenome} 
                     onChange={(e) => setSobrenome(e.target.value)} />
                    <p>Email</p>

                    <input 
                     type="text"
                     value={email} 
                     onChange={(e) => setEmail(e.target.value)} />

                    <p>Senha</p>
                    <input 
                     type="number"
                     value={password} 
                     onChange={(e) => setPassword(e.target.value)} />

                    <button className={styles.btn}>Criar</button>
                </div>
            </div>
        </div>
    )
}
