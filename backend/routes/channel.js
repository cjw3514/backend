const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/avg-views', authenticateToken, async (req, res) => {
  try {
    // 1. 토큰에서 로그인한 유저의 id(PK, int) 추출
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No user id in token' });
    }

    // 2. User 테이블에서 해당 id로 youtube_user_id 조회 (필요시)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 3. Channel 테이블에서 user_id로 채널 id 조회
    const channel = await prisma.channel.findUnique({
      where: { user_id: userId }
    });
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    // 4. Channel_snapshot 테이블에서 해당 채널 id의 최신 스냅샷 average_view 조회
    const snapshot = await prisma.channel_snapshot.findFirst({
      where: { channel_id: channel.id },
      orderBy: { created_at: 'desc' }
    });
    if (!snapshot) {
      return res.status(404).json({ success: false, message: 'Channel snapshot not found' });
    }

    // 5. 평균 조회수 반환
    res.json({ average_view: snapshot.average_view });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'DB error', error: error.message });
  }
});

// 구독자 변화 추이 반환 (최근 5일)
router.get('/subscriber-change', authenticateToken, async (req, res) => {
  try {
    // 1. 토큰에서 로그인한 유저의 id(PK, int) 추출
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'No user id in token' });
    }

    // 2. Channel 테이블에서 user_id로 채널 id 조회
    const channel = await prisma.channel.findUnique({
      where: { user_id: userId }
    });
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    // 3. Channel_snapshot에서 해당 채널의 최근 5일치 구독자수와 날짜 조회 (최신순)
    const snapshots = await prisma.channel_snapshot.findMany({
      where: { channel_id: channel.id },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // 4. 날짜 오름차순(과거→최신)으로 정렬
    snapshots.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // 5. 날짜와 구독자수만 추출
    const result = snapshots.map(s => ({
      date: s.created_at.toISOString().slice(0, 10), // YYYY-MM-DD
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

    // 1. 내 채널 찾기
    const channel = await prisma.channel.findUnique({
      where: { user_id: userId }
    });
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    // 2. 최근 5개 영상 조회 (최신순)
    const videos = await prisma.video.findMany({
      where: { channel_id: channel.id },
      orderBy: { created_at: 'desc' },
      take: 5
    });

    // 3. 각 영상의 최신 스냅샷 정보 가져오기
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
        publishedAt: video.created_at.toISOString().slice(0, 10),
        viewCount: snapshot?.view ?? 0,
        commentRate: snapshot && snapshot.comment && snapshot.view ? (snapshot.comment / snapshot.view * 100).toFixed(3) + '%' : '0.000%',
        likeRate: snapshot && snapshot.like && snapshot.view ? (snapshot.like / snapshot.view * 100).toFixed(1) + '%' : '0.0%',
      });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'DB error', error: error.message });
  }
});


module.exports = router;