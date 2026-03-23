import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Must match exactly what is registered in Google Cloud Console
      callbackURL: "http://localhost:5000/api/v1/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { displayName, emails } = profile;
        const email = emails[0].value;

        // Check if this Google-authenticated user already exists in our DB
        const existingUser = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (existingUser.rows.length > 0) {
          // User exists — pass them through
          return done(null, existingUser.rows[0]);
        }

        // User does not exist — cannot auto-register because we need flat info.
        // Return false so googleCallback can handle the 401 case.
        return done(null, false, {
          message: "No account found for this Google email. Please register first.",
        });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// We use JWT (stateless), so we only need minimal session support for the OAuth handshake
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

export default passport;