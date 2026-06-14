import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  assertAdmin,
  assertAuthed,
  createToken,
  makePasswordHash,
  mutateDb,
  readDb,
  toPublicUser,
} from "../xplore-db.server";

const tokenSchema = z.object({ token: z.string().min(1) });

export const signIn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      const user = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (!user || user.passwordHash !== makePasswordHash(data.password)) {
        throw new Error("Invalid email or password.");
      }

      const token = createToken();
      db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
      return { token, user: toPublicUser(user) };
    });
  });

export const signUp = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      interests: z.array(z.string()).default([]),
      skills: z.array(z.string()).default([]),
    }),
  )
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      if (db.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error("An account already exists for that email.");
      }

      const user = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        role: "student" as const,
        interests: data.interests,
        skills: data.skills,
        passwordHash: makePasswordHash(data.password),
        createdAt: new Date().toISOString(),
      };
      const token = createToken();
      db.users.push(user);
      db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
      db.notifications.push({
        id: crypto.randomUUID(),
        userId: user.id,
        title: "Account created",
        body: "Your Xplore profile is ready. Start with a club, an event, or an opportunity.",
        read: false,
        createdAt: new Date().toISOString(),
      });
      return { token, user: toPublicUser(user) };
    });
  });

export const getPlatformState = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().optional() }).default({}))
  .handler(async ({ data }) => {
    const db = await readDb();
    const user = data.token ? db.sessions.find((s) => s.token === data.token) : undefined;
    const currentUser = user ? db.users.find((u) => u.id === user.userId) : undefined;

    return {
      user: currentUser ? toPublicUser(currentUser) : undefined,
      clubs: db.clubs,
      events: db.events,
      opportunities: db.opportunities,
      registrations: currentUser
        ? db.registrations.filter((r) => r.userId === currentUser.id)
        : [],
      applications: currentUser
        ? db.applications.filter((a) => a.userId === currentUser.id)
        : [],
      memberships: currentUser ? db.memberships.filter((m) => m.userId === currentUser.id) : [],
      notifications: currentUser
        ? db.notifications.filter((n) => n.userId === currentUser.id).slice(-10).reverse()
        : [],
      messages: currentUser
        ? db.messages
            .filter((m) => m.fromUserId === currentUser.id || m.toUserId === currentUser.id)
            .slice(-20)
            .reverse()
        : [],
      media: db.media,
      admin: currentUser?.role === "admin" || currentUser?.role === "club_admin"
        ? {
            users: db.users.map(toPublicUser),
            registrations: db.registrations,
            applications: db.applications,
            media: db.media,
          }
        : undefined,
    };
  });

