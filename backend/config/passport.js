const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { generateToken } = require('../utils/jwtUtils');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Google OAuth 전략 등록
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. DB에서 User 조회 또는 생성
      let dbUser = await prisma.user.findUnique({
        where: { youtube_user_id: profile.id }
      });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            youtube_user_id: profile.id,
            email: profile.emails[0].value,
            // ...필요시 추가 필드
          }
        });
      }
  
      // 2. JWT에 반드시 int형 PK를 넣음
      const user = {
        id: dbUser.id, // 반드시 int형 PK!
        youtube_user_id: dbUser.youtube_user_id,
        email: dbUser.email,
        accessToken // 필요시 포함
      };
      const token = generateToken(user);
      return done(null, { user, token });
    } catch (error) {
      return done(error, null);
    }
  }));
module.exports = passport;