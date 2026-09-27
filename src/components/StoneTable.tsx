import type { EvaluatedStone, StoneStatus } from "../rules/sorting";

const STATUS_CLASS: Record<StoneStatus, string> = {
  待核对: "badge-pending",
  待镶嵌: "badge-released",
  待换货: "badge-exchange",
};

interface Props {
  stones: EvaluatedStone[];
  onApprove: (stone: EvaluatedStone) => void;
  onRevoke: (stone: EvaluatedStone) => void;
}

export default function StoneTable({ stones, onApprove, onRevoke }: Props) {
  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>到货台账</p>
          <h2>裸石登记（{stones.length} 颗）</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>包裹号</th>
              <th>编号</th>
              <th>形状</th>
              <th>克拉</th>
              <th>尺寸 (mm)</th>
              <th>颜色</th>
              <th>净度</th>
              <th>证书号</th>
              <th>腰码</th>
              <th>状态</th>
              <th>问题说明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {stones.map((s) => (
              <tr key={s.key}>
                <td>{s.parcelNo}</td>
                <td className="mono">{s.id}</td>
                <td>{s.shape}</td>
                <td>{s.carat.toFixed(2)}</td>
                <td className="mono">{s.size}</td>
                <td>{s.color}</td>
                <td>{s.clarity}</td>
                <td className="mono">{s.cert || "—"}</td>
                <td className="mono">
                  {s.girdle ? s.girdle : <span className="warn-text">缺失</span>}
                </td>
                <td>
                  <span className={`badge ${STATUS_CLASS[s.status]}`}>{s.status}</span>
                </td>
                <td className="reasons">
                  {s.reasons.length > 0 ? (
                    s.reasons.map((r) => <div key={r}>{r}</div>)
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td className="actions">
                  {s.status === "待核对" && (
                    <button className="primary small" onClick={() => onApprove(s)}>
                      核对通过
                    </button>
                  )}
                  {s.manualApproved && (
                    <button className="ghost small" onClick={() => onRevoke(s)}>
                      撤销核对
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {stones.length === 0 && (
              <tr>
                <td colSpan={12} className="empty">
                  当前筛选条件下没有宝石
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
