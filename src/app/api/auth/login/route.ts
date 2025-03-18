import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  console.log('POST request received'); // Debugging log
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log('Backend URL:', backendUrl); // Debugging log

    const body = await request.json(); // Parse the request body
    console.log('Request body:', body); // Debugging log

    const response = await axios.post(`${backendUrl}/api/login`, body);
    console.log('Backend response:', response.data); // Debugging log

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log('Error:', error); // Debugging log
    console.log('Error response:', error.response?.data); // Debugging log
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: error.response?.status || 500 }
    );
  }
}