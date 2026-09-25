# Sushi Wangna

ระบบสั่งอาหารด้วย QR Code + จอจัดออเดอร์แบบ Realtime สำหรับโปรเจกต์ “ซูชิวังหน้า”

## 1. ติดตั้ง

```bash
npm install
```

## 2. ตั้งค่า Supabase

คัดลอก:

```text
.env.example
```

เป็น:

```text
.env.local
```

แล้วใส่ค่า:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3. สร้างฐานข้อมูล

เปิด Supabase:

```text
SQL Editor → New Query
```

แล้วนำไฟล์:

```text
supabase/schema.sql
```

ไปรัน

## 4. รันเว็บ

```bash
npm run dev
```

เปิด:

```text
http://localhost:3000
```

## Routes

```text
/
 /generate-qr
 /order/[tableNumber]
 /kitchen
 /dashboard
```

## หมายเหตุ

นี่เป็น MVP สำหรับการเรียนรู้/ต้นแบบ ก่อนใช้งานจริงควรเพิ่ม Authentication, RLS policies ที่เหมาะสม, การจัดการสิทธิ์พนักงาน และระบบชำระเงินที่ปลอดภัย
