import { MomentumStatusType } from '../types';

export function computeVelocityScore(
  postsPerHour: number,
  avgPosts24h: number
): { score: number; status: MomentumStatusType } {
  if (avgPosts24h === 0 || !avgPosts24h) return { score: 0, status: 'DEAD' };
  
  const score = (postsPerHour / avgPosts24h) * 100;
  let status: MomentumStatusType;
  
  if (score >= 300) {
    status = 'EXPLODING';
  } else if (score >= 150) {
    status = 'RISING';
  } else if (score >= 50) {
    status = 'PEAKED';
  } else {
    status = 'DEAD';
  }
  
  // Return score rounded to 2 decimal places
  return { score: Math.round(score * 100) / 100, status };
}
