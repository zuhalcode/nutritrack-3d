import { NextRequest, NextResponse } from 'next/server';
import { usdaProvider } from '@/features/nutrition/provider/usda-adapter';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        results: [],
        providerMode: usdaProvider.hasApiKey() ? 'live_usda' : 'verified_dataset',
      });
    }

    const { results, providerMode, message } = await usdaProvider.searchFoods(query);

    return NextResponse.json({
      results,
      providerMode,
      message,
      query,
    });
  } catch (error: unknown) {
    console.error('Error in /api/foods/search:', error);
    return NextResponse.json(
      {
        error: 'Failed to search nutrition database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
