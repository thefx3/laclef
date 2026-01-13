export function FeaturedSidebar() {
  return (
    <nav className="flex h-full w-full flex-col rounded-xl border bg-white shadow-sm lg:w-64">
      <div className="rounded-t-md bg-black py-4 text-center text-xl font-bold uppercase tracking-[0.25em] text-white">
        A la une
      </div>

      <div className="h-80 items-center justify-center">
        <p className="text-center text-sm text-gray-500">Rien pour le moment</p>
      </div>
    </nav>
  );
}
