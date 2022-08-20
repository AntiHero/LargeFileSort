const calculateSplits = (size: number, ram: number): number =>
  Math.floor(size / ram) * 5;

export default calculateSplits;
