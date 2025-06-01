import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parkId = searchParams.get('park_id');
    const attractionId = searchParams.get('attraction_id');
    const live = searchParams.get('live') === 'true';
    const hours = parseInt(searchParams.get('hours') || '24');

    let query = supabase
      .from('wait_times')
      .select(`
        *,
        attractions (
          id,
          name,
          park_id,
          current_status
        )
      `);

    // Filter by park if specified
    if (parkId) {
      query = query.eq('attractions.park_id', parkId);
    }

    // Filter by attraction if specified
    if (attractionId) {
      query = query.eq('attraction_id', attractionId);
    }

    // Get time range
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - hours);

    query = query
      .gte('timestamp', timeThreshold.toISOString())
      .order('timestamp', { ascending: false });

    // If live is true, get only the latest wait time for each attraction
    if (live) {
      // Use a more complex query to get latest wait time per attraction
      const { data: latestTimes, error } = await supabase.rpc(
        'get_latest_wait_times',
        { park_id_param: parkId }
      );

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Failed to fetch wait times',
              details: error,
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: latestTimes || [],
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          request_id: crypto.randomUUID(),
          live: true,
        },
      });
    }

    // Get historical wait times
    const { data: waitTimes, error } = await query.limit(1000);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch wait times',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Transform data
    const transformedData = waitTimes.map(waitTime => ({
      id: waitTime.id,
      attraction_id: waitTime.attraction_id,
      attraction_name: waitTime.attractions?.name,
      park_id: waitTime.attractions?.park_id,
      wait_minutes: waitTime.wait_minutes,
      timestamp: waitTime.timestamp,
      confidence: waitTime.confidence,
      factors: waitTime.factors,
      trend: waitTime.trend,
      status: waitTime.attractions?.current_status,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        request_id: crypto.randomUUID(),
        hours_included: hours,
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
    if (!body.attraction_id || typeof body.wait_minutes !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
            details: {
              required: ['attraction_id', 'wait_minutes'],
            },
          },
        },
        { status: 400 }
      );
    }

    // Validate wait time range
    if (body.wait_minutes < 0 || body.wait_minutes > 300) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Wait time must be between 0 and 300 minutes',
          },
        },
        { status: 400 }
      );
    }

    // Insert wait time record
    const { data, error } = await supabase
      .from('wait_times')
      .insert({
        attraction_id: body.attraction_id,
        wait_minutes: body.wait_minutes,
        confidence: body.confidence || 1.0,
        factors: body.factors || [],
        trend: body.trend || 'stable',
        timestamp: body.timestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to record wait time',
            details: error,
          },
        },
        { status: 500 }
      );
    }

    // Update the attraction's current wait time
    await supabase
      .from('attractions')
      .update({
        wait_time: body.wait_minutes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.attraction_id);

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