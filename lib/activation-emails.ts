import type { Stage } from "./activation";

/**
 * Activation email copy. Pure: no database, no network. Each email leads with
 * the one next action, says how small it is, and gives one link.
 * Account service emails only: no marketing, no upsell, no invented numbers.
 */

export type EmailContext = {
  stage: Stage;
  step: number;
  firstName: string;
  baseUrl: string;
  stopUrl: string;
  churchName?: string | null;
  /** Real category names from the database, in site order. */
  categories?: string[];
  /** Stage B: how many members of the leader's church are waiting. */
  waitingCount?: number;
  /** Stage E: the church's join code, if one exists. */
  joinCode?: string | null;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
  /** In app bell entry. */
  title: string;
  linkPath: string;
};

type Copy = {
  subject: string;
  title: string;
  heading: string;
  paragraphs: string[];
  cta: string;
  path: string;
  /** Optional line shown under the button (a plain link to copy). */
  afterLink?: string;
};

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listNames(names: string[], max = 3): string {
  const n = names.filter(Boolean).slice(0, max);
  if (n.length === 0) return "";
  if (n.length === 1) return n[0];
  return `${n.slice(0, -1).join(", ")} or ${n[n.length - 1]}`;
}

function people(n: number) {
  return n === 1 ? "1 person" : `${n} people`;
}

