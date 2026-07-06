import { ArrowLeft, Tag as TagIcon, Paperclip, ChevronRight, FileText, PencilLine, Trash2 } from "lucide-react";
import type { Entry, KnowledgeType } from "../types";
import { fmtDate, fileIcon, renderContent, TraceDivider, TypeBadge } from "../lib";

export function KnowledgeDetail({
  entry, entries, goBack, goToEntry, currentUserId, onEdit, onDelete,
}: {
  entry: Entry | null;
  entries: Entry[];
  goBack: () => void;
  goToEntry: (id: string) => void;
  currentUserId: number;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}) {
  if (!entry) return null;
  const canModify = entry.ownerId === currentUserId;
  const related = (type: KnowledgeType) =>
    entries.filter((e) => e.id !== entry.id && e.interface === entry.interface && e.types.includes(type)).slice(0, 4);

  const buckets: { label: string; type: KnowledgeType }[] = [
    { label: "Related Requirements", type: "Requirement" },
    { label: "Related Checklists", type: "Checklist" },
    { label: "Related Lessons Learned", type: "Lesson Learned" },
    { label: "Related References", type: "Reference" },
  ];

  return (
    <div className="page">
      <button className="back-link" onClick={goBack}><ArrowLeft size={14} /> Back</button>

      <div className="detail-head">
        <div className="page-title"><span className="page-title-icon"><FileText size={19} /></span><h1>{entry.title}</h1></div>
        <div className="detail-head-right">
          {canModify && (
            <div className="detail-actions">
              <button className="btn-ghost" onClick={() => onEdit(entry)}><PencilLine size={14} /> Edit</button>
              <button className="btn-danger-ghost" onClick={() => onDelete(entry)}><Trash2 size={14} /> Delete</button>
            </div>
          )}
          <div className="detail-types">{entry.types.map((t) => <TypeBadge key={t} type={t} />)}</div>
        </div>
      </div>

      <div className="detail-meta-grid">
        <div><span className="meta-label">Interface</span><span className="meta-value">{entry.interface}</span></div>
        <div><span className="meta-label">IC</span><span className="meta-value mono">{entry.ic || "—"}</span></div>
        <div><span className="meta-label">Project</span><span className="meta-value">{entry.project || "—"}</span></div>
        <div><span className="meta-label">Created</span><span className="meta-value">{fmtDate(entry.createdDate)}</span></div>
        <div><span className="meta-label">Modified</span><span className="meta-value">{fmtDate(entry.modifiedDate)}</span></div>
        <div><span className="meta-label">Created by</span><span className="meta-value">{entry.createdBy}</span></div>
      </div>

      {entry.tags.length > 0 && (
        <div className="detail-tags">
          {entry.tags.map((t) => <span key={t} className="tag-chip static"><TagIcon size={10} />{t}</span>)}
        </div>
      )}

      <TraceDivider />

      <div className="detail-body">{renderContent(entry.content)}</div>

      {entry.attachments.length > 0 && (
        <section className="panel">
          <div className="panel-head"><Paperclip size={14} /><h2>Attachments</h2></div>
          <div className="attachment-list">
            {entry.attachments.map((a, idx) => (
              <div className="attachment-item static" key={idx}>{fileIcon(a.type)}<span>{a.name}</span></div>
            ))}
          </div>
        </section>
      )}

      <div className="related-grid">
        {buckets.map(({ label, type }) => {
          const list = related(type);
          return (
            <section className="panel" key={type}>
              <div className="panel-head"><h2>{label}</h2></div>
              {list.length === 0 ? (
                <div className="panel-empty">None yet</div>
              ) : (
                <div className="row-list compact">
                  {list.map((e) => (
                    <button className="row-item" key={e.id} onClick={() => goToEntry(e.id)}>
                      <div className="row-item-main">
                        <span className="row-item-title">{e.title}</span>
                      </div>
                      <ChevronRight size={13} className="row-item-chevron" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
