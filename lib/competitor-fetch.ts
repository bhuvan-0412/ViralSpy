export interface CompetitorPost {
  title: string
  views: string
  engagement: string
  url: string
}

export async function fetchCompetitorPosts(
  trendName: string,
  platform: string
): Promise<CompetitorPost[]> {
  try {
    if (platform === 'YOUTUBE') {
      const apiKey = process.env.YOUTUBE_API_KEY
      if (!apiKey) return []

      const query = encodeURIComponent(trendName)
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&order=viewCount&maxResults=5&key=${apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) return []
      const data = await res.json()

      return (data.items || []).map((item: any) => ({
        title: item.snippet.title,
        views: 'Top performing',
        engagement: item.snippet.channelTitle,
        url: `https://youtube.com/watch?v=${item.id.videoId}`,
      }))
    }

    if (platform === 'INSTAGRAM') {
      const apiKey = process.env.RAPIDAPI_INSTAGRAM_KEY
      if (!apiKey) return []

      const query = trendName.replace(/\s+/g, '').toLowerCase()
      const res = await fetch(
        `https://instagram-scraper-api2.p.rapidapi.com/v1/hashtag?hashtag=${query}`,
        {
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
          },
          signal: AbortSignal.timeout(5000),
        }
      )
      if (!res.ok) return []
      const data = await res.json()

      return (data.data?.items || []).slice(0, 5).map((item: any) => ({
        title: item.caption?.text?.slice(0, 80) || 'Instagram post',
        views: `${item.play_count || item.like_count || 0} interactions`,
        engagement: `${item.comment_count || 0} comments`,
        url: `https://instagram.com/p/${item.code}`,
      }))
    }

    return []
  } catch {
    return []
  }
}
