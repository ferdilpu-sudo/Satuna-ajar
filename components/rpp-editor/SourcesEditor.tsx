import type { RPPData } from '../../types/rpp';
import { EditorSection, LineListEditor } from './EditorPrimitives';

export default function SourcesEditor({ rpp, onChange }: { rpp: RPPData; onChange: (rpp: RPPData) => void }) {
  return <EditorSection title="Sumber Belajar" description="Sumber riset web ter-grounding tetap dikunci; saran sumber belajar dapat disunting.">
    <div className="grid gap-3 sm:grid-cols-2">
      <LineListEditor label="Sumber Utama" values={rpp.sourcesUsed || []} onChange={(sourcesUsed) => onChange({ ...rpp, sourcesUsed })} />
      <LineListEditor label="Sumber Belajar Lainnya" values={rpp.facilities?.learningSources || []} onChange={(learningSources) => onChange({ ...rpp, facilities: { ...rpp.facilities, learningSources } })} />
    </div>
    {rpp.researchSources?.length ? <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-[11px] text-blue-900"><b>Sumber riset web dikunci:</b> {rpp.researchSources.length} sumber dari grounding Google Search tidak dapat diedit dari mode review.</div> : null}
  </EditorSection>;
}
