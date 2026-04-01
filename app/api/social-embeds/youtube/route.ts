import { NextResponse } from "next/server"

const YOUTUBE_CHANNEL_HANDLE = "lembagaindustrigetahsabaho4672"
const CACHE_MAX_AGE = 86400 // 24 hours

/** Resolve @handle to channel ID by fetching the channel page and parsing HTML */
async function getChannelIdFromHandle(handle: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/@${handle}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LIGS/1.0)" },
      next: { revalidate: CACHE_MAX_AGE },
    })
    const html = await res.text()
    const match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/) ?? html.match(/UC[a-zA-Z0-9_-]{22}/)
    return match ? (match[1] ?? match[0]) : null
  } catch {
    return null
  }
}

/** Get uploads playlist ID: UC... -> UU... */
function toUploadsPlaylistId(channelId: string): string {
  return "UU" + channelId.slice(2)
}

export async function GET() {
  try {
    const channelId = await getChannelIdFromHandle(YOUTUBE_CHANNEL_HANDLE)
    if (!channelId) {
      return NextResponse.json(
        { error: "Could not resolve channel ID" },
        { status: 502 }
      )
    }
    const playlistId = toUploadsPlaylistId(channelId)
    const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`
    return NextResponse.json({ channelId, playlistId, embedUrl })
  } catch (e) {
    console.error("[youtube-embed]", e)
    return NextResponse.json(
      { error: "Failed to resolve YouTube channel" },
      { status: 500 }
    )
  }
}
