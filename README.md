# 7 Ouro Tabacaria Premium 🚬🏆

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

Uma plataforma de E-commerce moderna e premium, desenvolvida exclusivamente para a **7 Ouro Tabacaria**. O sistema oferece uma experiência de compra sofisticada para os clientes, com um poderoso painel administrativo para controle total da loja.

---

## 🌟 Funcionalidades Principais

### Para o Cliente (Vitrine)
- **Design Premium:** Interface moderna com tema escuro (Dark Mode) e detalhes em dourado (Gold Accents).
- **Catálogo Inteligente:** Filtros por categorias (Sedas, Tabacos, Piteiras, Acessórios).
- **Carrinho Dinâmico:** Carrinho flutuante com cálculo automático de subtotal e descontos.
- **Cupons Promocionais:** Suporte a códigos de desconto (Ex: `BEMVINDO10`).
- **Integração com WhatsApp:** Finalização do pedido direcionada automaticamente para o WhatsApp da loja, já com o resumo dos itens, descontos e valores.
- **Verificação de Idade:** Modal obrigatório de "Maior de 18 Anos" (Age Verification) com suporte a cookies.

### Para o Administrador (Dashboard)
- **Autenticação Segura:** Painel blindado via Middleware e Next.js Edge Functions.
- **Gestão de Produtos:** 
  - Adição/Edição com upload de imagens nativo.
  - Controle de preços regulares e preços promocionais.
  - Visibilidade (ocultar ou destacar produtos na página inicial).
- **Gestão de Categorias e Cupons:** Criação de novos setores e campanhas de desconto de forma intuitiva.
- **Responsividade Total:** O administrador pode gerenciar a loja inteira diretamente pelo celular.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando as melhores e mais recentes tecnologias do ecossistema Web:

- **[Next.js 14](https://nextjs.org/) (App Router):** Framework React para renderização Server-Side (SSR) e Edge.
- **[TypeScript](https://www.typescriptlang.org/):** Tipagem estática para um código seguro e escalável.
- **[Prisma ORM](https://www.prisma.io/):** Gerenciamento e tipagem do Banco de Dados.
- **[CSS Modules / Vanilla CSS]:** Estilização customizada, leve e sem dependências excessivas de frameworks.
- **Upload Local/Nuvem:** Gestão nativa de imagens com o componente `<Image />` otimizado do Next.js.

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v18 ou superior)
- NPM, Yarn ou PNPM.

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone https://github.com/Brasallis/7ourotabacaria.git
cd 7ourotabacaria
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as Variáveis de Ambiente:**
Crie um arquivo `.env` na raiz do projeto e configure o seu banco de dados:
```env
# Exemplo para SQLite (Local)
DATABASE_URL="file:./dev.db"

# Exemplo para PostgreSQL (Nuvem / Supabase)
# DATABASE_URL="postgresql://usuario:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
```

4. **Prepare o Banco de Dados:**
```bash
npx prisma generate
npx prisma db push
```
*(Opcional: Execute `node seed.js` para popular a loja com dados de demonstração).*

5. **Inicie o Servidor de Desenvolvimento:**
```bash
npm run dev
```

6. Acesse a aplicação em: `http://localhost:3000`

---

## 🔒 Segurança e Acessos
A área administrativa da loja pode ser acessada através da rota `/admin`. O acesso é protegido por senha e gerido através de cookies seguros (HttpOnly).

---

> Desenvolvido com muito café e código de ponta para a **7 Ouro Tabacaria**. 
