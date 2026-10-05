import { Review, ReviewStats } from "../schemas/review";

/**
 * Calculates review analytics: average rating, total count, star distributions, and percentages.
 */
export function calculateReviewStats(rawReviews: Review[]): ReviewStats {
  const reviews = rawReviews.filter((r) => r.permission_to_publish !== false);
  const total = reviews.length;

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  if (total === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
      distribution,
      percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  let ratingSum = 0;
  for (const r of reviews) {
    const star = Math.min(Math.max(Math.round(r.ratingValue), 1), 5) as 1 | 2 | 3 | 4 | 5;
    distribution[star] += 1;
    ratingSum += r.ratingValue;
  }

  const rawAvg = ratingSum / total;
  const averageRating = Math.round(rawAvg * 10) / 10;

  const percentages = {
    5: Math.round((distribution[5] / total) * 100),
    4: Math.round((distribution[4] / total) * 100),
    3: Math.round((distribution[3] / total) * 100),
    2: Math.round((distribution[2] / total) * 100),
    1: Math.round((distribution[1] / total) * 100),
  };

  return {
    averageRating,
    reviewCount: total,
    distribution,
    percentages,
  };
}
