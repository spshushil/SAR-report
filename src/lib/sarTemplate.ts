// Fixed 16-row template — DO NOT add/remove rows.
export type CourseRow = {
  sno: number;
  course: string;
  time: string;
  points: string;
  details: string; // user fills (default = template hint)
  defaultHint: string;
};

export const TEMPLATE_ROWS: Omit<CourseRow, "details">[] = [
  { sno: 1, course: "Foundation Course (Per Class )", time: "2hours", points: "2", defaultHint: "First day first session: Introduction, physical exercises, nadi suddhi,etc.." },
  { sno: 2, course: "Introspection (Per Class )", time: "2hours", points: "2", defaultHint: "Intro - 1, session -1 physical exercise,,Suryanamashkaram,benefits of introspection etc…." },
  { sno: 3, course: "Kayakalpam - Public /  College", time: "2Hours", points: "2", defaultHint: "Philosophy of  KayaKalpam, Explanation, practice." },
  { sno: 4, course: "Kayakalpam - School Student", time: "1Hours", points: "1", defaultHint: "Philosophy of  KayaKalpam, Explanation, practice." },
  { sno: 5, course: "Special Discourse ( Wife'sday, World Peace day, ZRC,MRC,BG,A/N,APT)", time: "Per Class", points: "4", defaultHint: "Mention the Topic given" },
  { sno: 6, course: "Aliyar service  (All Training Classes)", time: "One day", points: "2", defaultHint: "Attach the photo copy of Volunteer Batch issued by Aliyar" },
  { sno: 7, course: "Sky Centre / Trust  Vision Diploma, BA, MA Class", time: "2Hours", points: "2", defaultHint: "Attach the photo copy of Attendance" },
  { sno: 8, course: "ZRC- Attendance", time: "1 day", points: "5", defaultHint: "Points will be allotted as per attendance of Zone.Masters need not mention in SAR" },
  { sno: 9, course: "MRC- Attendance", time: "3 days", points: "10", defaultHint: "Points will be allotted as per attendance of Aliyar.Masters need not mention in SAR" },
  { sno: 10, course: " ZOOM Class (Aliyar,SMART,Other countries)", time: "Per hour", points: "1", defaultHint: "(Except  Pre-recorded repeating program) Mention the actual date" },
  { sno: 11, course: "Karuvile Thiruvudaiyaraathal Course (ANC)  / Children Course", time: "1Hour", points: "1", defaultHint: "Attach the photo copy of Attendance" },
  { sno: 12, course: "Mounam", time: "Per  day/ half day", points: "2", defaultHint: "Attach the photo copy of Attendance" },
  { sno: 13, course: "VSP Teachers", time: "6Months", points: "150", defaultHint: "Mention the name of  the Village (One SAR  is enough  per village)" },
  { sno: 14, course: "Yoga Teacher working at School,(fulltime)", time: "Per Week (6 days)", points: "2", defaultHint: "Attach the School Time Table" },
  { sno: 15, course: "Sky Centres - Exercise, Food for Thought Routine Class  Daily", time: "10 Days", points: "2", defaultHint: "Attach the photo copy of Attendance" },
  { sno: 16, course: "Service only at Sky Centres (YYE at School,FC,Intro, )", time: "2 hour", points: "1", defaultHint: "Attach letter from Managing Trustee." },
];

export type Page2Entry = {
  date: string;
  trust: string;
  place: string;
  participants: string;
  duration: string;
  courseDetails: string;
};

export const QUARTERS = [
  { id: "I", label: "I Quarter", sub: "Apr-June" },
  { id: "II", label: "II Quarter", sub: "July-Sept" },
  { id: "III", label: "III Quarter", sub: "Oct - Dec" },
  { id: "IV", label: "IV Quarter", sub: "Jan-Mar" },
] as const;

export type SarData = {
  name: string;
  mobile: string;
  regNo: string; // up to 7 chars
  quarter: string; // I/II/III/IV
  courses: string[]; // 16 detail strings
  entries: Page2Entry[];
  place: string;
  dateSigned: string;
  proofUrls: string[];
  role: "ASST" | "PROF" | "";
  signatureUrl: string;
};
export const emptySar = (): SarData => ({
  name: "",
  mobile: "",
  regNo: "",
  quarter: "",
  courses: TEMPLATE_ROWS.map((r) => r.defaultHint),
  entries: [{ date: "", trust: "", place: "", participants: "", duration: "", courseDetails: "" }],
  place: "",
  dateSigned: "",
  proofUrls: [],
  role: "",
  signatureUrl: "",
});

