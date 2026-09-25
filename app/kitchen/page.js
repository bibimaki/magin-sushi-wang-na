"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const columns = [
  { status: "received", title: "ออเดอร์ใหม่" },
  { status: "preparing", title: "กำลังทำ" },
  { status: "ready", title: "พร้อมเสิร์ฟ" },
];

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => loadOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .neq("status", "served")
      .order("created_at", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setOrders(data || []);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadOrders();
  }

  function OrderCard({ order }) {
    return (
      <div className="card" style={{ marginBottom: 12 }}>
        <h3>โต๊ะ {order.table_number}</h3>
        <small>
          {new Date(order.created_at).toLocaleString("th-TH")}
        </small>

        <div style={{ marginTop: 10 }}>
          {order.items.map((item, index) => (
            <div key={index}>
              {item.name} × {item.quantity}
            </div>
          ))}
        </div>

        <p>
          <strong>{Number(order.total).toLocaleString()} บาท</strong>
        </p>

        {order.status === "received" && (
          <button onClick={() => updateStatus(order.id, "preparing")}>
            เริ่มทำ
          </button>
        )}

        {order.status === "preparing" && (
          <button onClick={() => updateStatus(order.id, "ready")}>
            ทำเสร็จแล้ว
          </button>
        )}

        {order.status === "ready" && (
          <button onClick={() => updateStatus(order.id, "served")}>
            จัดเสิร์ฟแล้ว
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="container">
      <h1>👨‍🍳 จอจัดออเดอร์ — ครัวซูชิวังหน้า</h1>

      {message && <p className="error">{message}</p>}

      <div className="grid grid-3">
        {columns.map((column) => (
          <section key={column.status}>
            <h2>{column.title}</h2>

            {orders
              .filter((order) => order.status === column.status)
              .map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </section>
        ))}
      </div>
    </main>
  );
}
