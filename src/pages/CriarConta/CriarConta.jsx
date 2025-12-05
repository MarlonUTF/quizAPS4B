import Logo from '../../../public/logo.png'
import styles from "./CriarConta.module.css"
import { useState } from 'react'
import { supabase } from "../../supabaseClient"

export default function CriarConta() {

    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

   const handleCriarConta = async () => {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        console.log("Erro ao criar usuário:", error);
        return;
    }

    console.log("Usuário criado no Auth:", data);

    const userId = data.user.id;

    const { error: profileError } = await supabase
        .from("profiles")
        .update({ user_name: nome })
        .eq("id", userId);

    if (profileError) {
        console.log("Erro ao salvar nome no profile:", profileError);
    } else {
        console.log("Conta criada com sucesso!");
    }
};


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

                    <button className={styles.btn} onClick={handleCriarConta}>
                        Criar
                    </button>
                </div>
            </div>
        </div>
    )
}
