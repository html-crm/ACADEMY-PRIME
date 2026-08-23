import { Course } from "@/types/course";

/**
 * MOCK DATA — development only.
 * Replace with a call to `courseService.getFeaturedCourses()` once the
 * FastAPI `/api/courses` endpoint is live.
 */
export const featuredCourses: Course[] = [
  {
    id: "c-001",
    slug: "blockchain-fundamentals",
    title: "Blockchain Fundamentals",
    description:
      "Understand how distributed ledgers work, from blocks and consensus to why decentralization matters.",
    category: "blockchain-basics",
    difficulty: "beginner",
    thumbnailUrl: "/images/courses/blockchain-fundamentals.jpg",
    instructor: {
      name: "Lina Farouk",
      avatarUrl: "/images/instructors/lina-farouk.jpg",
      title: "Protocol Researcher",
    },
    lessonCount: 8,
    totalRewardTokens: 120,
    enrolledCount: 18420,
  },
  {
    id: "c-002",
    slug: "defi-essentials",
    title: "DeFi Essentials",
    description:
      "Learn how lending, liquidity pools, and decentralized exchanges work — and how to evaluate their risk.",
    category: "defi",
    difficulty: "intermediate",
    thumbnailUrl: "/images/courses/defi-essentials.jpg",
    instructor: {
      name: "Marcus Chen",
      avatarUrl: "/images/instructors/marcus-chen.jpg",
      title: "DeFi Analyst",
    },
    lessonCount: 10,
    totalRewardTokens: 180,
    enrolledCount: 12980,
  },
  {
    id: "c-003",
    slug: "wallet-security",
    title: "Wallet & Custody Security",
    description:
      "Practical, non-hype security habits: seed phrase hygiene, hardware wallets, and spotting phishing.",
    category: "security",
    difficulty: "beginner",
    thumbnailUrl: "/images/courses/wallet-security.jpg",
    instructor: {
      name: "Omar Al-Sayed",
      avatarUrl: "/images/instructors/omar-alsayed.jpg",
      title: "Security Engineer",
    },
    lessonCount: 6,
    totalRewardTokens: 90,
    enrolledCount: 24110,
  },
  {
    id: "c-004",
    slug: "reading-the-market",
    title: "Reading the Market",
    description:
      "A grounded introduction to market structure, order books, and risk management — no signal-selling.",
    category: "trading",
    difficulty: "intermediate",
    thumbnailUrl: "/images/courses/reading-the-market.jpg",
    instructor: {
      name: "Sara Nassar",
      avatarUrl: "/images/instructors/sara-nassar.jpg",
      title: "Markets Educator",
    },
    lessonCount: 12,
    totalRewardTokens: 210,
    enrolledCount: 9540,
  },
];
