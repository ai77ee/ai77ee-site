import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import RelativeTime from '@yaireo/relative-time';
const relativeTime = new RelativeTime();

interface SongData {
  song: string | null;
  artist: string | null;
  image: string | null;
  timestamp: number;
  listening: boolean;
}

const CurrentSongComponent = () => {
  const [isPlaceholder, setIsPlaceholder] = useState(true);
  const [songData, setSongData] = useState<SongData>({
    song: null,
    artist: null,
    image: null,
    timestamp: 0,
    listening: false,
  });

  const songImageRef = useRef<HTMLImageElement>(null);
  const songTitleRef = useRef<HTMLParagraphElement>(null);
  const songArtistsRef = useRef<HTMLParagraphElement>(null);
  const listeningStatusRef = useRef<HTMLSpanElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/status?${new Date().getTime()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setSongData({
        song: data.song,
        artist: data.artist,
        image: data.image,
        timestamp: data.timestamp,
        listening: data.listening,
      });
      setIsPlaceholder(false);

      // Update the DOM elements
      if (songImageRef.current) {
        songImageRef.current.src = data.image;
        songImageRef.current.alt = `${data.song} by ${data.artist}`;
      }

      if (songTitleRef.current) {
        songTitleRef.current.textContent = data.song || 'Unknown';
      }

      if (songArtistsRef.current) {
        songArtistsRef.current.textContent = data.artist || 'Unknown';
      }

      if (indicatorRef.current) {
        if (data.listening) {
          indicatorRef.current.classList.add('listening');
        } else {
          indicatorRef.current.classList.remove('listening');
        }
      }

      if (listeningStatusRef.current) {
        listeningStatusRef.current.textContent = data.listening
          ? 'Currently listening'
          : `Listened ${relativeTime.from(new Date(Number(data.timestamp) * 1000))}`;
      }
    } catch (error) {
      console.error('Failed to fetch now-playing data:', error);
      setIsPlaceholder(true);
    }
  };

  useEffect(() => {
    // Fetch data immediately when the component mounts
    fetchData();

    // Set up an interval to fetch data every 10 seconds
    const interval = setInterval(fetchData, 10000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3 class="no-mt">What's playing?</h3>
      {isPlaceholder ? (
        <div class="listening-data">
          <div class="cover-placeholder">
            <span>?</span>
          </div>
          <div class="song-info">
            <p class="song-title" ref={songTitleRef}>Loading...</p>
            <p class="song-artists" ref={songArtistsRef}>Loading...</p>
          </div>
          <div class="listening-info">
            <div class="indicator" ref={indicatorRef} />
            <span ref={listeningStatusRef}>Loading...</span>
          </div>
        </div>
      ) : (
        <div class="listening-data">
          {songData.image && (
            <img
              data-song-image
              width={96}
              height={96}
              src={songData.image}
              alt={`${songData.song} by ${songData.artist}`}
              ref={songImageRef}
            />
          )}
          <div class="song-info">
            <p class="song-title" ref={songTitleRef}>{songData.song}</p>
            <p class="song-artists" ref={songArtistsRef}>{songData.artist}</p>
          </div>
          <div class="listening-info">
            <div
              class="indicator"
              className={songData.listening ? 'indicator listening' : 'indicator'}
              ref={indicatorRef}
            />
            <span data-listening-status ref={listeningStatusRef}>
              {songData.listening
                ? 'Currently Listening'
                : `Listened ${relativeTime.from(new Date(Number(songData.timestamp) * 1000))}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentSongComponent;