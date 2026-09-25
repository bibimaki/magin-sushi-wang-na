"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const [ordersResult, sessionsResult] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .gte("created_at", start.toISOString()),
      supabase.from("sessions").select("*"),
    ]);

    if (ordersResult.error || sessionsResult.error) {
      setMessage(
        ordersResult.error?.message || sessionsResult.error?.message
      );
      setLoading(false);
      return;
    }

    setOrders(ordersResult.data || []);
    setSessions(sessionsResult.data || []);
    setLoading(false);
  }

  const sales = orders
    .filter((order) => ["ready", "served"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.total), 0);

  const activeTables = sessions.filter(
    (session) => session.status === "open"
  ).length;

  const itemCount = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (itemSum, item) => itemSum + Number(item.quantity),
        0
      ),
    0
  );

  if (loading) {
    return <main className="container">กำลังโหลด Dashboard...</main>;
  }

  return (
    <main className="container">
      <h1>📊 Dashboard — ซูชิวังหน้า</h1>

      {message && <p className="error">{message}</p>}

      <div className="grid grid-3">
        <div className="card">
          <h2>ยอดขายวันนี้</h2>
          <p>{sales.toLocaleString()} บาท</p>
        </div>

        <div className="card">
          <h2>จำนวนออเดอร์</h2>
          <p>{orders.length}</p>
        </div>

        <div className="card">
          <h2>โต๊ะที่ใช้งาน</h2>
          <p>{activeTables}</p>
        </div>

        <div className="card">
          <h2>จำนวนรายการอาหาร</h2>
          <p>{itemCount}</p>
        </div>
      </div>
    </main>
  );
}
