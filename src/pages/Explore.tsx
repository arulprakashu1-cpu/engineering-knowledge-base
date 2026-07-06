import { Boxes } from "lucide-react";
import type { Entry, Theme } from "../types";
import { EmptyState } from "../lib";
import { InterfaceGalaxy } from "../three/InterfaceGalaxy";
import type { InterfaceStat } from "./Dashboard";

export function Explore({
  entries, goToInterface, theme,
}: {
  entries: Entry[];
  goToInterface: (name: string) => void;
  theme: Theme;
}) {
  // Dynamic: nodes come from the interfaces actually present in the entries.
  const interfaceNames = Array.from(new Set(entries.map((e) => e.interface).filter(Boolean)));
  const perInterface: InterfaceStat[] = interfaceNames.map((name) => {
    const list = entries.filter((e) => e.interface === name);
    return {
      name,
      total: list.length,
      lessons: list.filter((e) => e.types.includes("Lesson Learned")).length,
      checklists: list.filter((e) => e.types.includes("Checklist")).length,
      requirements: list.filter((e) => e.types.includes("Requirement")).length,
    };
  });

  return (
    <div className="page explore-page">
      <div className="page-head">
        <div className="page-title"><span className="page-title-icon"><Boxes size={19} /></span><h1>3D Interface Explorer</h1></div>
        <p className="page-sub">Fly through the interface constellation — each node is an interface sized by how much you've captured about it. Click one to dive into its entries.</p>
      </div>
      {perInterface.length === 0 ? (
        <div className="panel"><EmptyState icon={<Boxes size={22} strokeWidth={1.5} />} title="Nothing to explore yet" note="Add some entries and their interfaces will appear here as an orbitable constellation." /></div>
      ) : (
        <div className="galaxy-stage">
          <InterfaceGalaxy
            perInterface={perInterface}
            onSelect={goToInterface}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}
