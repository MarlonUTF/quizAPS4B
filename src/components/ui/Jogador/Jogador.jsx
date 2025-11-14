import style from './jogador.module.css';

// 🔹 Arrays globais para controle de uso
let usedColors = [];
let usedEmojis = [];

export default function Jogador({ nome }) {
  const emojis = [
    '😀', '😁', '😆', '🤣', '😇', '😍', '🤩', '🥰',
    '😘', '😋', '🤪', '😝', '🤑', '🤗', '🤭', '🤔',
    '🤠', '🥳', '😎', '🤓', '🙃', '🤨', '😐', '😑'
  ];

  const pastelColors = [
    'rgb(255, 160, 160)', // Rosa mais forte
    'rgb(255, 180, 120)', // Pêssego mais vivo
    'rgb(255, 255, 150)', // Amarelo mais intenso
    'rgb(170, 255, 170)', // Verde mais vivo
    'rgb(150, 240, 240)', // Azul mais forte
    'rgb(190, 160, 255)', // Lilás mais vibrante
    'rgb(255, 140, 170)', // Rosa chiclete
    'rgb(255, 200, 140)', // Damasco quente
    'rgb(200, 255, 150)', // Verde-limão mais vivo
    'rgb(150, 210, 255)', // Azul céu médio
    'rgb(230, 170, 255)', // Lilás intenso
    'rgb(255, 215, 170)', // Pêssego vibrante
    'rgb(170, 255, 220)', // Verde água forte
    'rgb(170, 200, 255)'  // Azul bebê mais marcante
  ];

  // 🔸 Função genérica para pegar item aleatório sem repetição
  function getUniqueItem(array, usedArray) {
    // Se já usou todas as opções, limpa e recomeça
    if (usedArray.length === array.length) usedArray.length = 0;

    let index;
    do {
      index = Math.floor(Math.random() * array.length);
    } while (usedArray.includes(index));

    usedArray.push(index);
    return array[index];
  }

  // 🔹 Escolher cor e emoji únicos
  const color = getUniqueItem(pastelColors, usedColors);
  const emoji = getUniqueItem(emojis, usedEmojis);

  return (
    <div className={style.jogador} style={{ backgroundColor: color }}>
      <p>{emoji}</p>
      <p>{nome}</p>
    </div>
  );
}
