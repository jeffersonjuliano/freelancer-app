# Guia de Implantação (Deploy) em Produção

Este guia explica como rodar o sistema em um novo computador (Produção).

## Pré-requisitos

No computador de destino, você precisa instalar:
1.  **Node.js** (versão 18 ou superior): [Baixar aqui](https://nodejs.org/)
2.  **Git**: [Baixar aqui](https://git-scm.com/)

## Passo a Passo

### 1. Baixar o Código
Abra o terminal (PowerShell ou CMD) e clone o repositório (ou copie a pasta do projeto):

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd freelancer-app
```

### 2. Instalar Dependências
Instale as bibliotecas necessárias para o frontend e o backend:

```bash
# Instalar dependências da raiz (frontend)
npm install

# Instalar dependências do servidor
cd server
npm install
cd ..
```

### 3. Construir o Frontend
Gere a versão otimizada do site (pasta `dist`):

```bash
npm run build
```

### 4. Iniciar o Sistema
Agora você pode rodar o servidor, que vai servir tanto a API quanto o site:

```bash
npm run dev:server
```
*(Nota: O comando `dev:server` roda o backend. Como configuramos o backend para servir o frontend construído na pasta `dist`, basta acessar o endereço abaixo. **Não é necessário rodar o cliente na porta 5173 em produção, pois o servidor na porta 3000 cuidará de tudo.**)*

### 5. Acessar
Abra o navegador e acesse:
`http://localhost:3000`

## Dicas Importantes para Produção

*   **Banco de Dados**: O banco de dados `freelancer.db` é criado automaticamente na pasta `server` se não existir. **Faça backups regulares deste arquivo!**
*   **Segurança**: No arquivo `server/index.js`, altere a variável `SECRET_KEY` para uma senha forte e secreta.
*   **Firewall**: Se for acessar de outros computadores na rede, certifique-se de liberar a porta 3000 no Firewall do Windows.
