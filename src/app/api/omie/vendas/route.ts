import { NextResponse } from 'next/server';
import axios from 'axios';

const OMIE_API_URL = process.env.OMIE_API_URL || 'https://app.omie.com.br/api/v1/';
const OMIE_Endpoint = `${OMIE_API_URL}produtos/pedido/`;
const APP_KEY = process.env.APP_KEY;
const APP_SECRET = process.env.APP_SECRET;

interface CacheEntry {
  timestamp: number;
  data: any;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!APP_KEY || !APP_SECRET) {
      return NextResponse.json(
        { error: 'Missing Omie credentials in server environment' },
        { status: 500 }
      );
    }

    // Check Cache
    const cacheKey = JSON.stringify(body);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

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

    // Save to Cache
    cache.set(cacheKey, { timestamp: Date.now(), data: response.data });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error proxying Omie request (Pedidos):', error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.faultstring || 'Internal Server Error', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