function copyFor(c: EmailContext): Copy {
  const name = c.firstName || "there";
  const church = c.churchName || "your church";
  const cats = listNames(c.categories ?? []);
  const key = `${c.stage}${c.step}`;

  switch (key) {
    /* A: signed up, church not linked */
    case "A1":
      return {
        subject: `${name}, linking your church takes about 2 minutes`,
        title: "Link your church to finish setting up",
        heading: "One small step left",
        paragraphs: [
          `Hi ${name},`,
          "You have made your Church Member Marketplace account. The one thing left is to link your church, and it takes about 2 minutes.",
          "Choose your church from the list if it is there. If not, type its name and city and, if you can, the name of someone there who knows you. That is all we need to ask.",
        ],
        cta: "Link my church",
        path: "/dashboard/edit-church",
      };
    case "A2":
      return {
        subject: `${name}, here is what opens up once your church is linked`,
        title: "What opens up when your church is linked",
        heading: "What you get after this step",
        paragraphs: [
          `Hi ${name},`,
          `Once someone has confirmed your church, you can browse and book trusted people from churches across the network${cats ? `, in categories like ${cats}` : ""}. You can also message them and post a request for what you need.`,
          "Until then the marketplace stays closed to you. Linking your church is the only thing in the way, and it takes about 2 minutes.",
        ],
        cta: "Link my church",
        path: "/dashboard/edit-church",
      };
    case "A3":
      return {
        subject: `${name}, how church verification works`,
        title: "How church verification works",
        heading: "Who confirms you, and how",
        paragraphs: [
          `Hi ${name},`,
          "When you link your church, a leader from that church confirms you belong to the congregation. If your church is not on the network yet, our admin team does it. You do not need to chase anyone.",
          "Verification is a starting point for your own judgement, not a guarantee. It does mean everyone you meet here has a church behind them.",
        ],
        cta: "Link my church",
        path: "/dashboard/edit-church",
      };
    case "A4":
      return {
        subject: `${name}, one last note from Church Member Marketplace`,
        title: "A last note about linking your church",
        heading: "One last note",
        paragraphs: [
          `Hi ${name},`,
          "This is the last email we will send about this. Your account is still here, and the link below will work whenever you are ready to link your church.",
          "If now is not the time, that is fine. We will not email you again about it.",
        ],
        cta: "Link my church",
        path: "/dashboard/edit-church",
      };

    /* B: leader, members waiting */
    case "B1":
      return {
        subject: `${people(c.waitingCount ?? 1)} from ${church} waiting for you to confirm`,
        title: `${people(c.waitingCount ?? 1)} waiting for your confirmation`,
        heading: "Members are waiting for you",
        paragraphs: [
          `Hi ${name},`,
          `${people(c.waitingCount ?? 1)} who say they belong to ${church} ${(c.waitingCount ?? 1) === 1 ? "is" : "are"} waiting to be confirmed. It takes a tap or two for each, from your church members page.`,
          "Until you confirm them they cannot browse, message or book. You know your congregation better than anyone.",
        ],
        cta: "Open my members page",
        path: "/leader",
      };
    case "B2":
      return {
        subject: `Still waiting: ${people(c.waitingCount ?? 1)} from ${church}`,
        title: "Members are still waiting for you",
        heading: "Still waiting for your confirmation",
        paragraphs: [
          `Hi ${name},`,
          `${people(c.waitingCount ?? 1)} from ${church} ${(c.waitingCount ?? 1) === 1 ? "is" : "are"} still waiting. On your members page you can see who they are and confirm anyone you recognise, one at a time or several together.`,
        ],
        cta: "Open my members page",
        path: "/leader",
      };
    case "B3":
      return {
        subject: `A last reminder about members waiting at ${church}`,
        title: "A last reminder about members waiting",
        heading: "A last reminder",
        paragraphs: [
          `Hi ${name},`,
          `${people(c.waitingCount ?? 1)} from ${church} ${(c.waitingCount ?? 1) === 1 ? "is" : "are"} still waiting to be confirmed. Our admin team also looks over the waiting list, so no one is forgotten, but you are the one who knows them.`,
          "This is the last email we will send about this batch.",
        ],
        cta: "Open my members page",
        path: "/leader",
      };

    /* C: verified member, nothing started */
    case "C1":
      return {
        subject: `${name}, find someone you can trust, or ask for what you need`,
        title: "Browse a category or post a request",
        heading: "The marketplace is open to you",
        paragraphs: [
          `Hi ${name},`,
          "You are verified, so you can use everything here. The easiest first step takes about a minute: browse a category, or post a request and let providers come to you.",
          cats ? `Right now you can look in ${cats}, among others.` : "",
        ].filter(Boolean),
        cta: "Browse the marketplace",
        path: "/listings",
        afterLink: "Or post a request instead:",
      };
    case "C2":
      return {
        subject: `${name}, a small first step on the marketplace`,
        title: "A small first step on the marketplace",
        heading: "Just one small thing",
        paragraphs: [
          `Hi ${name},`,
          "You do not have to book anyone today. Looking at a few profiles, or saying in a sentence or two what you need, is enough to begin.",
          "Everyone listed has been confirmed by a church. That is a starting point for your own judgement, not a guarantee, so read profiles and testimonials as you would for anyone you were thinking of hiring.",
          "This is the last email like this. Your account stays as it is.",
        ],
        cta: "Post a request",
        path: "/requests/new",
        afterLink: "Or browse instead:",
      };

    /* D: verified provider, no active listing */
    case "D1":
      return {
        subject: `${name}, your first listing takes about 5 minutes`,
        title: "Create your first listing",
        heading: "Your first listing",
        paragraphs: [
          `Hi ${name},`,
          "You are approved as a provider, and the only thing missing is a listing. It takes about 5 minutes: a title, a category, a few sentences about what you offer, and your service area.",
          "Members cannot find or book you until it is live.",
        ],
        cta: "Create my listing",
        path: "/my-listings/create",
      };
    case "D2":
      return {
        subject: `${name}, what a good listing includes`,
        title: "What a good listing includes",
        heading: "What a good listing includes",
        paragraphs: [
          `Hi ${name},`,
          "Give it a title that says plainly what you do, and a description with your experience and what is included. Add your service area, and either a price or a note that you quote on request. A photo helps if you have a good one.",
          "Verified members from across the network will see it as soon as it is live.",
        ],
        cta: "Create my listing",
        path: "/my-listings/create",
      };
    case "D3":
      return {
        subject: `${name}, start with just a title and a few sentences`,
        title: "Start your listing with a few sentences",
        heading: "Start small",
        paragraphs: [
          `Hi ${name},`,
          "A title, a category and a few honest sentences are enough to go live. You can edit it any time and add the rest later.",
          "This is the last email we will send about this.",
        ],
        cta: "Create my listing",
        path: "/my-listings/create",
      };

    /* E: approved church leader, no invites, no roster */
    case "E1": {
      const join = c.joinCode ? `${c.baseUrl.replace(/\/$/, "")}/join/${c.joinCode}` : null;
      return {
        subject: `${name}, share the ${church} link with your first few people`,
        title: `Share your ${church} join link`,
        heading: `${church} is live`,
        paragraphs: [
          `Hi ${name},`,
          `Thank you for taking on ${church}. It is live on the marketplace, and the next step is a small one: send your join link to a few people you know, by message or after a service.`,
          `Anyone who signs up through it is already linked to ${church}. You then confirm each person, so you stay in charge of who is in.`,
          join ? `Your link: ${join}` : "You can create your join link on your church members page in one tap.",
        ],
        cta: join ? "Open my church tools" : "Create my join link",
        path: "/leader",
      };
    }
    case "E2":
      return {
        subject: `${name}, prefer to add ${church} members from a list?`,
        title: "Add your members from a list",
        heading: "Add people from a list instead",
        paragraphs: [
          `Hi ${name},`,
          "If you have a list of names and emails, paste it in and the marketplace does the rest. You choose whether it emails each person an invite, keeps them on a pre approved roster so they are linked to your church when they sign up, or both.",
          "One name and email per line is enough. You still confirm everyone.",
        ],
        cta: "Import my members",
        path: "/leader/import",
      };
    case "E3":
      return {
        subject: `${name}, a last word about getting ${church} started`,
        title: "A last word about getting your church started",
        heading: "A last word",
        paragraphs: [
          `Hi ${name},`,
          `Even a handful of people from ${church} makes the marketplace worth opening, because they can hire and be hired by each other, and by members of other churches.`,
          "Your join link and the list import are both on your church members page whenever you want them. This is the last email we will send about this.",
        ],
        cta: "Open my church tools",
        path: "/leader",
      };
    default:
      throw new Error(`No copy for activation stage ${c.stage} step ${c.step}`);
  }
}

