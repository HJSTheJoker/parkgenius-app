import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase';

interface RouteParams {
  params: {
    parkId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { parkId } = params;

    // Fetch park with attractions
    const { data: park, error: parkError } = await supabase
      .from('parks')
      .select(`
        *,
        attractions (
          id,
          name,
          type,
          category,
          location,
          details,
          accessibility,
          current_status,
          wait_time,
          image_urls
        )
      `)
      .eq('id', parkId)
      .single();

    if (parkError) {
      if (parkError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PARK_NOT_FOUND',
              message: `Park with ID '${parkId}' not found`,
            },
          },
          { status: 404 }
        );
      }

      console.error('Database error:', parkError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch park details',
            details: parkError,
          },
        },
        { status: 500 }
      );
    }

    // Get latest weather data for the park
    const { data: weatherData } = await supabase
      .from('weather_data')
      .select('*')
      .eq('park_id', parkId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Transform data to match API response format
    const transformedPark = {
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
        total_attractions: park.attractions?.length || 0,
        avg_visit_duration: 8,
        popularity_score: 85,
      },
      attractions: park.attractions?.map((attraction: any) => ({
        id: attraction.id,
        park_id: parkId,
        name: attraction.name,
        type: attraction.type,
        category: attraction.category,
        location: {
          lat: attraction.location?.x || 0,
          lng: attraction.location?.y || 0,
          area: attraction.location?.area || '',
        },
        details: attraction.details,
        accessibility: attraction.accessibility,
        current_status: attraction.current_status,
        wait_time: attraction.wait_time,
        image_urls: attraction.image_urls || [],
      })) || [],
      weather: weatherData ? {
        current: weatherData.current_conditions,
        forecast: weatherData.forecast,
        alerts: weatherData.alerts,
        impact: weatherData.impact,
        last_updated: weatherData.timestamp,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: transformedPark,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        request_id: crypto.randomUUID(),
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { parkId } = params;
    const body = await request.json();

    // Update park in database
    const { data, error } = await supabase
      .from('parks')
      .update({
        name: body.name,
        location: body.location ? `POINT(${body.location.lng} ${body.location.lat})` : undefined,
        operating_hours: body.operating_hours,
        metadata: body.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parkId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PARK_NOT_FOUND',
              message: `Park with ID '${parkId}' not found`,
            },
          },
          { status: 404 }
        );
      }

      console.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update park',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        request_id: crypto.randomUUID(),
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { parkId } = params;

    // Delete park from database (cascades to attractions)
    const { error } = await supabase
      .from('parks')
      .delete()
      .eq('id', parkId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to delete park',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        request_id: crypto.randomUUID(),
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