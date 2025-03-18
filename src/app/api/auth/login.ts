
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('POST request received');
  if (req.method === 'POST') {
    console.log('post');
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      console.log('Backend URL:', backendUrl); // Log the backend URL
      const response = await axios.post(`${backendUrl}/api/login`, req.body);
      res.status(200).json(response.data);
    } catch (error: any) {
        console.log('ck error');
      res.status(error.response?.status || 500).json(error.response?.data || { message: 'An error occurred' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}


