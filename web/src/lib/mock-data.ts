export type VideoVisibility = "draft" | "in_review" | "published";

export type Category = {
  id: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  procedures: string[];
  duration: number;
  fileUrl: string;
  thumbnailUrl: string;
  visibility: VideoVisibility;
  createdAt: string;
  updatedAt: string;
};

const categories: Category[] = [
  {
    id: "cat-upper-gi",
    name: "上部消化管内視鏡検査",
    slug: "upper-gi-endoscopy",
    order: 1,
    createdAt: "2025-01-12T09:10:00.000Z",
    updatedAt: "2025-09-20T07:24:00.000Z",
  },
  {
    id: "cat-lower-gi",
    name: "下部消化管内視鏡検査",
    slug: "lower-gi-endoscopy",
    order: 2,
    createdAt: "2025-01-12T09:12:00.000Z",
    updatedAt: "2025-09-14T05:12:00.000Z",
  },
  {
    id: "cat-ct",
    name: "CT検査",
    slug: "ct-scan",
    order: 3,
    createdAt: "2025-02-03T13:10:00.000Z",
    updatedAt: "2025-08-28T08:44:00.000Z",
  },
  {
    id: "cat-abdominal-echo",
    name: "腹部エコー検査",
    slug: "abdominal-ultrasound",
    order: 4,
    createdAt: "2025-02-05T10:20:00.000Z",
    updatedAt: "2025-09-15T08:30:00.000Z",
  },
  {
    id: "cat-liver-biopsy",
    name: "肝生検",
    slug: "liver-biopsy",
    order: 5,
    createdAt: "2025-02-10T14:15:00.000Z",
    updatedAt: "2025-09-22T11:45:00.000Z",
  },
  {
    id: "cat-ecg",
    name: "心電図検査",
    slug: "electrocardiogram",
    order: 6,
    createdAt: "2025-02-12T09:00:00.000Z",
    updatedAt: "2025-09-18T10:20:00.000Z",
  },
];

