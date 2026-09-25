"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

export default function GenerateQRPage() {
  const [tableNumber, setTableNumber] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [orderUrl, setOrderUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function openTable() {
    const table = tableNumber.trim();

    if (!table) {
      setMessage("กรุณากรอกหมายเลขโต๊ะ");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { data: existing, error: existingError } = await supabase
        .from("sessions")
        .select("*")
        .eq("table_number", table)
        .eq("status", "open")
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        setMessage("โต๊ะนี้เปิดใช้งานอยู่แล้ว");
        const url = `${window.location.origin}/order/${encodeURIComponent(table)}`;
        setOrderUrl(url);
        setQrUrl(await QRCode.toDataURL(url));
        return;
      }

      const { error } = await supabase.from("sessions").insert({
        table_number: table,
        status: "open",
      });

      if (error) throw error;

      const url = `${window.location.origin}/order/${encodeURIComponent(table)}`;
      setOrderUrl(url);
      setQrUrl(await QRCode.toDataURL(url));
      setMessage("เปิดโต๊ะและสร้าง QR เรียบร้อย");
    } catch (error) {
      setMessage(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>เปิดโต๊ะ / สร้าง QR</h1>

      <div className="card">
        <label>
          หมายเลขโต๊ะ
          <br />
          <input
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="เช่น 01"
          />
        </label>

        <br />
        <br />

        <button onClick={openTable} disabled={loading}>
          {loading ? "กำลังสร้าง..." : "เปิดโต๊ะ"}
        </button>

        {message && <p>{message}</p>}
      </div>

      {qrUrl && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>QR โต๊ะ {tableNumber}</h2>
          <img src={qrUrl} alt={`QR โต๊ะ ${tableNumber}`} width={300} />
          <p className="muted">{orderUrl}</p>
        </div>
      )}
    </main>
  );
}
