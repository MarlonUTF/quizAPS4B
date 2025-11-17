import style from './jogador.module.css';

export default function Jogador({ nome, emoji, cor }) {
  return (
    <div className={style.jogador} style={{ backgroundColor: cor }}>
      <p>{emoji}</p>
      <p>{nome}</p>
    </div>
  );
}