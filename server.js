require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

// SEUS DADOS FORNECIDOS
const TOKEN = '7676057131:AAFaECPu6qGI37VapXoOi8-zVxOoUXykK9U';
const API_KEY = 'PRe'; // Crie uma chave secreta

// 🧠 Mapeia cada contrato para um grupo do Telegram
const contratosToChatId = {
  "117/2023 - Esporte Maricá": "-4765938730",
  "267/2023 - Predial Maricá": "-1002652489871",
  "222/2023 - Escolas Maricá": "-4628790026",
  "10/2021 - Eletricá Predial": "-4653709864"
};

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());

bot.on('message', (msg) => {
  console.log('💬 Mensagem recebida em:', msg.chat.title);
  console.log('🆔 chatId:', msg.chat.id);
});
// Rota para receber pedidos do React
app.post('/enviar-pedido', (req, res) => {
  if (req.headers['authorization'] !== API_KEY) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }

  const { contrato, encarregado, obra, solicitante, materiais } = req.body;
  const contratoLimpo = contrato.trim();
  const chatId = contratosToChatId[contratoLimpo];

;
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
    .catch(err => res.status(500).json({ error: err.message }));
});

const PORT = 3001;
app.listen(PORT, () => console.log(`✅ Bot rodando na porta ${PORT}`));
