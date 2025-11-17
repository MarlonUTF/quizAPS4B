import style from './alertaAguardandoJogadores.module.css';

export default function AlertaAguardandoJogadores() {
    return (
        <div className={`${style.aguardando} ${style.dots}`}>
            Aguardando jogadores entrarem
        </div>
    );
}