## ✅ **README.md (copie tudo)**
# 🌐 Projeto de Desenvolvimento Web 2 — APS  
### Técnico Integrado em Informática — UTFPR – 3° Ano  
---

## 📘 Sumário
- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Navegação entre Páginas](#navegação-entre-páginas)
- [Integrantes do Grupo](#integrantes-do-grupo)
- [Responsabilidades e Contribuições](#responsabilidades-e-contribuições)
  - [Samara](#samara)
  - [Marjory](#marjory)
  - [Marlon](#marlon)
  - [Talisson](#talisson)
- [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
- [Principais Recursos das Páginas](#principais-recursos-das-páginas)
- [Home.jsx](#homejsx)
- [CreateQuiz.jsx](#createquizjsx)

---

# 📌 Sobre o Projeto  
Este projeto faz parte das disciplinas **DW2** e **APS**, tendo como objetivo desenvolver um sistema completo de criação e gerenciamento de quizzes — incluindo back-end com Supabase, autenticação, criação de perguntas e respostas, sessões em tempo real e rankings.

---

# 🛠 Tecnologias Utilizadas  
- **React + Vite + JSX**  
- **CSS Modules**  
- **Material UI (pouco utilizado)**  
- **Supabase (Database + Auth + Realtime)**  

---

# 📍 Navegação entre Páginas  
| Página | Função |
|--------|--------|
| **/home** | lista quizzes do usuário |
| **/createquiz** | criação/edição de quiz |
| **/sessao** | controle de sessão do quiz |
| **/pergunta** | página de perguntas para jogadores |
| **/finalsessao** | ranking e análise final da sessão |

Links (exemplo de navegação Github interna):  
- [Home](#homejsx)  
- [CreateQuiz](#createquizjsx)  
- [Estrutura do Banco](#estrutura-do-banco-de-dados)  

---

# 👩‍💻👨‍💻 Integrantes do Grupo
- **Marjory**
- **Marlon**
- **Samara**
- **Talisson**

---

# 🧩 Responsabilidades e Contribuições

## 🟦 Samara
Participou ativamente da **estrutura visual**, incluindo:  
- Criação do **framework visual** e **wireframes**.  
- Organização completa do **Trello**, definindo prioridades e etapas.  
- Desenvolvimento de diversas telas em **CSS modular** com base no Figma.  
- Entregou páginas front-end para que o restante do time integrasse ao back-end.

---

## 🟩 Marjory
Focou no funcionamento completo e integração com o **Supabase**:  
- Construção da maior parte das **tabelas** e ajustes de relacionamentos.  
- Desenvolvimento das páginas:  
  - `criar_quiz`  
  - `criar_conta`  
  - `loginadm`  
  - `home`  
  - `viewquiz`  
- Implementou:  
  - Autenticação  
  - Perfis de usuário  
  - Conexão completa com banco  
  - Inserção, listagem, leitura e atualização de quizzes e perguntas  
  - Lógica de categorias e carregamento dinâmico  
  - Redirecionamentos, validações e tratamento de erros  

---

## 🟨 Marlon
Responsável por:  
- Lógica de **entrar em sessão**, **criar sessão**, **jogar quiz**.  
- Criou os sistemas de **ranking** e página `finalsessao`.  
- Auxiliou na criação do front das páginas de sessão.  
- Adicionou colunas extras no banco e desenvolveu o sistema de **geração automática de códigos de sessão** direto no Supabase.  

---

## 🟧 Talisson
Contribuiu com:  
- Suporte na tomada de decisões.  
- Apoio básico para Samara no front-end.  
- Auxiliou Samara e Marjory na organização geral do **Trello** e tarefas.  

---

# 🗄 Estrutura do Banco de Dados

Abaixo está o **schema completo utilizado**, mantido exatamente como referência (não deve ser executado).  

```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.category (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  category_name text,
  category_description text,
  CONSTRAINT category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.option (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  option_text text,
  is_correct boolean,
  question_id uuid,
  CONSTRAINT option_pkey PRIMARY KEY (id),
  CONSTRAINT option_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id)
);
CREATE TABLE public.player_answer (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  session_player_id uuid NOT NULL,
  quiz_question_id uuid NOT NULL,
  option_id uuid,
  time_taken integer,
  answered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT player_answer_pkey PRIMARY KEY (id),
  CONSTRAINT player_answer_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session(id),
  CONSTRAINT player_answer_session_player_id_fkey FOREIGN KEY (session_player_id) REFERENCES public.session_player(id),
  CONSTRAINT player_answer_quiz_question_id_fkey FOREIGN KEY (quiz_question_id) REFERENCES public.quiz_question(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  user_name text,
  created_at timestamp without time zone,
  email text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.question (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  question_text text,
  category_id uuid,
  CONSTRAINT question_pkey PRIMARY KEY (id),
  CONSTRAINT question_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id)
);
CREATE TABLE public.quiz (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_name text,
  quiz_description text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quiz_pkey PRIMARY KEY (id),
  CONSTRAINT fk_quiz_created_by FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.quiz_question (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  quiz_id uuid,
  question_id uuid,
  order_number integer,
  CONSTRAINT quiz_question_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_question_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quiz(id),
  CONSTRAINT quiz_question_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id)
);
CREATE TABLE public.session (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  code text NOT NULL DEFAULT generate_unique_session_code(),
  name text,
  description text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending'::text,
  current_order integer DEFAULT 0,
  question_started_at timestamp with time zone,
  question_time_limit integer DEFAULT 20,
  CONSTRAINT session_pkey PRIMARY KEY (id),
  CONSTRAINT session_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quiz(id),
  CONSTRAINT session_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.session_player (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  profile_id uuid,
  nickname text NOT NULL,
  emoji text NOT NULL,
  color text NOT NULL,
  is_admin boolean DEFAULT false,
  connected boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  correct_answers integer DEFAULT 0,
  CONSTRAINT session_player_pkey PRIMARY KEY (id),
  CONSTRAINT session_player_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session(id)
);
```

---

# 📄 Principais Recursos das Páginas

---

## 🏠 Home.jsx
- Carrega quizzes do usuário logado.  
- Busca `user_name` na tabela `profiles`.  
- Permite criar, visualizar e editar quizzes.  
- Ajusta layout automaticamente via `resize`.  
- Armazena o `quizId` no `localStorage` para navegação.

---

## 📝 CreateQuiz.jsx
Funcionalidades principais:

- Criar quiz novo ou editar existente  
- Buscar categorias do banco  
- Criar perguntas e opções  
- Controlar qual opção é correta  
- Listar perguntas do quiz  
- Carregar banco interno de perguntas  
- Sincronizar com Supabase  
- Editar perguntas existentes  
- Inserir em `quiz_question`, `question` e `option`  
- Usar filtros por categoria  
- Utilizar banco de perguntas para reutilização (evita duplicação)

