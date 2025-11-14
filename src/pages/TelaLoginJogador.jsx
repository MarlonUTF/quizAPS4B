import "./TelaLoginJogador.css"
import Logo from "../../public/logo.png"
export default function TelaLoginJogador (){
    return(
        <div className="container">
            <img src={Logo} alt="" height={100} width={100}/>
            <div className="login">
            <h1>Login</h1>
            <input type="text" placeholder="Nome"/>
            <div className="entrar">
                <input className="codigoSala" type="text" placeholder="Código da sala"/>
                <button className="buttonEntrar">Entrar</button>
            </div>
            </div>
           
            
        </div>
    )

}