import style from './jogador.module.css';

export default function Jogador({ nome }) {
    const emojis = [
        '😀',
        '😁',
        '😆',
        '😅',
        '🤣',
        '😂',
        '😉',
        '😇',
        '🥰',
        '😍',
        '🤩',
        '😘',
        '😗',
        '😙',
        '🥲',
        '😏',
        '😋',
        '🤪',
        '😝',
        '🤑',
        '🤗',
        '🤭',
        '🫢',
        '🫣',
        '🤫',
        '🤔',
        '🫡',
        '🤤',
        '🤠',
        '🥳',
        '🥸',
        '😎',
        '🤓',
        '🧐',
        '🙃',
        '🫠',
        '🤐',
        '🤨',
        '😐',
        '😑',
        '😶',
        '😶‍🌫️',
        '😒',
        '🙄',
        '😬',
        '😮‍💨',
        '🤥',
        '🫨',
        '🙂‍↔️',
        '🙂‍↕️'
    ];
    const pastelColors = [
        'rgb(255, 223, 223)', // Rosa pastel suave
        'rgb(255, 233, 213)', // Pêssego pastel
        'rgb(255, 255, 223)', // Amarelo pastel
        'rgb(223, 255, 223)', // Verde pastel claro
        'rgb(223, 255, 255)', // Azul pastel claro
        'rgb(233, 223, 255)', // Lilás pastel
        'rgb(255, 213, 223)', // Rosa bebê
        'rgb(255, 240, 213)', // Damasco pastel
        'rgb(240, 255, 223)', // Verde limão pastel
        'rgb(223, 240, 255)', // Azul céu pastel
        'rgb(240, 223, 255)', // Lavanda pastel
        'rgb(255, 223, 240)', // Rosa claro
        'rgb(255, 247, 213)', // Amarelo creme
        'rgb(213, 255, 233)', // Verde menta
        'rgb(213, 233, 255)', // Azul gelo
        'rgb(247, 223, 255)', // Lilás claro
        'rgb(255, 230, 230)', // Rosa pálido
        'rgb(255, 245, 230)', // Pêssego claro
        'rgb(230, 255, 245)', // Verde água
        'rgb(230, 240, 255)'  // Azul bebê
      ];
    return (
        <div className={style.jogador} style={{backgroundColor: pastelColors[Math.floor(Math.random() * pastelColors.length)]}}>
            <p>{emojis[Math.floor(Math.random() * emojis.length)]}</p>
            <p>{nome}</p>
        </div>
    );
}