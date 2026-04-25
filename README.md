# 📄 SAR Generator

A web application to generate **Quarterly Self Assessment Report (SAR)** in PDF format based on the official FORM-3-(2024) template.

---

## 🚀 Features

* 📋 Multi-step form (Basics → Courses → Entries → Proofs → Review)
* 💾 Auto save draft
* 📄 Generate **pixel-perfect PDF**
* 🖊 Upload signature
* ✔ Quarter & Role selection (Asst. Professor / Professor)
* 🖼 Attach proof images (multi-page PDF support)
* 📱 Fully responsive (mobile-friendly)

---

## 🛠 Tech Stack

* **Frontend:** React + TypeScript + Tailwind CSS
* **Backend (logic):** pdf-lib (client-side PDF generation)
* **State Management:** React Hooks
* **File Upload:** Local / Cloud storage
* **Icons:** Lucide React

---

## 📂 Project Structure

```
src/
 ├── components/
 ├── pages/
 ├── lib/
 │    ├── sarPdf.ts       # PDF generation
 │    ├── sarTemplate.ts  # Data structure
 │    └── draftStorage.ts # Save/load draft
 ├── assets/
 └── main.tsx
```

---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/sar-generator.git
cd sar-generator
npm install
npm run dev
```

---

## 📄 Usage

1. Fill in basic details
2. Enter course details (16 rows)
3. Add class entries
4. Upload proofs & signature
5. Click **Generate PDF**

---

## 📸 Output

* Page 1 → Course details
* Page 2 → Entries + declaration
* Page 3+ → Proof attachments
* ✔ Signature & role included

---

## ⚠️ Important Notes

* `.env`, `node_modules`, `.workspace` are ignored
* Ensure images are uploaded before generating PDF
* Works best in modern browsers

---

## 🌐 Deployment : https://sar-report-generate.vercel.app

---

## 🤝 Contribution

Feel free to fork and improve the project!

---

## 📧 Contact

**GMVKM-IT (Wing)** 
gudiyatham.officetoc@gmail.com
Project: SAR Generator
