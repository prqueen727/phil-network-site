/** JPEG/PNG/WebP 헤더만 읽어 width/height를 구한다(관리자 업로드는 사진 파일뿐이라 이 3종이면 충분 — 취약점 있는 범용 파서 라이브러리 대신 최소 구현). */
export function readImageDimensions(buf: Buffer): { width: number; height: number } | null {
  // PNG: 8바이트 시그니처 + IHDR 청크(width,height는 offset 16,20 빅엔디안 4바이트)
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: SOF 마커(0xC0~0xCF, 제외 0xC4/0xC8/0xCC)까지 세그먼트를 순회
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) { offset++; continue; }
      const marker = buf[offset + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      const segmentLength = buf.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    }
    return null;
  }
  // WebP (VP8 단순 포맷만): RIFF....WEBPVP8
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const format = buf.toString("ascii", 12, 16);
    if (format === "VP8 ") {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (format === "VP8X") {
      const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { width, height };
    }
  }
  return null;
}
