import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "udika-erp",
  eventKey: process.env.INNGEST_EVENT_KEY,
})
