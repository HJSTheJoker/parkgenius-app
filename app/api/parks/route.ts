import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch parks from database
    const { data: parks, error, count } = await supabase
      .from('parks')
      .select(`
        *,
        attractions(count)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('name');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch parks',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Transform data to match API response format
    const transformedParks = parks.map(park => ({
      id: park.id,
      name: park.name,
      location: {
        lat: park.location?.x || 0,
        lng: park.location?.y || 0,
        address: park.metadata?.address || '',
        timezone: park.metadata?.timezone || 'UTC',
      },
      operating_hours: park.operating_hours,
      metadata: {
        description: park.metadata?.description || '',
        website: park.metadata?.website || '',
        phone: park.metadata?.phone || '',
        image_url: park.metadata?.image_url || '',
        features: park.metadata?.features || [],
      },
      stats: {
        total_attractions: park.attractions?.[0]?.count || 0,
        avg_visit_duration: 8,
        popularity_score: 85,
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedParks,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        request_id: crypto.randomUUID(),
      },
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: count || 0,
        has_more: (offset + limit) < (count || 0),
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.name || !body.location || !body.operating_hours) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: {
              required: ['id', 'name', 'location', 'operating_hours'],
            },
          },
        },
        { status: 400 }
      );
    }

    // Create park in database
    const { data, error } = await supabase
      .from('parks')
      .insert({
        id: body.id,
        name: body.name,
        location: `POINT(${body.location.lng} ${body.location.lat})`,
        operating_hours: body.operating_hours,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DUPLICATE_PARK',
              message: 'A park with this ID already exists',
            },
          },
          { status: 409 }
        );
      }

      console.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create park',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          request_id: crypto.randomUUID(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        meta: {
          timestamp: new Date().toISOString(),
          request_id: crypto.randomUUID(),
        },
      },
      { status: 500 }
    );
  }
}