function withTag(path: string, c: EmailContext) {
  return `${path}${path.includes("?") ? "&" : "?"}r=${c.stage}${c.step}`;
}

export function renderActivationEmail(c: EmailContext): RenderedEmail {
  const copy = copyFor(c);
  const base = c.baseUrl.replace(/\/$/, "");
  const href = `${base}${withTag(copy.path, c)}`;
  const secondary =
    c.stage === "C"
      ? { label: c.step === 1 ? "Post a request" : "Browse the marketplace", href: `${base}${withTag(c.step === 1 ? "/requests/new" : "/listings", c)}` }
      : null;

  const paras = copy.paragraphs
    .map((p) => `<p style="margin:0 0 12px;">${escapeHtml(p)}</p>`)
    .join("");
  const second = secondary
    ? `<p style="margin:16px 0 0; font-size:14px; color:#6b5f4d;">${escapeHtml(copy.afterLink || "")} <a href="${secondary.href}" style="color:#C05A36;">${escapeHtml(secondary.label)}</a></p>`
    : "";

  const html = `
    <div style="font-family: system-ui, sans-serif; color: #2A2018; max-width: 520px;">
      <h2 style="color:#C05A36;">${escapeHtml(copy.heading)}</h2>
      <div style="font-size:15px; line-height:1.55; color:#3C3528;">${paras}</div>
      <p style="margin-top:20px;"><a href="${href}" style="background:#C05A36;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600;">${escapeHtml(copy.cta)}</a></p>
      ${second}
      <p style="margin-top:28px; font-size:12px; line-height:1.5; color:#8a7e6b;">
        You are getting this because you have an account on Church Member Marketplace.
        <a href="${c.stopUrl}" style="color:#8a7e6b;">Stop these emails</a>
      </p>
    </div>
  `;

  const textLines = [
    ...copy.paragraphs,
    "",
    `${copy.cta}: ${href}`,
    ...(secondary ? [`${secondary.label}: ${secondary.href}`] : []),
    "",
    `Stop these emails: ${c.stopUrl}`,
  ];

  return {
    subject: copy.subject,
    html,
    text: textLines.join("\n"),
    title: copy.title,
    linkPath: withTag(copy.path, c),
  };
}
