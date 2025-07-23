const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// 평균 조회수 반환
router.get('/avg-views', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No user id in token' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const channel = await prisma.channel.findFirst({ where: { user_id: userId } });
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }
    const snapshot = await prisma.channel_snapshot.findFirst({
      where: { channel_id: channel.id },
      orderBy: { created_at: 'desc' }
    });
    if (!snapshot) {
      return res.status(404).json({ success: false, message: 'Channel snapshot not found' });
    }
    res.json({ average_view: snapshot.average_view });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'DB error', error: error.message });
  }
});

// 구독자 변화 추이 반환 (최근 5일)
router.get('/subscriber-change', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No user id in token' });
    }
    const channel = await prisma.channel.findFirst({ where: { user_id: userId } });
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }
    const snapshots = await prisma.channel_snapshot.findMany({
      where: { channel_id: channel.id },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    snapshots.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const result = snapshots.map(s => ({
      date: s.created_at.toISOString().slice(0, 10),
      subscriber: s.subscriber
    }));
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'DB error', error: error.message });
  }
});

// 영상 목록 조회 (DB 기반, 최근 5개)
router.get('/videos', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No user id in token' });
    }
    const channel = await prisma.channel.findFirst({ where: { user_id: userId } });
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }
    const videos = await prisma.video.findMany({
      where: { channel_id: channel.id },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    const result = [];
    for (const video of videos) {
      const snapshot = await prisma.video_snapshot.findFirst({
        where: { video_id: video.id },
        orderBy: { created_at: 'desc' }
      });
      result.push({
        videoId: video.id,
        title: video.video_name,
        thumbnail: video.video_thumbnail_url,
        publishedAt: video.created_at ? video.created_at.toISOString().slice(0, 10) : null,
        viewCount: snapshot?.view_count ?? 0,
        commentRate: snapshot && snapshot.comment_count && snapshot.view_count ? (snapshot.comment_count / snapshot.view_count * 100).toFixed(3) + '%' : '0.000%',
        likeRate: snapshot && snapshot.like_count && snapshot.view_count ? (snapshot.like_count / snapshot.view_count * 100).toFixed(1) + '%' : '0.0%',
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'DB error', error: error.message });
  }
});

// 영상별 댓글 참여율 가져오기 API
router.get('/videos/comments-rate', authenticateToken, async (req, res) => {
  const { channel_id } = req.query;
  if (!channel_id) {
    return res.status(400).json({ success: false, message: 'channel_id is required' });
  }
  try {
    // 유저의 채널 id 검사
    const channelQuery = `
      SELECT id FROM "Channel" WHERE id = $1 AND user_id = $2 AND is_deleted = false
    `;
    const channelResult = await pool.query(channelQuery, [channel_id, req.user.id]);
    if (channelResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No channel found for this user' });
    }
    // 최근 5개 영상 조회
    const videoQuery = `
      SELECT v.id, v.video_name, v.upload_date
      FROM "Video" v
      WHERE v.channel_id = $1 AND v.is_deleted = false
      ORDER BY v.created_at DESC
      LIMIT 5
    `;
    const videoResult = await pool.query(videoQuery, [channel_id]);
    const videos = videoResult.rows;
    if (videos.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    // 각 영상별 최신 스냅샷에서 댓글수, 조회수, 참여율 계산
    const results = [];
    for (const video of videos) {
      const snapshotQuery = `
        SELECT comment_count, view_count
        FROM "Video_snapshot"
        WHERE video_id = $1 AND is_deleted = false
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const snapshotResult = await pool.query(snapshotQuery, [video.id]);
      const snapshot = snapshotResult.rows[0] || {};
      const commentCount = snapshot.comment_count ?? 0;
      const viewCount = snapshot.view_count ?? 0;
      // 댓글 참여율 계산 (조회수 0이면 0%)
      const commentRate = viewCount > 0 ? ((commentCount / viewCount) * 100).toFixed(2) + '%' : '0.00%';
      results.push({
        videoId: video.id,
        title: video.video_name,
        commentCount,
        viewCount,
        commentRate,
        uploadDate: video.upload_date
      });
    }
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('영상별 댓글 참여율 조회 실패:', error.message);
    res.status(500).json({ error: '영상별 댓글 참여율 조회 실패' });
  }
});


module.exports = router; 