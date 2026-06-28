/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  
}

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // ใช้ font-display สำหรับหัวข้อตัวโตๆ
        display: ['Lexend', 'Prompt', 'sans-serif'],
        // ใช้ font-body สำหรับเนื้อหาและตัวเลขทั่วไป
        body: ['Inter', 'Sarabun', 'sans-serif'],
      },
    },
  },
}