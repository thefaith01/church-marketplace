import { redirect } from "next/navigation";

// No public directory of all churches. Individual church pages (/churches/[id])
// and invite links (/join/[code]) remain shareable by URL.
export default function ChurchesIndex() {
  redirect("/");
}
