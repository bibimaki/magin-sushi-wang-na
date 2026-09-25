import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <h1>🍣 ซูชิวังหน้า</h1>
      <p className="muted">
        QR Ordering & Real-time Order Management System
      </p>

      <nav className="nav">
        <Link href="/generate-qr">จัดการโต๊ะ / สร้าง QR</Link>
        <Link href="/kitchen">จอครัว</Link>
        <Link href="/dashboard">Dashboard</Link>
      </nav>

      <div className="card">
        <h2>Flow ระบบ</h2>
        <p>เปิดโต๊ะ → ลูกค้าสแกน QR → สั่งอาหาร → ครัวรับออเดอร์ → จัดเสิร์ฟ</p>
      </div>
    </main>
  );
}
