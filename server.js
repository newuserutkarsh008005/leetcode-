
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const query = (username) => {
  const user = JSON.stringify(username);

  return `
    {
      matchedUser(username: ${user}) {
        username

        profile {
          realName
          userAvatar
          countryName
          ranking
          reputation
        }

        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }

        tagProblemCounts {
          fundamental {
            tagName
            tagSlug
            problemsSolved
          }
          intermediate {
            tagName
            tagSlug
            problemsSolved
          }
          advanced {
            tagName
            tagSlug
            problemsSolved
          }
        }
      }

      userContestRanking(username: ${user}) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
      }

      userContestRankingHistory(username: ${user}) {
        attended
        rating
        ranking
        trendDirection
        contest {
          title
          startTime
        }
      }

      recentAcSubmissionList(username: ${user}, limit: 10) {
        id
        title
        titleSlug
        timestamp
      }

      recentSubmissionList(username: ${user}, limit: 10) {
        id
        title
        titleSlug
        status
        lang
      }
    }
  `;
};

app.get("/api/leetcode", async (req, res) => {
  const username = String(req.query.username || "").trim();

  if (!/^[A-Za-z0-9_-]{1,30}$/.test(username)) {
    return res.status(400).json({
      error: "Enter a valid LeetCode username."
    });
  }

  try {
    const upstream = await fetch(
      "https://leetcode.com/graphql/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Referer": "https://leetcode.com/",
          "User-Agent": "Mozilla/5.0"
        },
        body: JSON.stringify({
          query: query(username)
        })
      }
    );

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `LeetCode returned HTTP ${upstream.status}.`
      });
    }

    const payload = await upstream.json();

    if (payload.errors?.length) {
      console.error("GraphQL errors:", payload.errors);

      return res.status(502).json({
        error: payload.errors
          .map(error => error.message)
          .join(" | ")
      });
    }

    if (!payload.data?.matchedUser) {
      return res.status(404).json({
        error: "LeetCode user not found or profile unavailable."
      });
    }

    // Normalize missing submission data.
    payload.data.recentAcSubmissionList ??= [];
    payload.data.recentSubmissionList ??= [];

    // Public profile data only.
    res.set("Cache-Control", "public, max-age=60");

    return res.json(payload.data);

  } catch (error) {
    console.error("LeetCode request failed:", error);

    return res.status(502).json({
      error: "Could not reach LeetCode. Check your internet connection."
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `LeetCode Dashboard running at http://localhost:${PORT}`
  );
});
