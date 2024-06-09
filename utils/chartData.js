import mongoose from 'mongoose';
import Like from '../models/like.model.js';
import Follower from '../models/follower.model.js';

// Utility function to get the start and end dates of the past 2 months partitioned by weeks
function getWeeklyPartitions(numberOfWeeks = 8) {
  const today = new Date();
  const weeks = [];
  // Calculate start date for the last 7 weeks (considering today)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1 - numberOfWeeks * 7);

  while (startOfWeek < today) {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
    
        weeks.push({ start: new Date(startOfWeek), end: new Date(endOfWeek) });
    
        startOfWeek.setDate(startOfWeek.getDate() + 7);
      }
  return weeks;
}

// Function to get likes and followers data partitioned by week
async function getWeeklyData(authorId) {
  const weeks = getWeeklyPartitions();

  const likesData = [];
  const followersData = [];
  for (const week of weeks) {
    const likesCount = await Like.countDocuments({
      author: mongoose.Types.ObjectId.createFromHexString(authorId),
      createdAt: { $gt: week.start, $lte: week.end },
    });

    const followersCount = await Follower.countDocuments({
      author: mongoose.Types.ObjectId.createFromHexString(authorId),
      createdAt: { $gte: week.start, $lt: week.end },
    });

    likesData.push({ week: week.end, count: likesCount });
    followersData.push({ week: week.end, count: followersCount });
  }
  let chartData = { likesData, followersData }
  return chartData;
}


export default getWeeklyData;

