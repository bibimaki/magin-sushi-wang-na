"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OrderPage() {
  const params = useParams();
  const tableNumber = decodeURIComponent(params.tableNumber);

  const [session, setSession] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tableNumber]);

  async function loadData() {
    setLoading(true);

    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("table_number", tableNumber)
      .eq("status", "open")
      .order("opened_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      setMessage(sessionError.message);
      setLoading(false);
      return;
    }

    const { data: categoryData, error: categoryError } = await supabase
      .from("menu_categories")
      .select("*")
      .order("sort_order");

    const { data: menuData, error: menuError } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true);

    if (categoryError || menuError) {
      setMessage(categoryError?.message || menuError?.message);
      setLoading(false);
      return;
    }

    setSession(sessionData);
    setCategories(categoryData || []);
    setMenuItems(menuData || []);
    setLoading(false);
  }

  function addToCart(item) {
    setCart((current) => {
      const found = current.find((x) => x.id === item.id);

      if (found) {
        return current.map((x) =>
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(id) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  async function submitOrder() {
    if (!session) {
      setMessage("ไม่พบโต๊ะที่เปิดอยู่");
      return;
    }

    if (cart.length === 0) {
      setMessage("กรุณาเลือกอาหาร");
      return;
    }

    const { error } = await supabase.from("orders").insert({
      session_id: session.id,
      table_number: tableNumber,
      items: cart,
      total,
      status: "received",
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setCart([]);
    setMessage("ส่งออเดอร์ไปที่ครัวเรียบร้อยแล้ว");
  }

  if (loading) {
    return <main className="container">กำลังโหลด...</main>;
  }

  if (!session) {
    return (
      <main className="container">
        <h1>โต๊ะ {tableNumber}</h1>
        <p className="error">
          โต๊ะนี้ยังไม่ได้เปิดใช้งาน หรือ Session ถูกปิดแล้ว
        </p>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>🍣 ซูชิวังหน้า</h1>
      <h2>โต๊ะ {tableNumber}</h2>

      {categories.map((category) => {
        const items = menuItems.filter(
          (item) => item.category_id === category.id
        );

        if (items.length === 0) return null;

        return (
          <section key={category.id} style={{ marginBottom: 24 }}>
            <h2>{category.name}</h2>

            <div className="grid">
              {items.map((item) => (
                <div className="card menu-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p className="muted">{item.description}</p>
                    <strong>{Number(item.price).toLocaleString()} บาท</strong>
                  </div>

                  <button onClick={() => addToCart(item)}>เพิ่ม</button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <section className="card">
        <h2>ตะกร้า</h2>

        {cart.length === 0 ? (
          <p className="muted">ยังไม่มีรายการ</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} style={{ marginBottom: 8 }}>
              {item.name} × {item.quantity}
              {" = "}
              {(item.price * item.quantity).toLocaleString()} บาท
              {" "}
              <button onClick={() => removeFromCart(item.id)}>-</button>
            </div>
          ))
        )}

        <h3>รวม {total.toLocaleString()} บาท</h3>

        <button onClick={submitOrder} disabled={cart.length === 0}>
          ส่งออเดอร์
        </button>

        {message && <p className="success">{message}</p>}
      </section>
    </main>
  );
}
