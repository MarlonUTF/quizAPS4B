import Logo from "../../public/logo.png"
export default function CriarConta(){
    return(
        <div>
            <img src={Logo} alt="" />
            <div className="criarConta">
                <h1>Criar conta</h1>
                <div> 
                    <p>Nome</p>
                    <input type="text" />
                    <p>Sobrenome</p>
                    <input type="text" />
                    <p></p>
                    <input type="text" />
                    <p>Nome</p>
                    <input type="text" />
                </div>
            </div>
        </div>
    )
}