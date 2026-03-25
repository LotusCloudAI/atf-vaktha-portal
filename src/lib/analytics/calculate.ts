export function calculateWPM(words: number, seconds: number) {
  return Math.round((words / seconds) * 60);
}
