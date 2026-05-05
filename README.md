# Compliance Hub v2 - Arquitetura Segura

Sistema de gestao de compliance reestruturado com separacao de camadas e seguranca adequada.

## Arquitetura

```
compliance-hub-v2/
|
├── backend/                    # API Node.js/Express (PRIVADO - nunca exposto)
│   ├── .env.example            # Template de variaveis de ambiente
│   ├── package.json
│   └── src/
│       ├── server.js           # Ponto de entrada + configuracoes de seguranca
│       ├── middleware/
│       │   ├── auth.js         # Verificacao JWT + RBAC (controle por perfil)
│       │   └── errorHandler.js # Tratamento centralizado de erros
│       ├── routes/
│       │   ├── auth.js         # Login, logout, alterar senha
│       │   ├── users.js        # Gerenciamento de usuarios (admin only)
│       │   ├── denuncias.js    # Canal de denuncia (acesso restrito)
│       │   ├── empresas.js     # Empresas monitoradas
│       │   ├── tarefas.js      # Tarefas e acoes de compliance
│       │   └── logs.js         # Logs de auditoria (somente leitura)
│       ├── database/
│       │   ├── db.js           # Pool de conexoes PostgreSQL
│       │   ├── schema.sql      # Estrutura do banco de dados
│       │   ├── migrate.js      # Script de migracao
│       │   └── seed.js         # Dados iniciais (admin inicial)
│       └── services/
│           └── logService.js   # Servico centralizado de auditoria
│
├── frontend/                   # Interface HTML/CSS/JS (sem dados sensiveis)
│   ├── index.html              # Pagina de login
│   ├── app.html                # Aplicacao principal (requer JWT)
│   ├── css/
│   │   └── styles.css          # Estilos
│   └── js/
│       ├── api.js              # Camada de comunicacao com a API
│       ├── auth.js             # Gerenciamento de token JWT no frontend
│       └── app.js              # Logica da aplicacao
│
└── README.md
```

## Camadas de Seguranca Implementadas

### Backend
- **JWT (JSON Web Token)**: Cada requisicao autenticada exige token valido com expiracao de 8h
- **RBAC** (Role-Based Access Control): Perfis admin / gestor / analista / auditor / viewer com permissoes distintas
- **Isolamento por Filial**: Usuarios so enxergam dados da propria filial
- **Bcrypt**: Senhas armazenadas com hash bcrypt (custo 12) - NUNCA em texto plano
- **Rate Limiting**: 100 req/15min global; 10 tentativas de login/15min
- **Bloqueio de conta**: Apos 5 tentativas falhas, conta bloqueada por 15 minutos
- **Helmet.js**: Headers HTTP de seguranca (CSP, HSTS, X-Frame-Options, etc.)
- **CORS restrito**: Apenas origens autorizadas via variavel de ambiente
- **Validacao de entrada**: express-validator em todas as rotas
- **Logs de auditoria**: Tabela imutavel (sem UPDATE/DELETE) com registro de todas as acoes
- **Variaveis de ambiente**: Zero credenciais no codigo - tudo via .env

### Banco de Dados (PostgreSQL)
- **Senhas nunca armazenadas**: Apenas hashes bcrypt
- **Tabela de logs imutavel**: REVOKE UPDATE, DELETE aplicado
- **UUID como IDs**: Nao expoe sequencia de registros
- **Indices**: Performance e seguranca em queries criticas
- **Constraint de perfis**: Validacao a nivel de banco

### Frontend
- **Zero dados sensiveis**: Nenhuma senha, credencial ou dado de negocio no HTML/JS
- **Token armazenado de forma segura**: sessionStorage (nao localStorage)
- **Verificacao de autenticacao**: Toda rota verifica token antes de renderizar
- **Comunicacao exclusiva via API**: Todos os dados vem do backend autenticado

## Como Configurar

### 1. Banco de Dados
```sql
createdb compliance_hub
psql compliance_hub < backend/src/database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edite o .env com suas credenciais reais
npm install
npm run seed    # Cria usuario admin inicial
npm run dev     # Desenvolvimento
npm start       # Producao
```

### 3. Frontend
Sirva os arquivos da pasta `frontend/` com qualquer servidor web (Nginx, Apache, etc.)

## Perfis de Acesso

| Perfil   | Acesso                                            |
|----------|---------------------------------------------------|
| admin    | Acesso total, todas as filiais                    |
| gestor   | Acesso a propria filial, sem gestao de usuarios   |
| analista | Leitura e edicao de tarefas e denuncias           |
| auditor  | Somente leitura, acesso a logs                    |
| viewer   | Somente leitura basica                            |

## Variaveis de Ambiente Necessarias

Veja `backend/.env.example` para a lista completa.  
**NUNCA commite o arquivo `.env` no repositorio.**
