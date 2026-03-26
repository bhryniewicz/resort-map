import ResortMap from "@/components/resort-map";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-800 font-sans min-h-screen">
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-semibold mb-6 text-zinc-100">
          Resort Map
        </h1>
        <ResortMap />
      </main>
    </div>
  );
}
