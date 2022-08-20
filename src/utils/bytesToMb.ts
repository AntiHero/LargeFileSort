export default function bytesToMb(size: number): number {
  return Math.round(size / 1024 ** 2);
}
