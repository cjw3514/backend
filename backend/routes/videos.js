const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const prisma = new PrismaClient();

const router = express.Router();

// 특정 영상의 긍정적 댓글만 반환
router.get('/videos/:videoId/comments/positive', authenticateToken, async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId, 10);
    if (isNaN(videoId)) {
      return res.status(400).json({ success: false, message: 'Invalid video id' });
    }

    // 긍정적 댓글만 조회
    const comments = await prisma.comment.findMany({
      where: {
        video_id: videoId,
        sentiment: 'positive'
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'DB error', error: error.message });
  }
});

// 특정 영상의 부정적 댓글만 반환
router.get('/videos/:videoId/comments/negative', authenticateToken, async (req, res) => {
  try {
    const videoId = parseInt(req.params.videoId, 10);
    if (isNaN(videoId)) {
      return res.status(400).json({ success: false, message: 'Invalid video id' });
    }

    // 부정적 댓글만 조회
    const comments = await prisma.comment.findMany({
      where: {
        video_id: videoId,
        sentiment: 'negative'
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'DB error', error: error.message });
  }
});
module.exports = router;