# ✅ **PROMPT COMPLETO PARA OUTRA IA ENTENDER TODO O PROJETO**

Quero que você entenda totalmente meu projeto de quiz multiplayer estilo Kahoot, mas **sem WebSocket**, usando apenas **React + Vite + JSX** no front-end e fazendo sincronização em tempo real usando **useEffect + pooling no banco de dados**.

A seguir está **toda a estrutura do banco de dados** e **como o sistema funciona**, para você compreender todo o contexto do projeto.

---

# 📌 **1. DESCRIÇÃO DO BANCO DE DADOS (POSTGRES/SUPABASE)**

O banco possui as seguintes tabelas e relações:

---

## **📁 category**

Categorias de perguntas.

* **id** (uuid, PK)
* **created_at**
* **category_name**
* **category_description**

---

## **📁 question**

Perguntas cadastradas.

* **id** (uuid, PK)
* **created_at**
* **question_text**
* **category_id → FK para category.id**

---

## **📁 option**

Alternativas de cada pergunta.

* **id** (uuid, PK)
* **created_at**
* **option_text**
* **is_correct** (boolean)
* **question_id → FK para question.id**

Cada pergunta pode ter várias opções.

---

## **📁 quiz**

Um quiz inteiro (conjunto de perguntas organizado).

* **id** (uuid, PK)
* **quiz_name**
* **quiz_description**
* **created_by**
* **created_at**

---

## **📁 quiz_question**

Tabela pivot ligando quiz ↔ perguntas, com ordem.

* **id** (uuid, PK)
* **created_at**
* **quiz_id → FK para quiz.id**
* **question_id → FK para question.id**
* **order_number** (ordem da pergunta no quiz)

---

## **📁 session**

Uma sessão de jogo que um ADM inicia.

* **id** (uuid, PK)
* **quiz_id → FK para quiz.id**
* **code** (código da sala)
* **name**
* **description**
* **created_by → profiles.id**
* **status**: "pending" | "playing" | "finished"
* **current_order** (índice da pergunta atual)
* **question_started_at** (momento em que a pergunta começou)
* **question_time_limit** (ex: 20 segundos)

---

## **📁 session_player**

Jogadores conectados à sessão.

* **id** (uuid, PK)
* **session_id → FK para session.id**
* **profile_id** (opcional, caso login)
* **nickname**
* **emoji**
* **color**
* **is_admin**
* **connected**

---

## **📁 player_answer**

Respostas dos jogadores em cada pergunta.

* **id** (uuid, PK)
* **session_id → FK para session.id**
* **session_player_id → FK para session_player.id**
* **quiz_question_id → FK para quiz_question.id**
* **option_id → FK para option.id**
* **time_taken**
* **answered_at**

---

# 📌 **2. DESCRIÇÃO DO FUNCIONAMENTO DO SISTEMA**

## **Admin**

* Faz login.
* Cria um quiz.
* Cria perguntas e opções.
* Inicia uma **session** baseada em um quiz.
* A sessão gera um **código** (ex: 38492).
* Os jogadores entram com esse código.

Quando o admin inicia o jogo:

1. `session.status = "playing"`
2. `session.current_order` = número da pergunta atual
3. O admin troca para a próxima pergunta mudando o `current_order`
4. Tudo é atualizado automaticamente no front com **useEffect** verificando o banco.

---

# 📌 **3. COMO O MULTIPLAYER FUNCIONA SEM WEBSOCKET (SINCRONIZAÇÃO VIA useEffect)**

Não estou usando WebSocket nem Supabase Realtime.
Somente:

* React
* useEffect
* fetch constante ao banco

O front consulta o banco a cada X ms (200–500ms):

### Jogadores:

* Verificam `session.status`
* Verificam `session.current_order`
* Verificam se já existe pergunta nova
* Verificam se suas respostas já foram registradas

### Admin:

* Atualiza o banco (start, próxima pergunta, finalizar)
* Todos os players reagem instantaneamente via pooling.

### Player Answer:

Quando um jogador toca em uma opção:

* Envia para `player_answer`
* Marca tempo (`time_taken`)
* O front impede respostas múltiplas (checa se já respondeu)

---

# 📌 **4. O QUE EU QUERO FAZER NO FRONT-END**

Quero construir em React:

---

## **Tela do Admin**

* Login
* Lista de quizzes
* Criar quiz
* Adicionar perguntas
* Iniciar sessão
* Painel ao vivo da sessão:

  * Mostrar jogadores conectados
  * Controlar perguntas
  * Ver respostas em tempo real
  * Ranking final

---

## **Tela do Jogador**

* Entrar com código da sessão
* Escolher nickname + emoji
* Aguardar início
* Quando a pergunta começar:

  * Mostrar alternativas
  * Contagem regressiva baseada em:

    * `question_started_at`
    * `question_time_limit`
* Enviar resposta
* Aguardar próxima pergunta

---

## **Tela Final**

* Ranking
* Pontuação baseada no tempo da resposta
* Destaque para respostas corretas

---

# 📌 **5. OBJETIVO AO CONSULTAR A IA**

Quero que a IA:

1. Gere código React+Vite usando **useEffect** para sincronizar dados com o banco.
2. Não use WebSockets.
3. Entenda profundamente todas as tabelas e relações.
4. Ajude a criar:

   * Fluxo de admin
   * Fluxo de jogadores
   * Cálculo de pontuação
   * Sistema de tempo
   * UI inspirada no Kahoot
5. Gere consultas SQL seguras e corretas.
6. Evite erros de FK, relação quebrada ou consultas inválidas.
7. Usar sempre o banco acima como fonte da verdade.

---

# ✅ **FIM DO PROMPT**

Se quiser, posso gerar **outra versão mais técnica**, ou uma **versão curta**, ou uma **versão explicada para devs iniciantes**.
