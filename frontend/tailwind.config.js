/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // src 폴더 안의 모든 파일을 감시
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF5722', // NiKit 오렌지색 등록
      },
    },
  },
  plugins: [],
}