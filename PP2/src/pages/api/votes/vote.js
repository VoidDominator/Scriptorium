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
    // Handle voting for a post
    if (postId) {
      const existingVote = await prisma.vote.findUnique({
        where: { userId_blogPostId: { userId: user.userId, blogPostId: postId } },
      });

      if (existingVote) {
        if (existingVote.type === type) {
          // Cancel the vote if the user clicks the same vote type again
          await prisma.vote.delete({ where: { id: existingVote.id } });

          // Adjust the post rating by removing the vote
          await prisma.blogPost.update({
            where: { id: postId },
            data: {
              rating: {
                decrement: type === 'upvote' ? 1 : -1,
              },
            },
          });

          return res.status(200).json({ message: `Vote ${type} canceled successfully` });
        }

        // Switch the vote type and adjust the rating accordingly
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });

        await prisma.blogPost.update({
          where: { id: postId },
          data: {
            rating: {
              increment: type === 'upvote' ? 2 : -2, // Adjust for switching vote types
            },
          },
        });
      } else {
        // Create a new vote if none exists
        await prisma.vote.create({
          data: {
            userId: user.userId,
            blogPostId: postId,
            type,
          },
        });

        // Adjust the post rating based on the initial vote
        await prisma.blogPost.update({
          where: { id: postId },
          data: {
            rating: { increment: type === 'upvote' ? 1 : -1 },
          },
        });
      }
    } 
    // Handle voting for a comment
    else if (commentId) {
      const existingVote = await prisma.vote.findUnique({
        where: { userId_commentId: { userId: user.userId, commentId: commentId } },
      });

      if (existingVote) {
        if (existingVote.type === type) {
          // Cancel the vote if the user clicks the same vote type again
          await prisma.vote.delete({ where: { id: existingVote.id } });

          // Adjust the comment rating by removing the vote
          await prisma.blogComment.update({
            where: { id: commentId },
            data: {
              rating: {
                decrement: type === 'upvote' ? 1 : -1,
              },
            },
          });

          return res.status(200).json({ message: `Vote ${type} canceled successfully` });
        }

        // Switch the vote type and adjust the rating accordingly
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });

        await prisma.blogComment.update({
          where: { id: commentId },
          data: {
            rating: {
              increment: type === 'upvote' ? 2 : -2, // Adjust for switching vote types
            },
          },
        });
      } else {
        // Create a new vote if none exists
        await prisma.vote.create({
          data: {
            userId: user.userId,
            commentId: commentId,
            type,
          },
        });

        // Adjust the comment rating based on the initial vote
        await prisma.blogComment.update({
          where: { id: commentId },
          data: {
            rating: { increment: type === 'upvote' ? 1 : -1 },
          },
        });
      }
    }

    return res.status(200).json({ message: 'Vote registered successfully' });
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
}

export default authMiddleware(voteHandler);
