// AI Disclosure: This file may partially contain code generated by models such as GitHub Copiolot or ChatGPT
import { execute } from '../../../utils/executeDocker';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language, stdin = '' } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  if (!language) {
    return res.status(400).json({ error: 'Language is required' });
  }
  if (!['python', 'javascript', 'java', 'c', 'cpp'].includes(language)) {
    return res.status(400).json({ error: 'Language not supported' });
  }

  try {
    const output = await execute(code, language, stdin);
    return res.status(200).json({ output });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}