export const joinClub = createServerFn({ method: "POST" })
  .validator(tokenSchema.extend({ clubId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      const user = assertAuthed(db, data.token);
      const club = db.clubs.find((c) => c.id === data.clubId);
      if (!club) throw new Error("Club not found.");

      let membership = db.memberships.find((m) => m.userId === user.id && m.clubId === club.id);
      if (!membership) {
        membership = {
          id: crypto.randomUUID(),
          userId: user.id,
          clubId: club.id,
          role: "member",
          createdAt: new Date().toISOString(),
        };
        db.memberships.push(membership);
        club.members += 1;
        db.notifications.push({
          id: crypto.randomUUID(),
          userId: user.id,
          title: `Joined ${club.name}`,
          body: "Your club membership has been saved to your profile.",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      return { membership, club };
    });
  });

export const registerForEvent = createServerFn({ method: "POST" })
  .validator(
    tokenSchema.extend({
      eventId: z.string().min(1),
      fullName: z.string().min(2),
      email: z.string().email(),
      rollNumber: z.string().min(2),
      year: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      const user = assertAuthed(db, data.token);
      const event = db.events.find((e) => e.id === data.eventId);
      if (!event) throw new Error("Event not found.");
      if (event.registered >= event.capacity) throw new Error("This event is full.");

      let registration = db.registrations.find(
        (r) => r.userId === user.id && r.eventId === event.id,
      );
      if (!registration) {
        registration = {
          id: crypto.randomUUID(),
          userId: user.id,
          eventId: event.id,
          fullName: data.fullName,
          email: data.email,
          rollNumber: data.rollNumber,
          year: data.year,
          createdAt: new Date().toISOString(),
        };
        db.registrations.push(registration);
        event.registered += 1;
        db.notifications.push({
          id: crypto.randomUUID(),
          userId: user.id,
          title: `Registered for ${event.name}`,
          body: `${event.date} at ${event.time}, ${event.venue}.`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      return { registration, event };
    });
  });

export const applyToOpportunity = createServerFn({ method: "POST" })
  .validator(tokenSchema.extend({ opportunityId: z.string().min(1), note: z.string().default("") }))
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      const user = assertAuthed(db, data.token);
      const opportunity = db.opportunities.find((o) => o.id === data.opportunityId);
      if (!opportunity) throw new Error("Opportunity not found.");

      let application = db.applications.find(
        (a) => a.userId === user.id && a.opportunityId === opportunity.id,
      );
      if (!application) {
        application = {
          id: crypto.randomUUID(),
          userId: user.id,
          opportunityId: opportunity.id,
          status: "submitted",
          note: data.note,
          createdAt: new Date().toISOString(),
        };
        db.applications.push(application);
        db.notifications.push({
          id: crypto.randomUUID(),
          userId: user.id,
          title: `Application submitted`,
          body: `${opportunity.title} at ${opportunity.org} is now in your applications.`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      return { application, opportunity };
    });
  });

export const uploadMedia = createServerFn({ method: "POST" })
  .validator(
    tokenSchema.extend({
      ownerType: z.enum(["club", "event", "opportunity"]),
      ownerId: z.string().min(1),
      name: z.string().min(1),
      dataUrl: z.string().min(20),
    }),
  )
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      const user = assertAuthed(db, data.token);
      const media = {
        id: crypto.randomUUID(),
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        name: data.name,
        dataUrl: data.dataUrl,
        uploadedBy: user.id,
        createdAt: new Date().toISOString(),
      };
      db.media.push(media);
      return media;
    });
  });

export const sendMessage = createServerFn({ method: "POST" })
  .validator(tokenSchema.extend({ toUserId: z.string().min(1), body: z.string().min(1) }))
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      const user = assertAuthed(db, data.token);
      const target = db.users.find((u) => u.id === data.toUserId);
      if (!target) throw new Error("User not found.");
      const message = {
        id: crypto.randomUUID(),
        fromUserId: user.id,
        toUserId: target.id,
        body: data.body,
        createdAt: new Date().toISOString(),
      };
      db.messages.push(message);
      db.notifications.push({
        id: crypto.randomUUID(),
        userId: target.id,
        title: `New message from ${user.name}`,
        body: data.body,
        read: false,
        createdAt: new Date().toISOString(),
      });
      return message;
    });
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .validator(tokenSchema)
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      const user = assertAuthed(db, data.token);
      db.notifications.forEach((n) => {
        if (n.userId === user.id) n.read = true;
      });
      return { ok: true };
    });
  });

