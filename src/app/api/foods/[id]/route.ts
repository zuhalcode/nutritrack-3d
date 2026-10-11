import { NextRequest, NextResponse } from 'next/server';
import { usdaProvider } from '@/features/nutrition/provider/usda-adapter';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'Food ID is required' }, { status: 400 });
    }

    const { food, providerMode, message } = await usdaProvider.getFoodDetail(id);

    if (!food) {
      return NextResponse.json(
        { error: `Food with ID ${id} not found`, providerMode, message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      food,
      providerMode,
      message,
    });
  } catch (error: unknown) {
    console.error('Error in /api/foods/[id]:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch food details',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
