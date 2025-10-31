import type { NextApiRequest, NextApiResponse } from 'next';

type GitHubUser = {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
};

type ApiResponse = {
  success: boolean;
  data?: GitHubUser;
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

    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ success: false, error: 'Username parameter is required' });
    }

    // Get GitHub token from environment variable
    const githubToken = process.env.GITHUB_TOKEN;

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // Add authorization header if token is available
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // Fetch from GitHub API
    const response = await fetch(
      `https://api.github.com/users/${username}`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          success: false,
          error: 'GitHub user not found'
        });
      }
      console.error('GitHub API error:', response.statusText);
      return res.status(response.status).json({
        success: false,
        error: `GitHub API error: ${response.statusText}`
      });
    }

    const data: GitHubUser = await response.json();

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in GitHub profile API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
