const calculateSplits = (size: number, ram: number): number =>
  Math.floor(size / ram) + 1;

export default calculateSplits;
