# 🎯 Estrutura do Projeto — Quiz App (React + Vite + Tailwind + MUI)

Este documento descreve detalhadamente a estrutura de pastas e arquivos do projeto **Quiz App**, explicando o propósito de cada diretório e arquivo dentro da aplicação.

---

## 📁 Estrutura Geral

quizAPS4B/
│
├── public/
│ └── favicon.ico
│
├── src/
│ ├── assets/
│ ├── components/
│ ├── pages/
│ ├── routes/
│ ├── context/
│ ├── hooks/
│ ├── services/
│ ├── styles/
│ ├── utils/
│ ├── App.jsx
│ ├── main.jsx
│ └── vite-env.d.ts
│
├── tailwind.config.js
├── package.json
├── postcss.config.js
├── index.html
└── README.md


---

## 📦 Diretórios Principais

### 🗂️ **public/**
Contém arquivos estáticos acessíveis diretamente pelo navegador, como o **favicon**, imagens públicas ou ícones que não passam pelo processo de build do Vite.

> **Exemplo:**  
> - `favicon.ico`: Ícone exibido na aba do navegador.

---

### 🎨 **src/assets/**
Armazena todos os **recursos estáticos** utilizados dentro dos componentes ou páginas, como imagens, sons e ícones.

**Estrutura interna:**
assets/
├── logo.svg
└── backgrounds/

- `logo.svg`: Logotipo principal da aplicação.
- `backgrounds/`: Imagens de fundo, texturas ou elementos visuais de apoio.

> ✅ **Boas práticas:** mantenha nomes claros e padronizados (`logoDark.svg`, `loginBg.png`).

---

### ⚙️ **src/components/**
Contém **componentes reutilizáveis** que podem ser usados em diferentes partes da aplicação.

#### 📂 `ui/`
Componentes **genéricos e visuais**, como botões, inputs, e containers de interface.

- `CustomButton.jsx` → botão personalizado com estilos do Tailwind + MUI.  
- `TextInput.jsx` → campo de entrada reutilizável com validação.  
- `CardContainer.jsx` → container visual padrão para blocos de conteúdo.

#### 📂 `layout/`
Componentes que **organizam a estrutura visual** das páginas.

- `Navbar.jsx` → barra de navegação principal.  
- `Footer.jsx` → rodapé do site.  
- `Sidebar.jsx` → menu lateral usado em dashboards.

#### 📂 `quiz/`
Componentes **específicos do jogo de quiz**.

- `QuestionCard.jsx` → exibe a pergunta e opções de resposta.  
- `Timer.jsx` → cronômetro para cada rodada.  
- `Scoreboard.jsx` → mostra a pontuação e ranking dos jogadores.

---

### 🧭 **src/pages/**
Reúne as **páginas principais** da aplicação, divididas conforme as rotas.

#### 📂 `Auth/`
Telas relacionadas à autenticação do usuário.
- `Login.jsx` → página de login.  
- `Register.jsx` → página de cadastro.

#### 📂 `Dashboard/`
Área administrativa para gerenciamento de salas e quizzes.
- `ManageRooms.jsx` → lista e edita salas existentes.  
- `CreateRoom.jsx` → formulário de criação de novas salas.  
- `DashboardHome.jsx` → painel inicial do administrador.

#### 📂 `PlayerRoom/`
Tela onde os jogadores interagem e jogam.
- `RoomLobby.jsx` → sala de espera antes do início do jogo.  
- `QuizGame.jsx` → onde o jogador responde perguntas.  
- `Results.jsx` → mostra o resultado final após o jogo.

#### Outras páginas:
- `Home.jsx` → página inicial da aplicação.  
- `NotFound.jsx` → página de erro 404.

---

### 🚦 **src/routes/**
Gerencia as **rotas e navegação** da aplicação.

- `AppRoutes.jsx` → define todas as rotas do app com o React Router.  
- `ProtectedRoute.jsx` → componente que restringe o acesso a rotas protegidas (exige login/autenticação).

---

### 🧩 **src/context/**
Armazena **Context APIs** para gerenciamento de estado global.

- `AuthContext.jsx` → controla autenticação, usuário atual e token.  
- `QuizContext.jsx` → armazena dados do quiz (perguntas, pontuação, progresso).

> 💡 Usado junto com o hook `useContext()` para compartilhar dados entre páginas sem precisar repassar props manualmente.

---

### 🪝 **src/hooks/**
Contém **hooks personalizados** que abstraem lógicas reutilizáveis.

- `useAuth.js` → facilita acesso e atualização dos dados de autenticação.  
- `useQuiz.js` → manipula estados e regras do quiz.  
- `useCountdown.js` → controla contagem regressiva para perguntas ou início de partida.

---

### 🔌 **src/services/**
Centraliza a **comunicação com APIs** externas ou banco de dados.

- `api.js` → configuração principal do Axios ou fetch.  
- `authService.js` → login, registro e logout.  
- `roomService.js` → criação e gerenciamento de salas.  
- `quizService.js` → manipulação de perguntas, respostas e resultados.

> ✅ Mantém o código organizado e evita repetição de chamadas HTTP.

---

### 💅 **src/styles/**
Responsável pelos **estilos globais** e configuração visual do projeto.

