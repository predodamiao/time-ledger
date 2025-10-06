# Time Ledger

Uma aplicação moderna para gerenciamento de tarefas e acompanhamento de tempo pessoal, desenvolvida com Next.js e TypeScript.

## 🚀 Funcionalidades

- ✅ **CRUD de Tarefas**: Criar, editar, deletar e marcar tarefas como concluídas
- 📅 **Navegação por Dias**: Navegar entre diferentes dias e visualizar tarefas organizadas por data
- ⏱️ **Múltiplos Cronômetros**: Adicionar vários timers para cada tarefa com descrições personalizadas
- 🏷️ **Sistema de Tags**: Tags categorizadas com formato `type:value` e cores diferentes
- 🔐 **Login Simples**: Sistema de login com usuário de rede
- 💾 **Banco SQLite**: Armazenamento local simples e eficiente

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: SQLite com SQL puro (sqlite3)
- **Autenticação**: Sistema simples com usuário de rede
- **UI**: Lucide React (ícones), Tailwind CSS (estilização)

## 📋 Pré-requisitos

- Node.js 18+

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd time-ledger
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env.local
   ```
   
   Edite o arquivo `.env.local` com suas configurações:
   ```env
   # Banco de dados SQLite (opcional)
   DATABASE_URL="./time-ledger.db"
   ```

4. **Inicialize o banco de dados**
   ```bash
   # Execute o script para criar o banco SQLite
   npm run db:init
   ```

5. **Execute a aplicação**
   ```bash
   npm run dev
   ```

   Acesse: http://localhost:3000

## 🔐 Sistema de Login

O sistema utiliza um login simples onde você informa seu usuário de rede:

1. **Primeiro acesso**: Digite seu usuário de rede na tela de login
2. **Nome opcional**: Você pode informar seu nome completo para exibição
3. **Persistência**: O sistema salva sua sessão no navegador
4. **Segurança**: Cada usuário só vê suas próprias tarefas

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **User**: Usuários autenticados
- **Task**: Tarefas do usuário
- **Timer**: Cronômetros associados às tarefas
- **TaskTag**: Tags das tarefas
- **Account/Session**: Dados de autenticação (NextAuth)

### Relacionamentos

- User → Tasks (1:N)
- Task → Timers (1:N)
- Task → TaskTags (1:N)

## 🎨 Sistema de Tags

As tags seguem o formato `type:value` com cores predefinidas:

- **work**: Trabalho (azul)
- **personal**: Pessoal (verde)
- **study**: Estudo (amarelo)
- **health**: Saúde (vermelho)
- **finance**: Financeiro (roxo)
- **project**: Projeto (rosa)
- **meeting**: Reunião (ciano)

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm run start

# Banco de dados
npm run db:init    # Inicializar banco SQLite

# Linting
npm run lint
```

## 📱 Interface

A aplicação possui uma interface moderna e responsiva com:

- **Dashboard principal**: Navegação por dias e lista de tarefas
- **Formulário de tarefas**: Modal para criar/editar tarefas
- **Cronômetros**: Interface intuitiva para controlar timers
- **Tags visuais**: Sistema de cores para categorização
- **Navegação fluida**: Botões para navegar entre dias

## 🔮 Próximas Funcionalidades

- [ ] Relatórios de tempo por período
- [ ] Integração com Azure DevOps
- [ ] Exportação de dados
- [ ] Notificações e lembretes
- [ ] Temas personalizáveis
- [ ] API pública para integrações

## 📄 Licença

ISC License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abrir um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
