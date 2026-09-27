import { STATUS_LIST, type StoneStatus } from "../rules/sorting";

export type StatusFilter = "ALL" | StoneStatus;

interface Props {
  parcelNos: string[];
  parcelFilter: string;
  statusFilter: StatusFilter;
  onParcelChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onReset: () => void;
}

export default function FilterBar({
  parcelNos,
  parcelFilter,
  statusFilter,
  onParcelChange,
  onStatusChange,
  onReset,
}: Props) {
  return (
    <section className="filter-bar">
      <label>
        <span>包裹</span>
        <select value={parcelFilter} onChange={(e) => onParcelChange(e.target.value)}>
          <option value="ALL">全部包裹</option>
          {parcelNos.map((no) => (
            <option key={no} value={no}>
              {no}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>状态</span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
        >
          <option value="ALL">全部状态</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button className="ghost" onClick={onReset}>
        重置核对记录
      </button>
    </section>
  );
}