const videos: Video[] = [
  // 上部消化管内視鏡検査
  {
    id: "vid-upper-gi-001",
    title: "上部消化管内視鏡検査の準備",
    description:
      "検査前日の食事制限と当日の流れ、注意事項を説明する 6 分の動画です。",
    categoryId: "cat-upper-gi",
    procedures: ["上部消化管内視鏡検査", "鎮静管理"],
    duration: 6,
    fileUrl: "/videos/upper-gi-prep.mp4",
    thumbnailUrl: "/thumbnails/upper-gi-prep.jpg",
    visibility: "published",
    createdAt: "2025-03-01T06:20:00.000Z",
    updatedAt: "2025-09-18T09:00:00.000Z",
  },
  {
    id: "vid-upper-gi-002",
    title: "上部消化管内視鏡検査の流れ",
    description:
      "検査中の手順、鎮静下での進行、検査後の注意点をまとめています。",
    categoryId: "cat-upper-gi",
    procedures: ["上部消化管内視鏡検査"],
    duration: 8,
    fileUrl: "/videos/upper-gi-procedure.mp4",
    thumbnailUrl: "/thumbnails/upper-gi-procedure.jpg",
    visibility: "published",
    createdAt: "2025-03-05T10:30:00.000Z",
    updatedAt: "2025-09-20T11:15:00.000Z",
  },
  {
    id: "vid-upper-gi-003",
    title: "胃内視鏡検査後の注意点",
    description:
      "検査後の食事制限、合併症のサイン、帰宅後の過ごし方を説明します。",
    categoryId: "cat-upper-gi",
    procedures: ["上部消化管内視鏡検査", "生活指導"],
    duration: 5,
    fileUrl: "/videos/upper-gi-aftercare.mp4",
    thumbnailUrl: "/thumbnails/upper-gi-aftercare.jpg",
    visibility: "in_review",
    createdAt: "2025-04-10T14:20:00.000Z",
    updatedAt: "2025-09-25T08:45:00.000Z",
  },
  // 下部消化管内視鏡検査
  {
    id: "vid-lower-gi-001",
    title: "大腸内視鏡検査の準備",
    description:
      "検査前日の食事制限、下剤の飲み方、当日の流れを説明する 10 分間の動画です。",
    categoryId: "cat-lower-gi",
    procedures: ["下部消化管内視鏡検査", "前処置"],
    duration: 10,
    fileUrl: "/videos/lower-gi-prep.mp4",
    thumbnailUrl: "/thumbnails/lower-gi-prep.jpg",
    visibility: "published",
    createdAt: "2025-02-15T10:30:00.000Z",
    updatedAt: "2025-09-22T09:20:00.000Z",
  },
  {
    id: "vid-lower-gi-002",
    title: "大腸内視鏡検査の流れ",
    description:
      "検査中の手順、ポリープ切除について、合併症の説明を行います。",
    categoryId: "cat-lower-gi",
    procedures: ["下部消化管内視鏡検査", "ポリープ切除"],
    duration: 9,
    fileUrl: "/videos/lower-gi-procedure.mp4",
    thumbnailUrl: "/thumbnails/lower-gi-procedure.jpg",
    visibility: "published",
    createdAt: "2025-02-20T13:00:00.000Z",
    updatedAt: "2025-09-26T10:30:00.000Z",
  },
  {
    id: "vid-lower-gi-003",
    title: "大腸内視鏡検査後の注意点",
    description:
      "検査後の食事制限、帰宅後の過ごし方、よくある質問をまとめています。",
    categoryId: "cat-lower-gi",
    procedures: ["下部消化管内視鏡検査", "生活指導"],
    duration: 6,
    fileUrl: "/videos/lower-gi-aftercare.mp4",
    thumbnailUrl: "/thumbnails/lower-gi-aftercare.jpg",
    visibility: "draft",
    createdAt: "2025-04-15T11:00:00.000Z",
    updatedAt: "2025-09-27T14:00:00.000Z",
  },
  // CT検査
  {
    id: "vid-ct-001",
    title: "腹部CT検査の準備",
    description:
      "造影剤の使用、検査前の食事制限、検査着について説明する 7 分間の動画です。",
    categoryId: "cat-ct",
    procedures: ["CT検査", "造影剤投与"],
    duration: 7,
    fileUrl: "/videos/ct-prep.mp4",
    thumbnailUrl: "/thumbnails/ct-prep.jpg",
    visibility: "published",
    createdAt: "2025-05-01T09:30:00.000Z",
    updatedAt: "2025-09-19T08:20:00.000Z",
  },
  {
    id: "vid-ct-002",
    title: "CT検査の流れと注意点",
    description:
      "検査中の姿勢、息止めのタイミング、体への影響について説明します。",
    categoryId: "cat-ct",
    procedures: ["CT検査"],
    duration: 5,
    fileUrl: "/videos/ct-procedure.mp4",
    thumbnailUrl: "/thumbnails/ct-procedure.jpg",
    visibility: "published",
    createdAt: "2025-05-05T10:15:00.000Z",
    updatedAt: "2025-09-24T11:40:00.000Z",
  },
  // 腹部エコー検査
  {
    id: "vid-abdominal-echo-001",
    title: "腹部エコー検査の準備",
    description:
      "検査前日の食事制限、当日の食事・水分摂取について説明する 5 分の動画です。",
    categoryId: "cat-abdominal-echo",
    procedures: ["腹部エコー検査", "前処置"],
    duration: 5,
    fileUrl: "/videos/abdominal-echo-prep.mp4",
    thumbnailUrl: "/thumbnails/abdominal-echo-prep.jpg",
    visibility: "published",
    createdAt: "2025-06-01T08:45:00.000Z",
    updatedAt: "2025-09-21T13:20:00.000Z",
  },
  {
    id: "vid-abdominal-echo-002",
    title: "腹部エコー検査の流れ",
    description:
      "検査中の姿勢、検査部位、検査時間、検査後の過ごし方を説明します。",
    categoryId: "cat-abdominal-echo",
    procedures: ["腹部エコー検査"],
    duration: 6,
    fileUrl: "/videos/abdominal-echo-procedure.mp4",
    thumbnailUrl: "/thumbnails/abdominal-echo-procedure.jpg",
    visibility: "published",
    createdAt: "2025-06-05T11:00:00.000Z",
    updatedAt: "2025-09-23T09:15:00.000Z",
  },
  // 肝生検
  {
    id: "vid-liver-biopsy-001",
    title: "経皮的肝生検の説明",
    description:
      "検査の目的、実施方法、合併症、検査前の注意点を説明する 8 分間の動画です。",
    categoryId: "cat-liver-biopsy",
    procedures: ["経皮的肝生検", "超音波ガイド下穿刺"],
    duration: 8,
    fileUrl: "/videos/liver-biopsy-explanation.mp4",
    thumbnailUrl: "/thumbnails/liver-biopsy-explanation.jpg",
    visibility: "published",
    createdAt: "2025-07-01T10:20:00.000Z",
    updatedAt: "2025-09-26T09:32:00.000Z",
  },
  {
    id: "vid-liver-biopsy-002",
    title: "肝生検後の安静管理",
    description:
      "検査後の安静時間、体位、合併症のサイン、退院後の注意点をまとめています。",
    categoryId: "cat-liver-biopsy",
    procedures: ["経皮的肝生検", "安静管理"],
    duration: 7,
    fileUrl: "/videos/liver-biopsy-aftercare.mp4",
    thumbnailUrl: "/thumbnails/liver-biopsy-aftercare.jpg",
    visibility: "in_review",
    createdAt: "2025-07-05T14:10:00.000Z",
    updatedAt: "2025-09-27T10:20:00.000Z",
  },
  // 心電図検査
  {
    id: "vid-ecg-001",
    title: "心電図検査の説明",
    description:
      "検査の目的、測定方法、検査時間、注意点を説明する 4 分間の動画です。",
    categoryId: "cat-ecg",
    procedures: ["心電図検査"],
    duration: 4,
    fileUrl: "/videos/ecg-explanation.mp4",
    thumbnailUrl: "/thumbnails/ecg-explanation.jpg",
    visibility: "published",
    createdAt: "2025-08-01T09:00:00.000Z",
    updatedAt: "2025-09-18T10:20:00.000Z",
  },
];

const clone = <T,>(data: T): T => structuredClone(data);

export const getCategories = (): Category[] =>
  clone(categories).sort((a, b) => a.order - b.order);

export const getVideos = (options?: { visibility?: VideoVisibility }): Video[] => {
  const { visibility } = options ?? {};
  const dataset = visibility
    ? videos.filter((video) => video.visibility === visibility)
    : videos;
  return clone(dataset).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
};

export const getVideoById = (id: string): Video | undefined =>
  clone(videos.find((video) => video.id === id));

export const getVideosByCategory = (categoryId: string): Video[] =>
  getVideos().filter((video) => video.categoryId === categoryId);

export const getDashboardSummary = () => {
  const total = videos.length;
  const published = videos.filter((video) => video.visibility === "published").length;
  const inReview = videos.filter((video) => video.visibility === "in_review").length;
  const draft = videos.filter((video) => video.visibility === "draft").length;
  const latestUpdates = getVideos().slice(0, 4);

  return {
    totals: {
      total,
      published,
      inReview,
      draft,
      categories: categories.length,
    },
    latestUpdates,
  } as const;
};
