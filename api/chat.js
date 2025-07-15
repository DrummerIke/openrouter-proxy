export default async function handler(req, res) {
  // Разрешаем CORS для запросов с любых источников (например, Google Sites)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обработка preflight-запроса (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Принимаем только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Получаем API ключ из переменных окружения
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Формируем тело запроса к OpenRouter с фиксированной моделью
    const body = {
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      messages: req.body.messages,
      temperature: req.body.temperature || 0.7,
    };

    // Лог для отладки (можно убрать в продакшене)
    console.log('Sending request to OpenRouter:', JSON.stringify(body, null, 2));

    // Отправляем запрос к OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Лог ответа от OpenRouter (можно убрать)
    console.log('Response from OpenRouter:', data);

    // Возвращаем клиенту ответ с того же статуса, что и от OpenRouter
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}
