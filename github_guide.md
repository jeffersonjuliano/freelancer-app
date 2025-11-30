# Como Subir o Projeto para o GitHub

O seu projeto já foi inicializado localmente com o Git e todos os arquivos foram "commitados". Agora, você precisa criar um repositório no GitHub e enviar seus arquivos.

Siga os passos abaixo:

## 1. Criar um Repositório no GitHub

1.  Acesse [github.com](https://github.com) e faça login.
2.  Clique no botão **"New"** (ou "Novo") no canto superior esquerdo (ou acesse [github.com/new](https://github.com/new)).
3.  **Repository name**: Digite um nome para o seu projeto (ex: `freelancer-app`).
4.  **Description** (Opcional): Adicione uma descrição.
5.  **Public/Private**: Escolha se quer que o código seja público ou privado.
6.  **Initialize this repository with**: **NÃO** marque nenhuma opção aqui (nem README, nem .gitignore, nem License). Queremos um repositório vazio.
7.  Clique em **"Create repository"**.

## 2. Conectar e Enviar o Código

Após criar o repositório, você verá uma tela com instruções. Procure pela seção **"…or push an existing repository from the command line"**.

Copie os comandos que aparecem lá. Eles serão parecidos com isto (substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pelos seus dados reais):

```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

## 3. Executar os Comandos

1.  Abra o terminal na pasta do projeto (onde você já está).
2.  Cole e execute os comandos que você copiou do GitHub, um por um.

Se for a primeira vez que você usa o Git neste computador, ele pode pedir para você fazer login no GitHub.

## Pronto!


## 4. Como fazer atualizações futuras

Sempre que você (ou eu) fizermos alterações no código e você quiser salvar no GitHub, siga estes 3 passos no terminal:

1.  **Adicionar as mudanças:**
    ```bash
    git add .
    ```
2.  **Salvar com uma mensagem (Commit):**
    ```bash
    git commit -m "Descreva aqui o que você mudou"
    ```
    *Exemplo: `git commit -m "Adicionei filtro de data"`*
3.  **Enviar para o GitHub (Push):**
    ```bash
    git push
    ```

**Dica:** Você pode simplesmente me pedir: *"Antigravity, faça um commit das alterações com a mensagem 'X'"*, e eu rodarei esses comandos para você!
