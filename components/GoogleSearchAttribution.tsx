export default function GoogleSearchAttribution({ html }: { html?: string }) {
  if (!html) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-[#E6EAE5] bg-white">
      <iframe
        title="Saran Google Search"
        srcDoc={html}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        className="h-10 w-full border-0 bg-white"
      />
    </div>
  );
}
