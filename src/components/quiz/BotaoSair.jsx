export default function BotaoSair({ onSair }) {
    return (
        <button
            onClick={onSair}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
            Sair
        </button>
    );
}