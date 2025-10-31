import type { NextApiRequest, NextApiResponse } from 'next';

type ApiResponse = {
  success: boolean;
  holidays?: any[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { year, country = 'TH' } = req.query;

    if (!year) {
      return res.status(400).json({ success: false, error: 'Year parameter is required' });
    }

    // Get API key from environment variable
    const apiKey = process.env.HOLIDAY_API_KEY;

    if (!apiKey) {
      console.warn('Holiday API key not configured');
      return res.status(200).json({ success: true, holidays: [] });
    }

    // Fetch from Holiday API
    const response = await fetch(
      `https://holidayapi.com/v1/holidays?key=${apiKey}&country=${country}&year=${year}`
    );

    if (!response.ok) {
      console.error('Holiday API error:', response.statusText);
      return res.status(response.status).json({
        success: false,
        error: `Holiday API error: ${response.statusText}`
      });
    }

    const data = await response.json();

    if (data.status === 200 && data.holidays) {
      res.status(200).json({ success: true, holidays: data.holidays });
    } else {
      res.status(200).json({ success: true, holidays: [] });
    }
  } catch (error) {
    console.error('Error in holidays API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
