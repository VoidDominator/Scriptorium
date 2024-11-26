import prisma from '../../../utils/db';
import { authMiddleware } from '../../../utils/middleware';

async function voteHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { postId, commentId, type } = req.body;
  const { user } = req; // The authenticated user from authMiddleware

  if (!postId && !commentId) {
    return res.status(400).json({ error: 'postId or commentId is required' });
  }
  if (type !== 'upvote' && type !== 'downvote') {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  try {
    let targetType, targetId;
    if (postId) {
      targetType = 'blogPost';
      targetId = postId;
    } else if (commentId) {
      targetType = 'comment';
      targetId = commentId;
    }

    // Check for existing vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.userId,
        [`${targetType}Id`]: targetId,
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Cancel the vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Switch the vote type
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });
      }
    } else {
      // Create a new vote
      await prisma.vote.create({
        data: {
          userId: user.userId,
          [`${targetType}Id`]: targetId,
          type,
        },
      });
    }

    // Recalculate the rating
    const votes = await prisma.vote.findMany({
      where: {
        [`${targetType}Id`]: targetId,
      },
    });

    const thumbsUp = votes.filter((vote) => vote.type === 'upvote').length;
    const thumbsDown = votes.filter((vote) => vote.type === 'downvote').length;
    const rating = thumbsUp - thumbsDown;

    // Update the target entity's rating
    if (targetType === 'blogPost') {
      await prisma.blogPost.update({
        where: { id: postId },
        data: { rating },
      });
    } else if (targetType === 'comment') {
      await prisma.blogComment.update({
        where: { id: commentId },
        data: { rating },
      });
    }

    return res.status(200).json({
      message: 'Vote processed successfully',
      thumbsUp,
      thumbsDown,
      rating,
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return res.status(500).json({ error: 'Failed to process vote' });
  }
}

export default authMiddleware(voteHandler);
