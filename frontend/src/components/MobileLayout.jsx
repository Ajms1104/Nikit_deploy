function MobileLayout({ children }) {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100">
      <div className="max-w-[430px] w-full mx-auto min-h-screen bg-white shadow-xl relative">{children}</div>
    </div>
  )
}

export default MobileLayout
