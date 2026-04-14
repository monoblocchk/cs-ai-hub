export type DraftMode = "support" | "sales" | "hype";

export type Channel = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  queueCount: number;
  aiCoverage: string;
  responseTarget: string;
};

export type DraftVariant = {
  id: string;
  label: string;
  body: string;
  focus: string;
};

export type Message = {
  id: string;
  authorType: "customer" | "agent" | "ai" | "internal";
  authorName: string;
  direction: "inbound" | "outbound" | "note";
  timestamp: string;
  body: string;
};

export type Conversation = {
  id: string;
  channelId: string;
  customerName: string;
  customerHandle: string;
  customerMeta: string;
  intent: string;
  status: "Needs reply" | "Watching" | "Ready to send";
  priority: "High" | "Medium" | "Low";
  unreadCount: number;
  updatedAt: string;
  latestPreview: string;
  latestCustomerMessage: string;
  summary: string;
  nextBestAction: string;
  tags: string[];
  knowledgeIds: string[];
  messages: Message[];
  drafts: Record<DraftMode, DraftVariant[]>;
  externalTicketId?: string;
  externalTicketUrl?: string;
  readOnly?: boolean;
  source?: "mock" | "gorgias";
};

export type KnowledgeCard = {
  id: string;
  title: string;
  type: "Product" | "Policy" | "Usage";
  freshness: string;
  source: string;
  body: string;
};

export const channels: Channel[] = [
  {
    id: "instagram-comments",
    label: "Instagram Comments",
    shortLabel: "IGC",
    description: "Public comments on reels, ads, and product teasers.",
    queueCount: 12,
    aiCoverage: "Partial",
    responseTarget: "10 min",
  },
  {
    id: "instagram-dm",
    label: "Instagram DMs",
    shortLabel: "IGD",
    description: "Private creator and customer conversations.",
    queueCount: 9,
    aiCoverage: "Partial",
    responseTarget: "15 min",
  },
  {
    id: "email",
    label: "Email",
    shortLabel: "EML",
    description: "Long-form support and pre-sales threads.",
    queueCount: 15,
    aiCoverage: "Off",
    responseTarget: "2 hrs",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    shortLabel: "WA",
    description: "Fast troubleshooting and fulfillment updates.",
    queueCount: 7,
    aiCoverage: "Off",
    responseTarget: "12 min",
  },
];

