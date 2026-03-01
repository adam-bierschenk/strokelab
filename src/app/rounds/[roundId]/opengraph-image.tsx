import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "StrokeLab Score Card"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

interface PageProps {
  params: {
    roundId: string
  }
}

export default async function Image({ params }: PageProps) {
  // In production: const round = await getRound(params.roundId)
  // For MVP: use mock data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const roundId = params.roundId
  const roundData = {
    userName: "Alex Johnson",
    courseName: "White Eagle Golf Club",
    score: 85,
    par: 72,
    differential: 12.4,
    date: "2026-02-28",
  }

  const toPar = roundData.score - roundData.par
  const toParText = toPar > 0 ? `+${toPar}` : toPar.toString()

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "white",
          textAlign: "center",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: "40px",
            marginBottom: "40px",
          }}
        >
          ⛳ StrokeLab
        </div>

        {/* Player Name */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {roundData.userName}
        </div>

        {/* Course */}
        <div
          style={{
            fontSize: "32px",
            color: "#94a3b8",
            marginBottom: "40px",
          }}
        >
          {roundData.courseName}
        </div>

        {/* Score Card */}
        <div
          style={{
            display: "flex",
            gap: "60px",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {/* Score */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "120px",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              {roundData.score}
            </div>
            <div style={{ fontSize: "24px", color: "#94a3b8" }}>Score</div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "2px",
              height: "100px",
              background: "rgba(255,255,255,0.2)",
            }}
          />

          {/* To Par */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: toPar <= 0 ? "#4ade80" : "#fbbf24",
              }}
            >
              {toParText}
            </div>
            <div style={{ fontSize: "24px", color: "#94a3b8" }}>To Par</div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "2px",
              height: "100px",
              background: "rgba(255,255,255,0.2)",
            }}
          />

          {/* Differential */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "72px",
                fontWeight: "bold",
              }}
            >
              {roundData.differential.toFixed(1)}
            </div>
            <div style={{ fontSize: "24px", color: "#94a3b8" }}>Differential</div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "24px",
            color: "#64748b",
          }}
        >
          {roundData.date} • strokelab.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
