export default async function handler(req, res) {
    
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }
  
    const { mensagem } = req.body;
  
    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem não enviada' });
    }
  
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
  
    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: mensagem,
          parse_mode: 'Markdown'
        })
      });
  
      if (!telegramRes.ok) {
        throw new Error('Erro ao enviar mensagem');
      }
  
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
  