- `index.css` → arquivo global do Tailwind.  
- `theme.js` → personalizações do **Material UI** (cores, fontes, temas escuros, etc).

---

### 🧮 **src/utils/**
Contém **funções auxiliares e constantes** usadas em vários lugares.

- `formatTime.js` → formata segundos para “mm:ss”.  
- `validateEmail.js` → validação simples de e-mail.  
- `constants.js` → variáveis globais (ex: tempo padrão, número de questões).

---

### 🧠 **Arquivos principais**

- `App.jsx` → componente raiz da aplicação; define layout principal e integração de rotas.  
- `main.jsx` → ponto de entrada do Vite que renderiza o `<App />`.  
- `vite-env.d.ts` → arquivo de tipagem gerado automaticamente pelo Vite.

---

## 🧱 Nomes de Funções e Variáveis — Padrão camelCase

Para manter a consistência do código, use o padrão **camelCase**:

| Tipo | Exemplo | Explicação |
|------|----------|------------|
| Variável simples | `userName`, `roomCode` | Começa com minúscula, cada nova palavra inicia com maiúscula. |
| Função | `handleLogin()`, `fetchQuestions()` | Sempre inicia com um verbo descritivo. |
| Estado React | `[isLoading, setIsLoading]` | use o prefixo `is`, `has` ou `show` para booleanos. |
| Hook customizado | `useAuth()`, `useQuiz()` | Sempre começa com `use`. |
| Contexto | `AuthContext`, `QuizContext` | PascalCase (primeira letra maiúscula). |

> ⚠️ **Evite:** `snake_case`, `kebab-case` ou abreviações excessivas.  
> ✅ **Prefira:** nomes curtos, claros e descritivos — ex: `handleCreateRoom`, `playerScore`, `startCountdown`.

---

## ✅ Boas Práticas de Organização

- Mantenha **cada componente em seu contexto lógico** (UI, layout, quiz).  
- Evite duplicar lógica — use **hooks e contextos** sempre que possível.  
- Nomeie arquivos e funções de forma **autoexplicativa**.  
- Utilize **imports absolutos** se possível (ex: `@/components/ui/CustomButton`).  
- Comente partes complexas do código, mas evite comentários redundantes.

---

## 🧩 Tecnologias Utilizadas
- **React + Vite** → estrutura base e build rápido.
- **TailwindCSS** → estilização responsiva e utilitária.
- **Material UI (MUI)** → componentes visuais prontos e customizáveis.
- **React Router DOM** → controle de rotas e navegação.sim
---

## ✍️ Convenção de Nomes — Funções, Variáveis e Componentes

Manter um padrão de nomenclatura consistente é essencial para garantir **clareza, legibilidade e manutenção** do código.  
Neste projeto, seguimos o padrão **camelCase** e **PascalCase**, amplamente usados no ecossistema React.

---

### 🐫 1. camelCase

    Usado para:
    - Variáveis comuns
    - Funções
    - Estados (useState)
    - Hooks personalizados (com o prefixo `use`)

    📘 **Formato:**  

    ```js
    let playerScore = 0;
    const roomCode = "AB12";
    function handleLogin() { ... }
    const fetchQuizData = async () => { ... };
    ```
---

### 🧠 2. PascalCase

    Usado para:
    - Componentes React
    - Contextos
    - Classes (caso aplicável)

    📘 **Formato:**
    ```js
    function LoginPage() { ... }
    const QuizContext = createContext();
    export default CustomButton;
    ```  

---
###⚙️ 3. Nomes de Funções — boas práticas
1. Use verbos descritivos que indiquem a ação executada:
    - get, set, handle, fetch, create, update, delete, validate, toggle

    - Exemplo:

    ```
    function handleSubmitForm() {}
    function fetchQuestions() {}
    function validateEmailInput() {}
    ```

2. Evite nomes genéricos ou curtos demais:
    ❌ doThing(), func(), x(), dataHandler()
    ✅ handleStartQuiz(), updateUserScore()

3. Prefira consistência:
    Se você usa handle para eventos (handleLogin, handleLogout), mantenha o padrão em todo o código.
---
### ⚡ 4. Estados e Setters (useState)

Estados do React seguem o formato:
```
const [isLoading, setIsLoading] = useState(false);
const [playerName, setPlayerName] = useState("");
```
---
##🪝 5. Hooks personalizados

Hooks devem sempre:

- Começar com o prefixo use

- Usar camelCase

- Ter nomes descritivos que expliquem sua função

✅ Exemplos corretos:
```
useAuth();
useQuiz();
useCountdown();
```
---
### 🌐 6. Contextos

Contextos devem usar PascalCase e terminar com Context.

✅ Exemplos corretos:
```
AuthContext
QuizContext
ThemeContext
```
---
###💬 7. Constantes e Objetos

Constantes globais podem usar MAIÚSCULAS_COM_UNDERSCORE,
mas variáveis internas e locais continuam em camelCase.

✅ Exemplos corretos:
```
const API_BASE_URL = "https://api.quizapp.com";
const maxPlayers = 8;
```
---

## 💡 Conclusão

Essa estrutura foi projetada para oferecer **clareza, escalabilidade e fácil manutenção**, permitindo que o projeto cresça de forma organizada, sem perder a coerência entre as camadas de UI, lógica e dados.

---