export const knowledgeCards: KnowledgeCard[] = [
  {
    id: "magic-arm-kit",
    title: "Magic Arm Kit",
    type: "Product",
    freshness: "Synced 2 hrs ago",
    source: "monoblocc.com/products/magic-arm-kit",
    body:
      "Best for flexible webcam, light, and accessory positioning. Uses a 1/4 inch mount and is built for quick angle changes without redoing the whole setup.",
  },
  {
    id: "single-rod-mount",
    title: "Single Rod Mount",
    type: "Product",
    freshness: "Synced today",
    source: "monoblocc.com/products/single-rod-mount",
    body:
      "Cleaner footprint for compact desks and overhead shots. Easier choice when the customer wants a simple, fixed mounting path instead of a fully articulated arm.",
  },
  {
    id: "desk-clamp-fit",
    title: "Desk Clamp Fit Guide",
    type: "Usage",
    freshness: "Manual note",
    source: "Internal usage notes",
    body:
      "Standard clamp fits most desks up to roughly 55 mm thickness. For thicker edges or lips, support should confirm desk profile before promising compatibility.",
  },
  {
    id: "shipping-sla",
    title: "Shipping and Dispatch",
    type: "Policy",
    freshness: "Synced yesterday",
    source: "monoblocc.com/shipping",
    body:
      "In-stock orders usually dispatch in 1 to 2 business days. Agents should avoid promising exact delivery dates when the courier handoff has not happened yet.",
  },
  {
    id: "creator-bundle",
    title: "Creator Starter Bundle",
    type: "Product",
    freshness: "Manual note",
    source: "Internal merchandising notes",
    body:
      "Bundle positioning: camera stability first, cable cleanliness second, modular add-ons later. Strong angle for creators upgrading from improvised desk rigs.",
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv-iris",
    channelId: "instagram-comments",
    customerName: "Iris Lee",
    customerHandle: "@irisframes",
    customerMeta: "UGC creator from Singapore",
    intent: "Accessory recommendation",
    status: "Needs reply",
    priority: "High",
    unreadCount: 2,
    updatedAt: "2 min ago",
    latestPreview:
      "Would this hold a mirrorless cam and mic together or do I need a different setup?",
    latestCustomerMessage:
      "Would this hold a mirrorless cam and mic together or do I need a different setup?",
    summary:
      "Iris is comparing a single rod setup against a more flexible creator rig. She wants a compact answer for a public ad comment and has already shown buying intent.",
    nextBestAction:
      "Answer the compatibility question clearly, then suggest the Magic Arm Kit for flexibility without making the reply feel pushy.",
    tags: ["ad comment", "pre-sales", "camera rig"],
    knowledgeIds: ["magic-arm-kit", "single-rod-mount", "creator-bundle"],
    messages: [
      {
        id: "m1",
        authorType: "customer",
        authorName: "Iris Lee",
        direction: "inbound",
        timestamp: "Today, 09:11",
        body:
          "Looks clean. Is this mostly for webcams or can it work for actual content gear too?",
      },
      {
        id: "m2",
        authorType: "agent",
        authorName: "Monoblocc Team",
        direction: "outbound",
        timestamp: "Today, 09:16",
        body:
          "It can definitely go beyond webcams depending on the setup. Happy to point you to the best option.",
      },
      {
        id: "m3",
        authorType: "customer",
        authorName: "Iris Lee",
        direction: "inbound",
        timestamp: "Today, 09:22",
        body:
          "Would this hold a mirrorless cam and mic together or do I need a different setup?",
      },
    ],
    drafts: {
      support: [
        {
          id: "iris-support-1",
          label: "Recommended",
          focus: "Direct answer",
          body:
            "For a mirrorless cam plus a mic, we would usually point you to the Magic Arm Kit rather than the slimmer single rod setup. It gives you more flexibility for balancing both pieces cleanly.",
        },
        {
          id: "iris-support-2",
          label: "Compact",
          focus: "Short public reply",
          body:
            "For a mirrorless cam and mic together, the Magic Arm Kit is usually the safer fit. The single rod setup is cleaner when you want something simpler and more fixed.",
        },
        {
          id: "iris-support-3",
          label: "Clarify",
          focus: "Invite follow-up",
          body:
            "If you are mounting both a mirrorless cam and a mic, I would lean Magic Arm Kit. If you want, tell us your camera model and we can point you to the cleanest setup.",
        },
      ],
      sales: [
        {
          id: "iris-sales-1",
          label: "Recommended",
          focus: "Upsell with relevance",
          body:
            "For a mirrorless cam plus mic, the Magic Arm Kit is usually the better fit because it gives you more freedom to position both without fighting the setup. If you want a cleaner fixed look, the single rod mount is great for lighter builds.",
        },
        {
          id: "iris-sales-2",
          label: "Benefit-led",
          focus: "Sell flexibility",
          body:
            "You can do it, but for that combo the Magic Arm Kit is the one we normally recommend. It is the easier route when you want to dial in camera angle and mic placement without rebuilding the whole rig.",
        },
        {
          id: "iris-sales-3",
          label: "Soft close",
          focus: "Answer plus nudge",
          body:
            "If you are running a mirrorless cam and mic together, the Magic Arm Kit is the stronger choice. It is the setup most creators move to once they want more than a basic webcam mount.",
        },
      ],
      hype: [
        {
          id: "iris-hype-1",
          label: "Recommended",
          focus: "Energetic public voice",
          body:
            "Yes, but for a mirrorless cam plus mic we would go Magic Arm Kit all day. That is the setup when you want the clean look and the flexibility to really dial your frame in.",
        },
        {
          id: "iris-hype-2",
          label: "Creator angle",
          focus: "Speak to aspirations",
          body:
            "Once you move from webcam territory into creator gear, Magic Arm Kit is usually the move. Way easier to get the shot looking right without the setup feeling hacked together.",
        },
        {
          id: "iris-hype-3",
          label: "Confident short reply",
          focus: "Fast public answer",
          body:
            "For that combo, Magic Arm Kit is the better play. More flexibility, cleaner positioning, less compromise.",
        },
      ],
    },
  },
  {
    id: "conv-nico",
    channelId: "email",
    customerName: "Nico Bauer",
    customerHandle: "nico@frameforge.studio",
    customerMeta: "Small production studio, Berlin",
    intent: "Compatibility check",
    status: "Needs reply",
    priority: "High",
    unreadCount: 1,
    updatedAt: "9 min ago",
    latestPreview:
      "Our desks have a thick edge and cable tray. Can your clamp still work, or should we avoid it?",
    latestCustomerMessage:
      "Our desks have a thick edge and cable tray. Can your clamp still work, or should we avoid it?",
    summary:
      "Nico is evaluating a studio order and needs a careful compatibility answer. This should sound precise and helpful, not salesy.",
    nextBestAction:
      "Acknowledge the desk limitation, ask for measurements, and avoid promising fit without seeing the edge profile.",
    tags: ["email", "studio order", "compatibility"],
    knowledgeIds: ["desk-clamp-fit", "single-rod-mount"],
    messages: [
      {
        id: "m4",
        authorType: "customer",
        authorName: "Nico Bauer",
        direction: "inbound",
        timestamp: "Yesterday, 18:40",
        body:
          "We are outfitting three edit bays and liked the cleaner single rod option.",
      },
      {
        id: "m5",
        authorType: "agent",
        authorName: "Monoblocc Team",
        direction: "outbound",
        timestamp: "Yesterday, 18:54",
        body:
          "Happy to help. If you share desk dimensions we can point you in the safest direction.",
      },
      {
        id: "m6",
        authorType: "customer",
        authorName: "Nico Bauer",
        direction: "inbound",
        timestamp: "Today, 09:05",
        body:
          "Our desks have a thick edge and cable tray. Can your clamp still work, or should we avoid it?",
      },
    ],
    drafts: {
      support: [
        {
          id: "nico-support-1",
          label: "Recommended",
          focus: "Careful and specific",
          body:
            "Thanks, Nico. We should confirm the desk profile before giving you a confident yes. Our standard clamp fits many desks up to about 55 mm, but a thick edge plus cable tray can change the fit. If you send a quick side photo or the desk thickness, we can advise properly.",
        },
        {
          id: "nico-support-2",
          label: "Measured",
          focus: "Reduce risk",
          body:
            "I would avoid promising fit until we see the edge profile. The clamp works on many desks, but thick edges and under-desk trays are exactly the cases where we like to verify first. A photo or thickness measurement would let us guide you accurately.",
        },
        {
          id: "nico-support-3",
          label: "Short",
          focus: "Fast reply",
          body:
            "We can likely advise this quickly, but we should confirm the desk edge before saying yes. Please send a side photo or thickness measurement and we will point you to the safest option.",
        },
      ],
      sales: [
        {
          id: "nico-sales-1",
          label: "Recommended",
          focus: "Helpful with momentum",
          body:
            "Thanks, Nico. We can help you spec this properly. Our standard clamp often fits desks up to about 55 mm, but with a thick edge and cable tray we should confirm first. If you send a side photo or thickness measurement, we can recommend the right setup for all three bays without guesswork.",
        },
        {
          id: "nico-sales-2",
          label: "Studio-friendly",
          focus: "Keep deal moving",
          body:
            "Best next step is a quick fit check so you do not order around an avoidable constraint. Send us the desk thickness or a side photo and we can map the cleanest option for the bays.",
        },
        {
          id: "nico-sales-3",
          label: "Soft consultative",
          focus: "Confidence builder",
          body:
            "We should verify the desk edge first, especially with the tray underneath. Once we have that, we can recommend the most reliable mount path for the whole studio instead of guessing from the product page alone.",
        },
      ],
      hype: [
        {
          id: "nico-hype-1",
          label: "Recommended",
          focus: "Energetic but professional",
          body:
            "This is exactly the kind of detail worth checking before you lock the setup in. Send us a quick side photo or thickness measurement and we can dial in the right call fast.",
        },
        {
          id: "nico-hype-2",
          label: "Snappier",
          focus: "Momentum",
          body:
            "We can get you to a confident answer quickly. Thick edge plus tray is the one case we like to verify first, so a side photo will let us steer you cleanly.",
        },
        {
          id: "nico-hype-3",
          label: "Short",
          focus: "Fast reassurance",
          body:
            "Worth checking before you commit. Send a side shot or desk thickness and we will tell you the cleanest route.",
        },
      ],
    },
  },
  {
    id: "conv-daria",
    channelId: "instagram-comments",
    customerName: "Daria Moss",
    customerHandle: "@dariaedits",
    customerMeta: "Short-form video editor, Toronto",
    intent: "Price objection",
    status: "Watching",
    priority: "Medium",
    unreadCount: 1,
    updatedAt: "7 min ago",
    latestPreview:
      "Looks nice, but what makes this better than the random arms on Amazon?",
    latestCustomerMessage:
      "Looks nice, but what makes this better than the random arms on Amazon?",
    summary:
      "Public comment with mild skepticism. Best response should defend value without sounding defensive or bloated.",
    nextBestAction:
      "Keep it short, answer on quality and stability, and avoid turning the reply into a spec sheet.",
    tags: ["public comment", "price objection", "value"],
    knowledgeIds: ["magic-arm-kit", "single-rod-mount", "creator-bundle"],
    messages: [
      {
        id: "m13",
        authorType: "customer",
        authorName: "Daria Moss",
        direction: "inbound",
        timestamp: "Today, 09:06",
        body:
          "Looks nice, but what makes this better than the random arms on Amazon?",
      },
    ],
    drafts: {
      support: [
        {
          id: "daria-support-1",
          label: "Recommended",
          focus: "Short value answer",
          body:
            "Fair question. The big difference is stability and adjustability for real daily setups, not just getting something to clamp to a desk once. Ours is built around cleaner positioning and a more reliable feel over time.",
        },
        {
          id: "daria-support-2",
          label: "Compact",
          focus: "Public reply",
          body:
            "Main difference is stability, cleaner movement, and a setup that feels built for daily use rather than a quick workaround.",
        },
        {
          id: "daria-support-3",
          label: "Invite follow-up",
          focus: "Open the conversation",
          body:
            "Totally fair. The short version is better stability and a cleaner setup experience. If you want, tell us what gear you are mounting and we can say whether it is worth it for your use case.",
        },
      ],
      sales: [
        {
          id: "daria-sales-1",
          label: "Recommended",
          focus: "Value positioning",
          body:
            "Fair question. The difference is less about a cheap clamp and more about how the whole setup feels in daily use: cleaner positioning, better stability, and easier adjustment when your desk rig is part of the workflow.",
        },
        {
          id: "daria-sales-2",
          label: "Creator angle",
          focus: "Workflow benefit",
          body:
            "Usually it comes down to how often you use it. If the rig is part of your daily setup, the stability and cleaner adjustment path are where the value shows up fast.",
        },
        {
          id: "daria-sales-3",
          label: "Soft close",
          focus: "Answer plus nudge",
          body:
            "Totally fair to ask. If you just need any arm, there are cheaper options. If you care about a cleaner, more stable setup that holds up in daily use, that is where ours earns the difference.",
        },
      ],
      hype: [
        {
          id: "daria-hype-1",
          label: "Recommended",
          focus: "Confident public voice",
          body:
            "Fair question. The difference is not just clamp versus clamp, it is whether the setup feels solid and dialed every day or like a workaround. We build for the first one.",
        },
        {
          id: "daria-hype-2",
          label: "Punchy",
          focus: "Short and sharp",
          body:
            "Better stability, cleaner movement, less compromise. That is the short version.",
        },
        {
          id: "daria-hype-3",
          label: "Creator-facing",
          focus: "Talk to quality",
          body:
            "If the setup matters every day, the difference shows up fast. Cleaner rig, better feel, less fighting the arm.",
        },
      ],
    },
  },
  {
    id: "conv-samira",
    channelId: "whatsapp",
    customerName: "Samira Collins",
    customerHandle: "+44 07 7412 1149",
    customerMeta: "Repeat buyer, London",
    intent: "Shipping follow-up",
    status: "Ready to send",
    priority: "Medium",
    unreadCount: 0,
    updatedAt: "14 min ago",
    latestPreview:
      "No stress, I just need to know if it has left yet because I am traveling Friday.",
    latestCustomerMessage:
      "No stress, I just need to know if it has left yet because I am traveling Friday.",
    summary:
      "Samira is calm but time-sensitive. Best response is concise, transparent, and human.",
    nextBestAction:
      "Confirm dispatch status clearly and set expectation without overpromising delivery timing.",
    tags: ["whatsapp", "shipping", "repeat buyer"],
    knowledgeIds: ["shipping-sla"],
    messages: [
      {
        id: "m7",
        authorType: "customer",
        authorName: "Samira Collins",
        direction: "inbound",
        timestamp: "Today, 08:44",
        body:
          "Hey, checking on order MB-4412. I saw the label created email but nothing else yet.",
      },
      {
        id: "m8",
        authorType: "internal",
        authorName: "Ops note",
        direction: "note",
        timestamp: "Today, 08:49",
        body:
          "Warehouse marked packed, courier handoff not confirmed in Shopify yet.",
      },
      {
        id: "m9",
        authorType: "customer",
        authorName: "Samira Collins",
        direction: "inbound",
        timestamp: "Today, 08:57",
        body:
          "No stress, I just need to know if it has left yet because I am traveling Friday.",
      },
    ],
    drafts: {
      support: [
        {
          id: "samira-support-1",
          label: "Recommended",
          focus: "Clear status",
          body:
            "Thanks for checking in. Your order is packed, but I do not see confirmed courier handoff yet, so I do not want to tell you it has left when it may still be at the warehouse. We are checking that now and will update you as soon as it is scanned through.",
        },
        {
          id: "samira-support-2",
          label: "Concise",
          focus: "WhatsApp-friendly",
          body:
            "Quick update: it is packed, but I cannot confirm courier handoff yet. I would rather be exact than guess. We are checking now and will update you as soon as it is scanned through.",
        },
        {
          id: "samira-support-3",
          label: "Warm",
          focus: "Human reassurance",
          body:
            "Totally understand. I can see it is packed, but I do not yet have the courier scan that confirms it has left. We are checking with the warehouse and will come back to you as soon as that is confirmed.",
        },
      ],
      sales: [
        {
          id: "samira-sales-1",
          label: "Recommended",
          focus: "Service retention",
          body:
            "Thanks for the nudge. Your order is packed, but I do not see confirmed courier handoff yet, so I do not want to overstate it. We are checking that now and will update you the moment we have the scan.",
        },
        {
          id: "samira-sales-2",
          label: "Polished",
          focus: "Calm confidence",
          body:
            "It is packed and moving through the final dispatch stage, but I do not have the courier scan yet. We are checking now so you get the exact status rather than a guess.",
        },
        {
          id: "samira-sales-3",
          label: "Short",
          focus: "Fast reassurance",
          body:
            "Packed yes, courier handoff not confirmed yet. We are checking now and will update you as soon as we have the scan.",
        },
      ],
      hype: [
        {
          id: "samira-hype-1",
          label: "Recommended",
          focus: "Warm and brisk",
          body:
            "On it. It is packed, but I do not have the courier scan yet, so I do not want to call it shipped too early. We are checking right now and will ping you as soon as it is confirmed.",
        },
        {
          id: "samira-hype-2",
          label: "Snappy",
          focus: "Mobile-friendly",
          body:
            "On it. Packed yes, handed off not confirmed yet. We are chasing the scan now and will update you as soon as it lands.",
        },
        {
          id: "samira-hype-3",
          label: "Quick",
          focus: "Very short",
          body:
            "Packed already, courier scan still pending. We are checking now and will update you as soon as it clears.",
        },
      ],
    },
  },
  {
    id: "conv-jules",
    channelId: "instagram-dm",
    customerName: "Jules Ortega",
    customerHandle: "@jules.builds",
    customerMeta: "Creator with 81k followers",
    intent: "Setup advice",
    status: "Needs reply",
    priority: "Medium",
    unreadCount: 1,
    updatedAt: "18 min ago",
    latestPreview:
      "I switch between overhead craft shots and face cam. Which setup changes fastest?",
    latestCustomerMessage:
      "I switch between overhead craft shots and face cam. Which setup changes fastest?",
    summary:
      "Jules wants fast repositioning between shot types. Strong chance of a creator bundle recommendation if framed around workflow speed.",
    nextBestAction:
      "Lead with flexibility, relate to creator workflow, and keep the tone more consultative than pushy.",
    tags: ["instagram dm", "creator", "workflow"],
    knowledgeIds: ["magic-arm-kit", "creator-bundle"],
    messages: [
      {
        id: "m10",
        authorType: "customer",
        authorName: "Jules Ortega",
        direction: "inbound",
        timestamp: "Today, 08:02",
        body:
          "Your rigs look cleaner than most of the clamp setups I see on here.",
      },
      {
        id: "m11",
        authorType: "ai",
        authorName: "Auto assistant",
        direction: "outbound",
        timestamp: "Today, 08:03",
        body:
          "Thanks for checking us out. Happy to help if you are comparing setups.",
      },
      {
        id: "m12",
        authorType: "customer",
        authorName: "Jules Ortega",
        direction: "inbound",
        timestamp: "Today, 08:38",
        body:
          "I switch between overhead craft shots and face cam. Which setup changes fastest?",
      },
    ],
    drafts: {
      support: [
        {
          id: "jules-support-1",
          label: "Recommended",
          focus: "Workflow answer",
          body:
            "For switching quickly between overhead and face cam, I would point you to the Magic Arm Kit. It is the easier option when fast repositioning matters more than a fixed minimal setup.",
        },
        {
          id: "jules-support-2",
          label: "Short",
          focus: "DM-friendly",
          body:
            "If speed between angles matters, Magic Arm Kit is usually the move. The single rod route is cleaner when the camera position stays more fixed.",
        },
        {
          id: "jules-support-3",
          label: "Ask one follow-up",
          focus: "Tailored advice",
          body:
            "For quick swaps between overhead and face cam, I would lean Magic Arm Kit. If you want, send your camera plus desk depth and we can suggest the cleanest layout too.",
        },
      ],
      sales: [
        {
          id: "jules-sales-1",
          label: "Recommended",
          focus: "Creator workflow",
          body:
            "For that kind of workflow, Magic Arm Kit is the one I would recommend. It is built for faster angle changes, so you are not rebuilding your setup every time you switch from overhead to face cam.",
        },
        {
          id: "jules-sales-2",
          label: "Bundle angle",
          focus: "Subtle upsell",
          body:
            "If you are moving between overhead and face cam a lot, Magic Arm Kit is usually the stronger choice. That is exactly the kind of use case where creators outgrow the simpler fixed mount path.",
        },
        {
          id: "jules-sales-3",
          label: "Tighter",
          focus: "Fast reply",
          body:
            "Magic Arm Kit is usually the better fit for that. It gives you quicker repositioning when your setup has to keep up with the content, not slow it down.",
        },
      ],
      hype: [
        {
          id: "jules-hype-1",
          label: "Recommended",
          focus: "Creator energy",
          body:
            "For overhead to face cam jumps, Magic Arm Kit is the play. It keeps the setup flexible so the rig moves with the shoot instead of slowing you down.",
        },
        {
          id: "jules-hype-2",
          label: "Punchy",
          focus: "Short creator voice",
          body:
            "Magic Arm Kit for sure. Best move if your camera needs to bounce between angles fast.",
        },
        {
          id: "jules-hype-3",
          label: "Aspirational",
          focus: "Content flow",
          body:
            "If your setup needs to flip between overhead and face cam without killing momentum, Magic Arm Kit is the one I would start with.",
        },
      ],
    },
  },
  {
    id: "conv-omar",
    channelId: "email",
    customerName: "Omar Reed",
    customerHandle: "omar@northbaypost.com",
    customerMeta: "Remote podcast editor, California",
    intent: "Return policy",
    status: "Needs reply",
    priority: "Low",
    unreadCount: 1,
    updatedAt: "26 min ago",
    latestPreview:
      "If the clamp does not work with my desk, can I still return it after testing fit?",
    latestCustomerMessage:
      "If the clamp does not work with my desk, can I still return it after testing fit?",
    summary:
      "Omar is cautious, not upset. Best reply should reduce purchase friction while staying accurate on policy.",
    nextBestAction:
      "Confirm the return path in plain language and offer a fit check before he orders.",
    tags: ["email", "returns", "pre-purchase"],
    knowledgeIds: ["desk-clamp-fit", "shipping-sla"],
    messages: [
      {
        id: "m14",
        authorType: "customer",
        authorName: "Omar Reed",
        direction: "inbound",
        timestamp: "Today, 07:48",
        body:
          "I like the design, but my desk edge is unusual and I do not want to get stuck with the wrong thing.",
      },
      {
        id: "m15",
        authorType: "customer",
        authorName: "Omar Reed",
        direction: "inbound",
        timestamp: "Today, 08:31",
        body:
          "If the clamp does not work with my desk, can I still return it after testing fit?",
      },
    ],
    drafts: {
      support: [
        {
          id: "omar-support-1",
          label: "Recommended",
          focus: "Reduce friction carefully",
          body:
            "Yes, if the clamp is not a fit for your desk we can help you through the return path. If you want to reduce the guesswork first, send us a quick side photo or desk thickness and we can flag any compatibility concerns before you order.",
        },
        {
          id: "omar-support-2",
          label: "Plainspoken",
          focus: "Simple answer",
          body:
            "Yes, if it does not fit your desk we can help with the return process. If you would like, send us a side photo first and we can try to catch any fit issue before you order.",
        },
        {
          id: "omar-support-3",
          label: "Short",
          focus: "Fast reassurance",
          body:
            "Yes, we can help if the clamp is not compatible with your desk. Happy to do a quick fit check first if you send a photo or measurement.",
        },
      ],
      sales: [
        {
          id: "omar-sales-1",
          label: "Recommended",
          focus: "Reassure and keep momentum",
          body:
            "Yes, if the clamp turns out not to be right for your desk we can help with the return path. Easiest next step is a quick fit check before you order. Send us a side photo or desk thickness and we can steer you with a lot more confidence.",
        },
        {
          id: "omar-sales-2",
          label: "Consultative",
          focus: "Avoid friction",
          body:
            "You would not be stuck if the clamp is not compatible, but we can usually reduce that risk upfront with a quick fit check. If you send a photo or measurement, we can advise before you place the order.",
        },
        {
          id: "omar-sales-3",
          label: "Short",
          focus: "Keep it moving",
          body:
            "Yes, we can help if the fit is wrong. If you want to avoid the back-and-forth, send a quick desk photo and we will sanity-check it first.",
        },
      ],
      hype: [
        {
          id: "omar-hype-1",
          label: "Recommended",
          focus: "Friendly confidence",
          body:
            "Yes, you would have a path if the clamp is not right for your desk. Even better, send us a quick photo first and we can usually spot fit issues before you order.",
        },
        {
          id: "omar-hype-2",
          label: "Snappy",
          focus: "Low pressure",
          body:
            "Yes, you are not locked in if the fit is wrong. Happy to do a quick desk check first so you have more confidence going in.",
        },
        {
          id: "omar-hype-3",
          label: "Short",
          focus: "Very concise",
          body:
            "Yes. And if you want, send a desk photo first and we can usually catch any fit problem before you order.",
        },
      ],
    },
  },
];
