const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

const app = express();

// 🔐 Configurações diretas (uso interno)
const TOKEN = '7676057131:AAELLtx8nzc4F1_PbMGxE-7R3sCvM1lufdM';
const API_KEY = 'PRe';

const contratosToChatId = {
  "117/2023 - Esporte Maricá": "-4765938730",
  "267/2023 - Predial Maricá": "-1002652489871",
  "222/2023 - Escolas Maricá": "-4628790026",
  "10/2021 - Eletricá Predial": "-4653709864"
};

// 🤖 Inicializa o bot do Telegram
const bot = new TelegramBot(TOKEN, { polling: true });

// 🌐 CORS com suporte a preflight (OPTIONS)
const corsOptions = {
  origin: 'https://pedidos-marica.vercel.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Suporte ao preflight

// 📦 Middleware para JSON
app.use(express.json());

// 🧪 Loga mensagens recebidas no bot
bot.on('message', (msg) => {
  console.log('💬 Mensagem recebida em:', msg.chat.title);
  console.log('🆔 chatId:', msg.chat.id);
});

// 📬 Endpoint para receber pedidos
app.post('/enviar-pedido', (req, res) => {
  if (req.headers['authorization'] !== API_KEY) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }

  const { contrato, encarregado, obra, solicitante, materiais } = req.body;
  const contratoLimpo = contrato.trim();
  const chatId = contratosToChatId[contratoLimpo];

  console.log('📝 Contrato recebido:', contrato);
  console.log('📨 Enviando para o grupo (chatId):', chatId);

  if (!chatId) {
    return res.status(400).json({ error: 'Contrato não encontrado ou sem grupo associado' });
  }

  const mensagem = `🏗️ *NOVO PEDIDO - PERFIL-X* \n\n` +
    `📄 *Contrato:* ${contrato}\n` +
    `👷 *Encarregado:* ${encarregado}\n` +
    `🏭 *Obra:* ${obra}\n` +
    `📋 *Solicitante:* ${solicitante}\n\n` +
    `📦 *Materiais:*\n${materiais.map(item =>
      `▸ ${item.nome}: ${item.quantidade} ${item.unidade || 'un'}`
    ).join('\n')}`;

  bot.sendMessage(chatId, mensagem, { parse_mode: 'Markdown' })
    .then(() => res.json({ success: true }))
    .catch(err => {
      console.error('❌ Erro ao enviar mensagem:', err);
      res.status(500).json({ error: err.message });
    });
});

// 🚀 Inicia servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Bot rodando na porta ${PORT}`);
});
