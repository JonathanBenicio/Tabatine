import { NextResponse } from 'next/server';
import axios from 'axios';
import { apiError } from '@/utils/api-error';

const OMIE_API_URL = process.env.OMIE_API_URL || 'https://app.omie.com.br/api/v1/';
const OMIE_Endpoint = `${OMIE_API_URL}geral/produtos/`;
const APP_KEY = process.env.APP_KEY;
const APP_SECRET = process.env.APP_SECRET;

interface CacheEntry {
  timestamp: number;
  data: unknown;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!APP_KEY || !APP_SECRET) {
      return apiError(null, 'POST /api/omie/produtos (Missing credentials)', 500);
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
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return apiError(error, 'POST /api/omie/produtos', error.response?.status || 500);
    }
    return apiError(error, 'POST /api/omie/produtos');
  }
}
