import { useMemo, useState } from "react";
import type { Gem, Order } from "../types";
import { orderToleranceRange, releaseEvaluation } from "../rules";

interface Props {
  gem: Gem;
  orders: Order[];
  gems: Gem[];
  onClose: () => void;
  // 确认结果：true=放行占镶位，false=换货（不占数量）
  onConfirm: (orderId: string, pass: boolean) => void;
}

export default function DispatchModal({
  gem,
  orders,
  gems,
  onClose,
  onConfirm,
}: Props) {
  const [orderId, setOrderId] = useState(
    gem.orderId ?? orders[0]?.id ?? ""
  );

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId]
  );
  const evaluation = useMemo(
    () => (order ? releaseEvaluation(gem, order, gems) : null),
    [gem, order, gems]
  );
  const blockedByIdentity = (evaluation?.identity.length ?? 0) > 0;
  const blockedByQuality = (evaluation?.quality.length ?? 0) > 0;
  const full = evaluation?.full ?? false;

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>核对派石 · {gem.stoneNo}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="dispatch-summary">
          <span>{gem.packageNo} 包</span>
          <span>{gem.shape}</span>
          <span>{gem.carat}ct</span>
          <span>
            {gem.length}×{gem.width}mm
          </span>
          <span>{gem.color} 色</span>
          <span>{gem.clarity}</span>
          <span>证书 {gem.certNo || "—"}</span>
          <span>腰码 {gem.girdleCode || "缺失"}</span>
        </div>

        <label className="dispatch-order">
          <span>目标订单</span>
          <select
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} · {o.title}（{o.shape} {o.targetSize}mm 最低 {o.minColor}{" "}
                / 需 {o.need}）
              </option>
            ))}
          </select>
        </label>

        {order && (
          <div className="check-block">
            <h3>① 身份核对</h3>
            {blockedByIdentity ? (
              <ul className="issue-list bad">
                {evaluation!.identity.map((i) => (
                  <li key={i.code}>
                    <b>{i.label}</b>
                    <span>{i.detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="issue-list ok">证书号唯一、腰码齐全、编号无跨包重复</p>
            )}

            <h3>② 订单质量核对</h3>
            <p className="order-spec">
              要求 {order.shape} {order.targetSize}mm，公差 ±
              {order.toleranceMm}mm（{orderToleranceRange(order).lengthMin}~
              {orderToleranceRange(order).lengthMax} ×{" "}
              {orderToleranceRange(order).widthMin}~
              {orderToleranceRange(order).widthMax}），最低 {order.minColor} 色级
            </p>
            {blockedByQuality ? (
              <ul className="issue-list bad">
                {evaluation!.quality.map((i) => (
                  <li key={i.code}>
                    <b>{i.label}</b>
                    <span>{i.detail}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="issue-list ok">形状、尺寸、色级均满足订单</p>
            )}
          </div>
        )}

        <div className="modal-foot split">
          <button
            className="danger"
            disabled={blockedByIdentity}
            title={
              blockedByIdentity ? "身份未核对通过，不能派石或标记换货" : ""
            }
            onClick={() => onConfirm(orderId, false)}
          >
            不达标 · 标记换货（原记录保留，不占数量）
          </button>
          <button
            className="primary"
            disabled={blockedByIdentity || blockedByQuality || full}
            title={
              blockedByIdentity
                ? "身份核对未通过，留在待核对"
                : blockedByQuality
                  ? "质量不达标，只能标记换货"
                  : full
                    ? "该订单镶位已满"
                    : ""
            }
            onClick={() => onConfirm(orderId, true)}
          >
            核对通过 · 放行占镶位
          </button>
        </div>
        {blockedByIdentity && (
          <p className="form-error">
            身份异常：该石只能留在「待核对」，请先补证/核实编号后再派石。
          </p>
        )}
      </div>
    </div>
  );
}
