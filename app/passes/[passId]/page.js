import DigitalPass from "@/components/passes/DigitalPass";

export default async function PassPage({ params }) {
  const { passId } = await params;
  return <main className="relative min-h-[100dvh] overflow-x-hidden text-white"><DigitalPass passId={passId} /></main>;
}