export const askXploreAi = createServerFn({ method: "POST" })
  .validator(tokenSchema.extend({ prompt: z.string().min(1), history: z.array(z.object({ role: z.enum(["user", "model"]), text: z.string() })).default([]) }))
  .handler(async ({ data }) => {
    const db = await readDb();
    const user = assertAuthed(db, data.token);

    const systemContext = `You are XploreAI, the AI campus copilot for NIT Jalandhar's Xplore platform. You help students discover clubs, events, and opportunities.

Student Profile:
- Name: ${user.name}
- Interests: ${user.interests.join(", ") || "not specified"}
- Skills: ${user.skills.join(", ") || "not specified"}
- Role: ${user.role}

Available Clubs (${db.clubs.length}):
${db.clubs.map((c) => `- ${c.name} (${c.category}): ${c.tagline} — ${c.members} members`).join("\n")}

Upcoming Events (${db.events.length}):
${db.events.map((e) => `- ${e.name} by ${e.clubId} on ${e.date} at ${e.venue}. Fee: ${e.fee}. Tag: ${e.tag}`).join("\n")}

Opportunities (${db.opportunities.length}):
${db.opportunities.map((o) => `- ${o.title} at ${o.org} (${o.type}). Stipend: ${o.stipend}. Location: ${o.location}`).join("\n")}

Your job:
1. Answer the student's question conversationally and helpfully
2. Recommend specific clubs, events, or opportunities by name based on their profile and query
3. Be concise, warm, and encouraging
4. Always end with a clear call-to-action
5. Keep responses under 150 words`;

    const GEMINI_API_KEY = import.meta.env.VITE_GCP_API_KEY;

    // Build conversation history for Gemini
    const contents = [
      ...(data.history ?? []).map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: "user" as const, parts: [{ text: data.prompt }] },
    ];

    let aiAnswer = "";
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemContext }] },
            contents,
            generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
          }),
        }
      );
      if (res.ok) {
        const json = await res.json() as any;
        aiAnswer = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
    } catch {
      // fall through to smart fallback
    }

    // Smart keyword fallback if Gemini failed
    if (!aiAnswer) {
      const text = data.prompt.toLowerCase();
      const interests = new Set(user.interests.map((i) => i.toLowerCase()));
      const clubHits = db.clubs.filter((c) => interests.has(c.category.toLowerCase()) || text.includes(c.name.toLowerCase()) || text.includes(c.category.toLowerCase())).slice(0, 2);
      const eventHits = db.events.filter((e) => text.includes(e.tag.toLowerCase()) || text.includes("event") || text.includes("hackathon") || text.includes("workshop")).slice(0, 2);
      const oppHits = db.opportunities.filter((o) => text.includes(o.type.toLowerCase()) || text.includes("intern") || text.includes("opport") || text.includes("job")).slice(0, 2);

      const parts = [];
      if (clubHits.length) parts.push(`Clubs matching your profile: ${clubHits.map((c) => c.name).join(", ")}.`);
      if (eventHits.length) parts.push(`Upcoming events you might like: ${eventHits.map((e) => e.name).join(", ")}.`);
      if (oppHits.length) parts.push(`Opportunities available: ${oppHits.map((o) => `${o.title} at ${o.org}`).join(", ")}.`);
      aiAnswer = parts.length > 0
        ? `Based on your profile (${user.interests.slice(0, 2).join(", ")}), here's what I found:\n\n${parts.join(" ")}\n\nCheck them out on Xplore! 🚀`
        : "I couldn't find a specific match for your query, but explore the Search tab to discover clubs, events and opportunities tailored to you!";
    }

    // Extract mentioned items for card display
    const mentionedClubs = db.clubs.filter((c) => aiAnswer.toLowerCase().includes(c.name.toLowerCase())).slice(0, 3);
    const mentionedEvents = db.events.filter((e) => aiAnswer.toLowerCase().includes(e.name.toLowerCase())).slice(0, 3);
    const mentionedOpps = db.opportunities.filter((o) => aiAnswer.toLowerCase().includes(o.title.toLowerCase())).slice(0, 3);

    return {
      answer: aiAnswer,
      clubs: mentionedClubs,
      events: mentionedEvents,
      opportunities: mentionedOpps,
    };
  });

export const createAdminItem = createServerFn({ method: "POST" })
  .validator(
    tokenSchema.extend({
      kind: z.enum(["event", "opportunity"]),
      payload: z.record(z.string(), z.string()),
    }),
  )
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      assertAdmin(db, data.token);
      const slug = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      if (data.kind === "event") {
        const event = {
          id: slug(data.payload.name),
          name: data.payload.name,
          clubId: data.payload.clubId,
          venue: data.payload.venue,
          date: data.payload.date,
          time: data.payload.time,
          tag: data.payload.tag,
          about: data.payload.about,
          fee: data.payload.fee || "Free",
          capacity: Number(data.payload.capacity || 100),
          registered: 0,
        };
        db.events.push(event);
        return event;
      }

      const opportunity = {
        id: slug(`${data.payload.title}-${data.payload.org}`),
        title: data.payload.title,
        org: data.payload.org,
        type: data.payload.type,
        stipend: data.payload.stipend,
        location: data.payload.location,
        duration: data.payload.duration,
        about: data.payload.about,
      };
      db.opportunities.push(opportunity);
      return opportunity;
    });
  });

export const updateProfile = createServerFn({ method: "POST" })
  .validator(tokenSchema.extend({
    name: z.string().min(2).optional(),
    bio: z.string().max(300).optional(),
    interests: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
  }))
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      const user = assertAuthed(db, data.token);
      if (data.name) user.name = data.name;
      if (data.bio !== undefined) user.bio = data.bio;
      if (data.interests) user.interests = data.interests;
      if (data.skills) user.skills = data.skills;
      return toPublicUser(user);
    });
  });

