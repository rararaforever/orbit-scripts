function thigns(url, title) {
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (vimeoMatch) {
    return {
      url: url || "",
      title: title || "",
      id: vimeoMatch[1],
      thumbnail: getVimeoThumbnail(url), // Vimeo requires an API/oEmbed call
    };
  }
}
async function getVimeoThumbnail(url) {
  const response = await fetch(
    `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
  );
  if (!response.ok) return null;

  const data = await response.json();
  return data.thumbnail_url;
  //   const data = await res.json();
  //   return data.thumbnail_url;
}
bing = thigns("https://vimeo.com/1050811597/cafdb8d628?share=copy&fl=sv&fe=ci");
console.log(bing.thumbnail);

async function getVideoThumbnail(url) {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/,
  );

  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  // Vimeo
  if (url.includes("vimeo.com")) {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
    );

    if (!response.ok) return null;

    const data = await response.json();
    return data.thumbnail_url;
  }

  return null;
}

// Usage
// const thumbnail = await getVideoThumbnail(
//   "https://vimeo.com/1050811597/cafdb8d628?share=copy&fl=sv&fe=ci",
// );

// console.log(thumbnail);
