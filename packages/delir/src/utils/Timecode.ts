export const frameToTimeCode = (frame: number, frameRate: number) => {
  const seconds = frame / frameRate
  const timeFrame = (frame % frameRate).toString().padStart(2, '0')
  const timeSeconds = (seconds % 60 | 0).toString().padStart(2, '0')
  const timeMinutes = ((seconds / 60) % 60 | 0).toString().padStart(2, '0')
  const timeHour = ((seconds / 60 / 60) | 0).toString().padStart(2, '0')

  return `${timeHour}:${timeMinutes}:${timeSeconds}:${timeFrame}`
}
