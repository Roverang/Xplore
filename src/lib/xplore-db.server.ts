import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { clubs, events, opportunities, type Club, type EventItem, type Opportunity } from "./data";

export type UserRole = "student" | "club_admin" | "admin";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
  skills: string[];
  bio?: string;
  points?: number;
  passwordHash: string;
  createdAt: string;
};

export type SessionRecord = {
  token: string;
  userId: string;
  createdAt: string;
};

export type RegistrationRecord = {
  id: string;
  userId: string;
  eventId: string;
  fullName: string;
  email: string;
  rollNumber: string;
  year: string;
  createdAt: string;
};

export type ApplicationRecord = {
  id: string;
  userId: string;
  opportunityId: string;
  status: "submitted" | "reviewing" | "accepted" | "rejected";
  note: string;
  createdAt: string;
};

export type ClubMembershipRecord = {
  id: string;
  userId: string;
  clubId: string;
  role: "member" | "lead";
  createdAt: string;
};

export type MediaRecord = {
  id: string;
  ownerType: "club" | "event" | "opportunity";
  ownerId: string;
  name: string;
  dataUrl: string;
  uploadedBy: string;
  createdAt: string;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type MessageRecord = {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  createdAt: string;
};

export type XploreDb = {
  users: UserRecord[];
  sessions: SessionRecord[];
  clubs: Club[];
  events: EventItem[];
  opportunities: Opportunity[];
  registrations: RegistrationRecord[];
  applications: ApplicationRecord[];
  memberships: ClubMembershipRecord[];
  media: MediaRecord[];
  notifications: NotificationRecord[];
  messages: MessageRecord[];
};

const DB_PATH = path.join(process.cwd(), ".data", "xplore-db.json");

function now() {
  return new Date().toISOString();
}

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function publicUser(user: UserRecord) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

function seedDb(): XploreDb {
  const studentId = "user-ansh";
  const adminId = "user-admin";

  return {
    users: [
      {
        id: studentId,
        name: "Ansh",
        email: "ansh@nitj.ac.in",
        role: "student",
        interests: ["Technology", "Coding", "Engineering"],
        skills: ["React", "AI", "Robotics"],
        passwordHash: hashPassword("student123"),
        createdAt: now(),
      },
      {
        id: adminId,
        name: "Campus Admin",
        email: "admin@nitj.ac.in",
        role: "admin",
        interests: ["Administration"],
        skills: ["Operations"],
        passwordHash: hashPassword("admin123"),
        createdAt: now(),
      },
    ],
    sessions: [],
    clubs,
    events,
    opportunities,
    registrations: [],
    applications: [],
    memberships: [],
    media: [],
    notifications: [
      {
        id: crypto.randomUUID(),
        userId: studentId,
        title: "Welcome to Xplore",
        body: "Your campus activity feed, applications and event registrations now persist.",
        read: false,
        createdAt: now(),
      },
    ],
    messages: [
      {
        id: crypto.randomUUID(),
        fromUserId: adminId,
        toUserId: studentId,
        body: "Welcome aboard. Try joining a club or registering for an event.",
        createdAt: now(),
      },
    ],
  };
}

export async function readDb(): Promise<XploreDb> {
  try {
    const raw = await readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as XploreDb;
  } catch {
    const db = seedDb();
    await writeDb(db);
    return db;
  }
}

export async function writeDb(db: XploreDb) {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function mutateDb<T>(mutator: (db: XploreDb) => T | Promise<T>): Promise<T> {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

export function toPublicUser(user: UserRecord) {
  return publicUser(user);
}

export function makePasswordHash(password: string) {
  return hashPassword(password);
}

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function assertAuthed(db: XploreDb, token: string) {
  const session = db.sessions.find((s) => s.token === token);
  const user = session ? db.users.find((u) => u.id === session.userId) : undefined;
  if (!user) throw new Error("You need to sign in first.");
  return user;
}

export function assertAdmin(db: XploreDb, token: string) {
  const user = assertAuthed(db, token);
  if (user.role !== "admin" && user.role !== "club_admin") {
    throw new Error("Admin access required.");
  }
  return user;
}
