import RiskFlag from "@/models/RiskFlag";

export async function evaluateEventRisk(event, promoter) {
  const rules = [];
  if ((promoter?.completedEventCount || 0) < 2 && event.capacity > 500) {
    rules.push({ rule: "large_new_promoter", severity: "high", explanation: "A promoter with fewer than two completed events listed capacity above 500." });
  }
  if (event.priceAmount > 25000) {
    rules.push({ rule: "unusual_price", severity: "medium", explanation: "The listed entry price exceeds ₹25,000 and requires review." });
  }
  const eventDate = new Date(`${event.dateISO}T00:00:00Z`);
  if (eventDate.getTime() - Date.now() < 48 * 60 * 60 * 1000) {
    rules.push({ rule: "last_minute_change", severity: "medium", explanation: "The event was created or materially updated within 48 hours of its date." });
  }
  await Promise.all(rules.map((flag) => RiskFlag.updateOne(
    { eventId: event.eventId, rule: flag.rule },
    { $setOnInsert: { ...flag, eventId: event.eventId, promoterProfileId: event.ownerProfileId } },
    { upsert: true },
  )));
  return rules;
}
