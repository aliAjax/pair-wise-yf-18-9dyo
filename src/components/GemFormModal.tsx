import { useState } from "react";
import type { Gem, ClarityGrade, ColorGrade, GemShape } from "../types";
import { CLARITY_GRADES, COLOR_GRADES, SHAPES } from "../rules";

interface Props {
  initial: Gem | null;
  packages: string[];
  onClose: () => void;
  onSave: (data: Omit<Gem, "id" | "stage" | "orderId" | "history">) => void;
}

export type GemFormData = Omit<Gem, "id" | "stage" | "orderId" | "history">;

const emptyForm = (pkg: string): GemFormData => ({
  packageNo: pkg,
  stoneNo: "",
  girdleCode: "",
  shape: "椭圆",
  carat: 0,
  length: 0,
  width: 0,
  color: "H",
  clarity: "VS1",
  certNo: "",
  note: "",
});

export default function GemFormModal({
  initial,
  packages,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<GemFormData>(
    initial
      ? {
          packageNo: initial.packageNo,
          stoneNo: initial.stoneNo,
          girdleCode: initial.girdleCode,
          shape: initial.shape,
          carat: initial.carat,
          length: initial.length,
          width: initial.width,
          color: initial.color,
          clarity: initial.clarity,
          certNo: initial.certNo,
          note: initial.note,
        }
      : emptyForm(packages[0] ?? "")
  );
  const [error, setError] = useState("");

  const set = <K extends keyof GemFormData>(key: K, value: GemFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.packageNo.trim()) return setError("请填写包裹号");
    if (!form.stoneNo.trim()) return setError("请填写编号");
    if (!form.certNo.trim()) return setError("请填写证书号（缺失属待核对项）");
    if (!(form.carat > 0)) return setError("克拉重量需大于 0");
    if (!(form.length > 0 && form.width > 0))
      return setError("尺寸需大于 0");
    onSave({
      ...form,
      packageNo: form.packageNo.trim(),
      stoneNo: form.stoneNo.trim(),
      girdleCode: form.girdleCode.trim(),
      certNo: form.certNo.trim(),
    });
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial ? "编辑登记" : "新到裸石登记"}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>
        <div className="form-grid">
          <label>
            <span>包裹号 *</span>
            <input
              list="package-list"
              value={form.packageNo}
              onChange={(e) => set("packageNo", e.target.value)}
              placeholder="如 PK2609A"
            />
          </label>
          <label>
            <span>编号 *</span>
            <input
              value={form.stoneNo}
              onChange={(e) => set("stoneNo", e.target.value)}
              placeholder="如 SB-0918"
            />
          </label>
          <label>
            <span>腰码</span>
            <input
              value={form.girdleCode}
              onChange={(e) => set("girdleCode", e.target.value)}
              placeholder="腰棱激光码，缺失留空"
            />
          </label>
          <label>
            <span>证书号 *</span>
            <input
              value={form.certNo}
              onChange={(e) => set("certNo", e.target.value)}
              placeholder="如 GIA-24810918"
            />
          </label>
          <label>
            <span>形状</span>
            <select
              value={form.shape}
              onChange={(e) => set("shape", e.target.value as GemShape)}
            >
              {SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>克拉 (ct)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.carat || ""}
              onChange={(e) => set("carat", Number(e.target.value))}
            />
          </label>
          <label>
            <span>长径 / 直径 (mm)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.length || ""}
              onChange={(e) => set("length", Number(e.target.value))}
            />
          </label>
          <label>
            <span>短径 (mm)，圆形同直径</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.width || ""}
              onChange={(e) => set("width", Number(e.target.value))}
            />
          </label>
          <label>
            <span>颜色等级</span>
            <select
              value={form.color}
              onChange={(e) => set("color", e.target.value as ColorGrade)}
            >
              {COLOR_GRADES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>净度</span>
            <select
              value={form.clarity}
              onChange={(e) =>
                set("clarity", e.target.value as ClarityGrade)
              }
            >
              {CLARITY_GRADES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="full">
            <span>备注</span>
            <input
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="证书疑点、供应商说明等"
            />
          </label>
        </div>
        <datalist id="package-list">
          {packages.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-foot">
          <button onClick={onClose}>取消</button>
          <button className="primary" onClick={submit}>
            保存登记
          </button>
        </div>
      </div>
    </div>
  );
}
