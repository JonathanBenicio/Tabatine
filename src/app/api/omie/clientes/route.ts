import { NextResponse } from 'next/server';
import axios from 'axios';
import { apiError } from '@/utils/api-error';

const OMIE_API_URL = process.env.OMIE_API_URL || 'https://app.omie.com.br/api/v1/';
const OMIE_Endpoint = `${OMIE_API_URL}geral/clientes/`;
const APP_KEY = process.env.APP_KEY;
const APP_SECRET = process.env.APP_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!APP_KEY || !APP_SECRET) {
      return apiError(new Error('Missing Omie credentials'), 'POST /api/omie/clientes', 500);
    }

    // Inject credentials into the request body
    const omiePayload = {
      ...body,
      app_key: APP_KEY,
      app_secret: APP_SECRET,
    };

    const response = await axios.post(OMIE_Endpoint, omiePayload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    let status = 500;
    if (axios.isAxiosError(error)) {
      status = error.response?.status || 500;
    }
    return apiError(error, 'POST /api/omie/clientes', status);
  }
}
