"use client";

import { useState, useRef, useEffect } from "react";

// Pattern: Mock AI assistant — in production, this would call the Anthropic SDK
// via a server action. For the preview, we use pattern-matched FAQ responses.

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FAQ_RESPONSES: Record<string, string> = {
  // Keywords → responses for common PCRS questions
  "duplicate|clawback": `**Handling Duplicate Claims & Clawback Risk**

1. Log into PCRS Online (GP Suite) at sspcrs.ie
2. Go to Claims History and search for the flagged claim codes
3. For genuine duplicates: submit a void request BEFORE the next reconciliation
4. For legitimate repeat visits: add distinguishing clinical notes to each claim

⏱ **Deadline:** Void requests must be submitted before the next PCRS payment cycle (usually monthly).

💡 **Tip:** Set a calendar reminder 5 days before each reconciliation date to review flagged claims.`,

  "cdm|chronic disease": `**Chronic Disease Management (CDM) Claiming**

CDM claims are worth **€150 per patient per year** for structured reviews of diabetes, COPD, CVD, and asthma.

**How to submit:**
1. Identify eligible GMS patients with chronic conditions in your practice management system
2. Conduct structured CDM reviews using the approved template
3. Submit data returns via your practice management software (NOT GP Suite)
4. Returns are submitted **quarterly**

📋 **Programme guide:** hse.ie/cdm-programme

💡 **Quick win:** Most practices with 300+ GMS patients should have 100+ CDM claims per year. If you have fewer than 20, you're significantly under-claiming.`,

  "stc|special type|consultation": `**Special Type Consultations (STCs)**

STCs are fee-per-service claims submitted through GP Suite (sspcrs.ie).

**Common STC categories:**
• Excisions & minor surgery
• Suturing
• ECGs & spirometry
• Vaccinations (also via GP Suite)
• Out-of-hours consultations
• Domiciliary visits

**How to submit:**
1. Log into GP Suite at sspcrs.ie
2. Navigate to Claims → New STC Claim
3. Enter patient details, procedure code, and date
4. Submit — payment appears on your next schedule

💡 **Tip:** Review every procedural consultation from the past month. If no STC was claimed, you may be missing revenue.`,

  "heartwatch": `**Heartwatch Programme**

Heartwatch provides structured secondary prevention for patients with established cardiovascular disease.

**Eligibility:** Practices must be registered with PCRS for Heartwatch. Contact PCRS on 01 864 7100 to check your status.

**Claiming:**
1. Identify patients on your CVD register
2. Conduct annual Heartwatch review using the structured template
3. Submit claims via GP Suite as STC item codes
4. Target: 85%+ of eligible patients reviewed annually

💡 **Typical value:** €8,000–12,000/year for a mid-size practice.`,

  "contact|phone|email|pcrs office": `**PCRS Contact Information**

📞 **Phone:** 01 864 7100 (Mon–Fri, 9:00–17:00)
📧 **Email:** pcrs@hse.ie
📍 **Address:** PCRS, Exit 5 M50, North Road, Finglas, Dublin 11, D11 XKF3
🌐 **GP Suite:** sspcrs.ie

**For regional HSE queries**, use the Contacts & Directory tab to find your local HSE Health Region office.`,

  "form|download|submit": `**PCRS Claim Submission Methods**

| Claim Type | How to Submit |
|-----------|---------------|
| **GMS Capitation** | Automatic via panel registration |
| **STCs** | GP Suite (sspcrs.ie) |
| **CDM** | Practice management software data return |
| **Vaccinations** | GP Suite online |
| **Special Items of Service** | GP Suite (sspcrs.ie) |

📋 **Key resources:**
• GP Circulars: hse.ie/pcrs/circulars/gp
• Doctors Handbook: hse.ie (PDF download)
• CDM Programme: hse.ie/cdm-programme

💡 There are no paper forms — all PCRS claims are submitted electronically.`,

  "vaccination|immunisation|vaccine": `**Vaccination Claims**

Vaccinations are claimed through GP Suite (sspcrs.ie) — either individually or in batches.

**Key points:**
• Ensure batch numbers are recorded for every vaccination
• Claims can be submitted individually or as a batch upload
• Flu vaccine, COVID boosters, childhood immunisations all go through GP Suite
• Missing batch numbers can delay payment

📞 **Vaccine queries:** Contact PCRS on 01 864 7100`,

  "gms|capitation|panel": `**GMS Capitation Payments**

GMS capitation is the base payment for each registered GMS patient. It's **automatic** — you don't need to submit claims.

**What to check:**
• Your GMS panel is up to date (patients registered/deregistered correctly)
• Age-weighted capitation reflects your actual patient demographics
• Distance coding is correct for rural practices

💡 **Panel management** is done through your local HSE office, not PCRS directly. Use the county lookup in the Contacts tab to find your regional office.`,
};

function matchFAQ(input: string): string {
  const lower = input.toLowerCase();
  for (const [pattern, response] of Object.entries(FAQ_RESPONSES)) {
    const keywords = pattern.split("|");
    if (keywords.some((kw) => lower.includes(kw))) {
      return response;
    }
  }
  return `I can help with PCRS claims questions. Try asking about:

• **Duplicate claims** and clawback prevention
• **CDM** (Chronic Disease Management) claiming
• **STCs** (Special Type Consultations)
• **Heartwatch** programme
• **Vaccinations** and batch numbers
• **GMS capitation** and panel management
• **PCRS contact** details
• **How to submit** different claim types

Just type your question and I'll guide you through the process.`;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your PCRS Claims Assistant. I can help you with claim submission processes, PCRS contacts, form requirements, and step-by-step guidance.\n\nWhat would you like help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Simulate a brief delay for realism
    setTimeout(() => {
      const response = matchFAQ(userMessage);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    }, 400);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        aria-label="Open PCRS Assistant"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col rounded-xl border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b px-4 py-3 bg-primary/5 rounded-t-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold">PCRS Claims Assistant</p>
              <p className="text-xs text-muted-foreground">
                Ask about claims, forms, contacts
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t px-3 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about PCRS claims..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Powered by AI — verify critical information with PCRS directly
            </p>
          </div>
        </div>
      )}
    </>
  );
}
