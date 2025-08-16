import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import RelativeTime from '@yaireo/relative-time';

const relativeTime = new RelativeTime();

interface SongData {
  song: string | null;
  artist: string | null;
  image: string | null;
  timestamp: number;
  listening: boolean;
}

const fetchNowPlaying = async (): Promise<SongData | null> => {
  try {
    const res = await fetch('/api/status?' + Date.now());
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};

const CurrentSongComponent = () => {
  const [songData, setSongData] = useState<SongData | null>(null);

  useEffect(() => {
    const update = async () => {
      const data = await fetchNowPlaying();
      if (data) setSongData(data);
    };

    update(); // Fetch immediately
    const interval = setInterval(update, 10000); // Every 10s
    return () => clearInterval(interval);
  }, []);


  return (
    <div>
      <h3 class="no-mt">What's playing?</h3>

      <div
        class={`listening-data ${songData?.image ? 'with-image' : 'no-image'}`}
        style={songData?.image ? { '--bg-image': `url(${songData.image})` } : {}}
      >
        {songData?.image && (
  <img
    data-song-image
    width={96}
    height={96}
    src={songData.image}
    alt={`${songData.song} by ${songData.artist}`}
/>
)}

        <div class="song-info">
          <p class="song-title" title={songData?.song || 'Unknown'}>{songData?.song ?? 'Loading...'}</p>
          <p class="song-artists">{songData?.artist ?? ''}</p>
        </div>

        <div class="listening-info">
          <div class={`indicator ${songData?.listening ? 'listening' : ''}`} />

          <span data-listening-status>
            {songData
              ? songData.listening
                ? 'Currently listening'
                : `Listened ${relativeTime.from(
                    new Date(Number(songData.timestamp) * 1000)
                  )}`
              : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CurrentSongComponent;