export const getLeaderboard = createServerFn({ method: "POST" })
  .validator(z.object({}).default({}))
  .handler(async () => {
    const db = await readDb();
    const scores = db.users.map((u) => {
      const memberships = db.memberships.filter((m) => m.userId === u.id).length;
      const registrations = db.registrations.filter((r) => r.userId === u.id).length;
      const applications = db.applications.filter((a) => a.userId === u.id).length;
      const points = memberships * 100 + registrations * 150 + applications * 200;
      return { id: u.id, name: u.name, points, badges: memberships + registrations };
    });
    return scores.sort((a, b) => b.points - a.points).slice(0, 10);
  });

export const getActivityFeed = createServerFn({ method: "POST" })
  .validator(z.object({}).default({}))
  .handler(async () => {
    const db = await readDb();
    type FeedItem = { who: string; action: string; target: string; time: string; ts: string };
    const items: FeedItem[] = [];
    for (const m of db.memberships) {
      const user = db.users.find((u) => u.id === m.userId);
      const club = db.clubs.find((c) => c.id === m.clubId);
      if (user && club) items.push({ who: user.name.split(' ')[0], action: 'joined', target: club.name, time: m.createdAt, ts: m.createdAt });
    }
    for (const r of db.registrations) {
      const user = db.users.find((u) => u.id === r.userId);
      const event = db.events.find((e) => e.id === r.eventId);
      if (user && event) items.push({ who: user.name.split(' ')[0], action: 'registered for', target: event.name, time: r.createdAt, ts: r.createdAt });
    }
    for (const a of db.applications) {
      const user = db.users.find((u) => u.id === a.userId);
      const opp = db.opportunities.find((o) => o.id === a.opportunityId);
      if (user && opp) items.push({ who: user.name.split(' ')[0], action: 'applied for', target: opp.title, time: a.createdAt, ts: a.createdAt });
    }
    return items
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 20)
      .map((i) => ({ ...i, time: formatRelative(i.ts) }));

    function formatRelative(isoStr: string) {
      const diff = Date.now() - new Date(isoStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    }
  });

export const updateApplicationStatus = createServerFn({ method: "POST" })
  .validator(tokenSchema.extend({
    applicationId: z.string().min(1),
    status: z.enum(["submitted", "reviewing", "accepted", "rejected"]),
  }))
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      assertAdmin(db, data.token);
      const app = db.applications.find((a) => a.id === data.applicationId);
      if (!app) throw new Error("Application not found.");
      app.status = data.status;
      const opp = db.opportunities.find((o) => o.id === app.opportunityId);
      const statusMsg = data.status === "accepted" ? "🎉 Congratulations! Your application has been accepted." :
        data.status === "rejected" ? "Your application was not selected this time. Keep exploring!" :
        data.status === "reviewing" ? "Your application is now under review." :
        "Application status updated.";
      db.notifications.push({
        id: crypto.randomUUID(),
        userId: app.userId,
        title: `Application ${data.status}: ${opp?.title ?? "Opportunity"}`,
        body: statusMsg,
        read: false,
        createdAt: new Date().toISOString(),
      });
      return app;
    });
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .validator(tokenSchema.extend({
    targetUserId: z.string().min(1),
    role: z.enum(["student", "club_admin", "admin"]),
  }))
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      assertAdmin(db, data.token);
      const target = db.users.find((u) => u.id === data.targetUserId);
      if (!target) throw new Error("User not found.");
      target.role = data.role;
      db.notifications.push({
        id: crypto.randomUUID(),
        userId: target.id,
        title: "Role updated",
        body: `Your account role has been updated to ${data.role}.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
      return toPublicUser(target);
    });
  });

export const broadcastNotification = createServerFn({ method: "POST" })
  .validator(tokenSchema.extend({
    title: z.string().min(1),
    body: z.string().min(1),
  }))
  .handler(async ({ data }) => {
    return mutateDb((db) => {
      assertAdmin(db, data.token);
      const count = db.users.length;
      for (const user of db.users) {
        db.notifications.push({
          id: crypto.randomUUID(),
          userId: user.id,
          title: data.title,
          body: data.body,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      return { sent: count };
    });
  });
