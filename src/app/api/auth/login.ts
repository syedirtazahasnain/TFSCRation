import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  if (!backendUrl) {
    console.error('BACKEND_URL is not defined');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const response = await fetch(`${backendUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text}`);
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.message || 'Login failed'
      });
    }

    return res.status(response.status).json(data);
    
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}